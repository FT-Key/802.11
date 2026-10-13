import { useState, useEffect, useRef, useCallback } from 'react'
import { PlayIcon, PauseIcon, RestartIcon, ChevLIcon, ChevRIcon, ClockIcon, DiceIcon, ShieldIcon, CheckIcon, LaptopIcon, PhoneIcon, ApIcon, MuteIcon } from './icons.jsx'
import Term from './Term.jsx'

const scenarios = {
  idle: {
    label: 'Canal libre → éxito',
    desc: 'El canal está libre. La estación espera DIFS, manda RTS, recibe CTS, transmite los datos y recibe ACK.',
  },
  busy: {
    label: 'Canal ocupado → backoff',
    desc: 'Otra estación está transmitiendo. STA-X debe esperar un backoff aleatorio que descuenta solo.',
  },
  norts: {
    label: 'Sin CTS → reintento',
    desc: 'El AP no responde al RTS. El CW se duplica y se reintenta con un backoff más grande.',
  },
}

const baseSteps = {
  idle: [
    {
      key: 'sense',
      title: 'STA tiene datos y escucha el canal (CCA)',
      text: 'Antes de transmitir, la estación mide la energía del canal y busca preámbulos 802.11: eso es el Clear Channel Assessment.',
      medium: 'free',
      mediumLabel: 'Canal libre — energía < umbral',
      sta: 'active',
      nav: null,
      bo: null,
    },
    {
      key: 'difs',
      title: 'Espera DIFS antes de hablar',
      text: 'Aunque esté libre, no habla de inmediato: respeta el Distributed Inter-Frame Space. DIFS = SIFS + 2×slot: 28 µs en 2.4 GHz con OFDM (50 µs en 802.11b viejo, 34 µs en 5 GHz). Si alguien habla en ese lapso, vuelve a escuchar.',
      medium: 'free',
      mediumLabel: 'Canal libre — esperando DIFS (28 µs)',
      sta: 'active',
      nav: null,
      bo: null,
    },
    {
      key: 'rts',
      title: 'Transmite RTS (Request to Send)',
      text: 'Envía el RTS con Duration = tiempo estimado de CTS + DATA + ACK. Así reserva el medio para toda la transacción.',
      medium: 'rts',
      mediumLabel: 'RTS → "¿puedo hablar?" · Duration = 264 µs',
      sta: 'active',
      nav: null,
      bo: null,
      pill: { dir: 'fwd', cls: 'p-rts', label: 'RTS' },
    },
    {
      key: 'cts',
      title: 'El AP responde CTS (Clear to Send)',
      text: 'El AP contesta CTS con su Duration actualizado. Todas las estaciones que lo escuchan activan su NAV y se quedan calladas.',
      medium: 'cts',
      mediumLabel: 'CTS → "adelante" · Duration = 212 µs',
      sta: 'active',
      nav: { staX: 212, staY: 212 },
      bo: null,
      pill: { dir: 'bwd', cls: 'p-cts', label: 'CTS' },
    },
    {
      key: 'nav',
      title: 'NAV activo en las demás estaciones',
      text: 'El Network Allocation Vector es un temporizador virtual: las demás suman el Duration a su NAV y no compiten aunque oigan silencio.',
      medium: 'free',
      mediumLabel: 'Canal reservado — NAV corriendo',
      sta: 'nav',
      nav: { staX: 180, staY: 180 },
      bo: null,
    },
    {
      key: 'data',
      title: 'Transmite los datos (DATA)',
      text: 'Viaja la trama 802.11 completa. El campo Duration se actualiza con el tiempo restante hasta terminar el ACK.',
      medium: 'data',
      mediumLabel: 'DATA → trama 802.11 (1500 B)',
      sta: 'active',
      nav: { staX: 120, staY: 120 },
      bo: null,
      pill: { dir: 'fwd', cls: 'p-data', label: 'DATA' },
    },
    {
      key: 'ack',
      title: 'El AP confirma con ACK',
      text: 'Si el FCS cierra, el AP manda ACK tras un SIFS. Sin ACK, la estación asume colisión y retransmite (hasta unas 7 veces).',
      medium: 'ack',
      mediumLabel: 'ACK → "recibido OK"',
      sta: 'active',
      nav: { staX: 0, staY: 0 },
      bo: null,
      pill: { dir: 'bwd', cls: 'p-ack', label: 'ACK' },
    },
    {
      key: 'done',
      title: 'Transacción completa',
      text: 'RTS → CTS → DATA → ACK. El NAV expiró, el canal queda libre y cualquiera puede competir tras un DIFS.',
      medium: 'free',
      mediumLabel: 'Canal libre — NAV expirado',
      sta: null,
      nav: null,
      bo: null,
    },
  ],
  busy: [
    {
      key: 'data-other',
      title: 'STA-Y está transmitiendo (canal ocupado)',
      text: 'STA-X quiere enviar pero su CCA detecta energía sobre el umbral. La norma prohíbe interrumpir.',
      medium: 'busy',
      mediumLabel: 'Canal ocupado — STA-Y transmite',
      sta: 'idle',
      other: 'active',
      nav: null,
      bo: null,
      pill: { dir: 'fwd', cls: 'p-data', label: 'DATA · STA-Y' },
    },
    {
      key: 'defer',
      title: 'STA-X difiere y espera DIFS',
      text: 'Espera a que el intercambio ajeno termine y el canal quede libre durante un DIFS completo.',
      medium: 'busy',
      mediumLabel: 'Canal ocupado — STA-X difiere',
      sta: 'idle',
      other: 'active',
      nav: null,
      bo: null,
    },
    {
      key: 'random',
      title: 'Backoff aleatorio: sortea los slots',
      text: 'Canal libre: STA-X sortea un número entre 0 y CW-1. Con CW inicial = 15, le toca el 9. Mirá cómo descuenta solo.',
      medium: 'free',
      mediumLabel: 'Sorteo: backoff = 9 slots',
      sta: 'backoff',
      other: null,
      nav: null,
      bo: { total: 9, chosen: 9, cw: 'CW = 15' },
    },
    {
      key: 'countdown2',
      title: 'El backoff llega a 0: ganó el canal',
      text: 'Descontó 9 slots de 9 µs (= 81 µs) escuchando silencio. Contador en cero = prioridad para hablar.',
      medium: 'free',
      mediumLabel: 'Backoff = 0 — STA-X tiene prioridad',
      sta: 'active',
      other: null,
      nav: null,
      bo: { total: 9, chosen: 9, cw: 'CW = 15', done: true },
    },
    {
      key: 'rts2',
      title: 'Intercambio completo protegido por NAV',
      text: 'Con el canal ganado, hace RTS → CTS → DATA → ACK. El NAV protege el resto de la conversación.',
      medium: 'data',
      mediumLabel: 'RTS/CTS/DATA/ACK bajo NAV',
      sta: 'active',
      other: null,
      nav: { staX: 200, staY: 200 },
      bo: null,
      pill: { dir: 'fwd', cls: 'p-data', label: 'DATA' },
    },
  ],
  norts: [
    {
      key: 'rts-send',
      title: 'STA-X envía RTS',
      text: 'Canal libre, DIFS respetado, RTS transmitido pidiendo reservar el medio.',
      medium: 'rts',
      mediumLabel: 'RTS enviado — esperando CTS…',
      sta: 'active',
      nav: null,
      bo: null,
      pill: { dir: 'fwd', cls: 'p-rts', label: 'RTS' },
    },
    {
      key: 'no-cts',
      title: 'No llega CTS (timeout)',
      text: 'El RTS pudo chocar con otra trama o el AP estaba ocupado. Expira el timeout y la estación declara el intento fallido.',
      medium: 'busy',
      mediumLabel: 'Sin respuesta — timeout CTS',
      sta: 'idle',
      nav: null,
      bo: null,
    },
    {
      key: 'cw-double',
      title: 'CW se duplica: 15 → 31',
      text: 'Backoff exponencial: el Contention Window se duplica tras cada fallo (hasta CWmax = 1023). Más rango = menos chance de repetir la colisión.',
      medium: 'free',
      mediumLabel: 'CW: 15 → 31 · sortea de nuevo',
      sta: 'backoff',
      nav: null,
      bo: { total: 14, chosen: 14, cw: 'CW = 31', grown: true },
    },
    {
      key: 'retry-ok',
      title: 'Reintento exitoso',
      text: 'Descuenta los 14 slots (126 µs), reintenta el RTS y esta vez completa todo. Límite típico: 7 reintentos; después el paquete se descarta y TCP lo reenvía solo.',
      medium: 'ack',
      mediumLabel: 'RTS/CTS/DATA/ACK completados',
      sta: 'active',
      nav: { staX: 0, staY: 0 },
      bo: { total: 14, chosen: 14, cw: 'CW = 31', done: true },
      pill: { dir: 'bwd', cls: 'p-ack', label: 'ACK' },
    },
  ],
}

const TICK_MS = 240
const HOLD_TICKS = 12

export default function SlideCSMACA() {
  const [scenario, setScenario] = useState('idle')
  const [stepIdx, setStepIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [boCount, setBoCount] = useState(0)
  const boRef = useRef(0)
  const tickRef = useRef(0)
  const stepIdxRef = useRef(stepIdx)
  useEffect(() => {
    stepIdxRef.current = stepIdx
  }, [stepIdx])

  const steps = baseSteps[scenario]
  const cur = steps[stepIdx]

  const resetCounters = useCallback((toStep) => {
    boRef.current = 0
    tickRef.current = 0
    const st = baseSteps[scenario][toStep]
    setBoCount(st && st.bo && st.bo.done ? st.bo.total : 0)
  }, [scenario])

  const stopPlay = useCallback(() => {
    setPlaying(false)
  }, [])

  const play = useCallback(() => {
    if (stepIdx >= steps.length - 1) {
      setStepIdx(0)
      resetCounters(0)
    }
    tickRef.current = 0
    setPlaying(true)
  }, [stepIdx, steps.length, resetCounters])

  /* motor único: descuenta backoff slot por slot; si no hay backoff, espera y avanza */
  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      const st = baseSteps[scenario][stepIdxRef.current]
      if (st.bo && !st.bo.done) {
        if (boRef.current < st.bo.total) {
          boRef.current += 1
          setBoCount(boRef.current)
          return
        }
      } else {
        tickRef.current += 1
        if (tickRef.current < HOLD_TICKS) return
      }
      boRef.current = 0
      tickRef.current = 0
      setBoCount(0)
      setStepIdx((s) => {
        if (s >= baseSteps[scenario].length - 1) {
          setPlaying(false)
          return s
        }
        const nxt = baseSteps[scenario][s + 1]
        if (nxt.bo && nxt.bo.done) setBoCount(nxt.bo.total)
        return s + 1
      })
    }, TICK_MS)
    return () => clearInterval(id)
  }, [playing, scenario])

  const gotoStep = (i) => {
    stopPlay()
    const next = Math.max(0, Math.min(steps.length - 1, i))
    setStepIdx(next)
    resetCounters(next)
  }

  const switchScenario = (key) => {
    stopPlay()
    setScenario(key)
    setStepIdx(0)
    boRef.current = 0
    tickRef.current = 0
    setBoCount(0)
  }

  const shownBo = cur.bo ? (cur.bo.done ? cur.bo.total : playing ? boCount : cur.bo.total > 0 && boCount > 0 ? boCount : 0) : 0
  const boTotal = cur.bo ? cur.bo.total : 0
  const boSlotsShown = Math.min(boTotal + 1, 16)
  const boHidden = boTotal + 1 - boSlotsShown

  return (
    <div>
      <span className="kicker">Slide 05 · Acceso al medio</span>
      <h2 className="slide-title">CSMA/CA — <span className="hl-amber">evitar</span> colisiones, no detectarlas</h2>
      <p className="slide-sub">Elegí un escenario y dale Play: el backoff descuenta slot por slot y las tramas vuelan entre estaciones</p>

      <div className="scenario-toggles">
        {Object.entries(scenarios).map(([key, s]) => (
          <button
            key={key}
            className={`scenario-btn ${scenario === key ? 'active' : ''}`}
            onClick={() => switchScenario(key)}
          >
            {key === 'idle' && <CheckIcon size={14} />}
            {key === 'busy' && <DiceIcon size={14} />}
            {key === 'norts' && <ClockIcon size={14} />}
            {s.label}
          </button>
        ))}
      </div>

      <div className="csma-layout">
        <div className="csma-stage">
          <div className="journey-controls" style={{ marginBottom: 12 }}>
            <button className="play-btn" onClick={playing ? stopPlay : play}>
              {playing ? <><PauseIcon size={15} /> Pausar</> : stepIdx >= steps.length - 1 ? <><RestartIcon size={15} /> Reiniciar</> : <><PlayIcon size={15} /> Play</>}
            </button>
            <button className="step-btn" onClick={() => gotoStep(stepIdx - 1)} disabled={stepIdx === 0}>
              <ChevLIcon size={14} />
            </button>
            <button className="step-btn" onClick={() => gotoStep(stepIdx + 1)} disabled={stepIdx >= steps.length - 1}>
              <ChevRIcon size={14} />
            </button>
            <span className="step-label">Paso {stepIdx + 1} / {steps.length}</span>
          </div>

          <div className="stations-row">
            {cur.pill && (
              <span key={`${scenario}-${stepIdx}`} className={`fly-pill ${cur.pill.dir} ${cur.pill.cls}`}>
                {cur.pill.label}
              </span>
            )}
            <div className={`station ${cur.sta === 'active' ? 'active' : ''} ${cur.sta === 'backoff' ? 'nav-set' : ''}`}>
              <div className="st-icon"><LaptopIcon size={26} /></div>
              <div className="st-name">STA-X</div>
              <div className="st-role">quiere transmitir</div>
              {cur.nav && cur.nav.staX > 0 && (
                <>
                  <div className="nav-timer">NAV · {cur.nav.staX} µs</div>
                  <div className="nav-drain"><span key={`${scenario}-${stepIdx}-x`} /></div>
                </>
              )}
              {cur.bo && (
                <>
                  <div className="backoff-slots">
                    {Array.from({ length: boSlotsShown }).map((_, i) => (
                      <span
                        key={i}
                        className={`bo-slot ${i < shownBo && i < boSlotsShown ? 'elapsed' : ''} ${i === shownBo && shownBo < boTotal ? 'current' : ''}`}
                      />
                    ))}
                    {boHidden > 0 && <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', alignSelf: 'center' }}>+{boHidden}</span>}
                  </div>
                  <div className="bo-count">
                    {shownBo}/{boTotal} slots · {boTotal * 9} µs
                  </div>
                  <div><span key={`${scenario}-${stepIdx}-cw`} className={`cw-badge ${cur.bo.grown ? 'grown' : ''}`}>{cur.bo.cw}</span></div>
                </>
              )}
            </div>

            <div className={`station ${cur.sta === 'nav' ? 'nav-set' : ''} ${cur.other === 'active' ? 'speaking' : ''}`}>
              <div className="st-icon"><PhoneIcon size={26} /></div>
              <div className="st-name">STA-Y</div>
              <div className="st-role">otra estación</div>
              {cur.nav && cur.nav.staY > 0 && (
                <>
                  <div className="nav-timer">NAV · {cur.nav.staY} µs</div>
                  <div className="nav-drain"><span key={`${scenario}-${stepIdx}-y`} /></div>
                </>
              )}
              {cur.sta === 'nav' && (
                <div className="nav-quiet"><MuteIcon size={12} /> callada (NAV)</div>
              )}
            </div>

            <div className={`station ${cur.medium === 'cts' || cur.medium === 'ack' ? 'speaking' : ''}`}>
              <div className="st-icon"><ApIcon size={26} /></div>
              <div className="st-name">AP</div>
              <div className="st-role">00:1A:2B:3C:4D:5E</div>
            </div>
          </div>

          <div className="medium">
            <div className={`medium-bar ${cur.medium || 'free'}`}>
              {cur.mediumLabel}
              {cur.medium !== 'free' ? <span className="medium-pulse" /> : null}
            </div>
          </div>

          <div className="csma-steps">
            {steps.map((s, i) => (
              <div key={s.key} className={`csma-step ${i === stepIdx ? 'active' : ''} ${i < stepIdx ? 'done' : ''}`}>
                <span className="idx">{i < stepIdx ? '✓' : i + 1}</span>
                <span>{s.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="csma-side">
          <div className="csma-explain">
            <h3><ClockIcon size={16} /> {cur.title}</h3>
            <p>{cur.text}</p>
            <div className="mini">{scenarios[scenario].desc}</div>
          </div>

          <div className="csma-explain">
            <h3><DiceIcon size={16} /> ¿Cómo se sortea el backoff?</h3>
            <p>
              El número de slots se sortea uniforme en <strong>[0, CW]</strong> y descuenta de a 1 por slot:
            </p>
            <div className="mini">
              <p style={{ margin: '0 0 6px' }}>
                <strong>Slot time:</strong> 9 µs (OFDM) — el "tic" del sistema
              </p>
              <p style={{ margin: '0 0 6px' }}>
                <strong>CWmin → CWmax:</strong> 15 → 1023. Tras cada fallo, el CW se duplica
              </p>
              <p style={{ margin: 0 }}>
                <strong>Ejemplo:</strong> backoff 9 → 9 × 9 µs = 81 µs escuchando silencio
              </p>
            </div>
            <div className="duration-explainer">
              <h4><ShieldIcon size={14} /> Campo Duration / NAV</h4>
              <div className="formula-chip">Duration = SIFS + CTS + SIFS + DATA + SIFS + ACK</div>
              <p>
                El RTS anuncia cuánto durará todo; el AP lo ajusta en el CTS. Quien lo escucha carga ese
                valor en su <Term def="Network Allocation Vector: temporizador virtual que prohíbe hablar hasta que expire.">NAV</Term>:
                un cronómetro que prohíbe competir aunque el aire se escuche libre. Así nadie "invade"
                una transacción en curso.
              </p>
            </div>
            <div className="mini-gloss">
              <h4>Mini-glosario del simulador</h4>
              <div className="mg-row"><span className="mg-term">Slot</span><span className="mg-def">tic mínimo del Wi-Fi: 9 µs. El backoff descuenta de a 1.</span></div>
              <div className="mg-row"><span className="mg-term">CW</span><span className="mg-def">ventana del sorteo (15→1023). Cada fallo la duplica.</span></div>
              <div className="mg-row"><span className="mg-term">DIFS / SIFS</span><span className="mg-def">silencios obligatorios: largo antes de competir, corto dentro del intercambio.</span></div>
              <div className="mg-row"><span className="mg-term">RTS / CTS</span><span className="mg-def">"¿puedo hablar?" / "adelante". Reservan el canal.</span></div>
              <div className="mg-row"><span className="mg-term">NAV</span><span className="mg-def">cronómetro que te calla aunque oigas silencio.</span></div>
              <div className="mg-row"><span className="mg-term">ACK</span><span className="mg-def">confirmación del receptor. Sin ACK = reintento.</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
