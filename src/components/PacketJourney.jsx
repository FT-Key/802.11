import { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react'
import { PlayIcon, PauseIcon, RestartIcon, ChevLIcon, ChevRIcon, InfoIcon, CheckIcon } from './icons.jsx'
import Term from './Term.jsx'

const AP_BSSID = '00:1A:2B:3C:4D:5E'
const FOREIGN_BSSID = '00:9F:77:12:AA:01'

const frameFields = [
  {
    id: 'fc',
    label: 'Frame Control',
    short: 'FC',
    cls: 'ff-fc',
    size: '2 bytes',
    info: (
      <>
        Tipo de trama (datos, gestión o control), subtipo y banderas To DS / From DS, retry, etc.
        Es el "encabezado de control": dice <em>qué clase de trama es</em> antes de leer el resto.
      </>
    ),
  },
  {
    id: 'dur',
    label: 'Duration / ID',
    short: 'Dur',
    cls: 'ff-dur',
    size: '2 bytes',
    info: (
      <>
        Tiempo en µs que el canal debe quedar reservado: es el valor del{' '}
        <Term def="Network Allocation Vector: temporizador virtual que prohíbe hablar hasta que expire.">NAV</Term>.
        Las estaciones que lo escuchan se callan durante ese período aunque oigan silencio.
      </>
    ),
  },
  {
    id: 'a1',
    label: 'Address 1 (receptor)',
    short: 'A1',
    cls: 'ff-a1',
    size: '6 bytes',
    info: <>Dirección del receptor (RA). En subida hacia el AP es la MAC del AP: si no coincide con la suya, la ignora.</>,
  },
  {
    id: 'a2',
    label: 'Address 2 (transmisor)',
    short: 'A2',
    cls: 'ff-a2',
    size: '6 bytes',
    info: <>Dirección del transmisor (TA): la MAC de tu placa Wi-Fi. El AP la usa para saber a quién devolver el ACK.</>,
  },
  {
    id: 'a3',
    label: 'Address 3 (filtro)',
    short: 'A3',
    cls: 'ff-a3',
    size: '6 bytes',
    info: (
      <>
        Tercera dirección: en ad-hoc lleva el{' '}
        <Term def="Basic Service Set Identifier: la dirección MAC de la red inalámbrica del AP.">BSSID</Term>; en
        infraestructura lleva el destino final (subida) o la fuente original (bajada), según To/From DS.
      </>
    ),
  },
  {
    id: 'seq',
    label: 'Sequence Control',
    short: 'Seq',
    cls: 'ff-seq',
    size: '2 bytes',
    info: <>Número de secuencia + número de fragmento. Sirve para reensamblar fragmentos y descartar duplicados (reintentos).</>,
  },
  {
    id: 'body',
    label: 'Frame Body',
    short: 'Body',
    cls: 'ff-body',
    size: '0–2304 bytes',
    info: <>La carga útil: aquí viaja el datagrama IP completo (con su TCP/UDP y los datos de la app). Es lo que importa transportar.</>,
  },
  {
    id: 'fcs',
    label: 'FCS',
    short: 'FCS',
    cls: 'ff-fcs',
    size: '4 bytes',
    info: (
      <>
        <Term def="Frame Check Sequence: huella CRC-32 de toda la trama. Si no coincide, la trama se descarta sin ACK.">FCS</Term>:
        huella matemática de la trama. Si el receptor calcula otro valor, descarta todo y el emisor reintenta.
      </>
    ),
  },
]

const steps = [
  {
    key: 'app',
    layer: 'Aplicación',
    layerTag: 'amber',
    title: 'La app genera datos',
    text: 'Escribís un mensaje en el chat. La app no sabe nada de Wi-Fi: solo entrega bytes al sistema operativo a través de un socket.',
    details: [
      <>La app escribe bytes en un <Term def="Canal de software por el que una app envía y recibe datos de red, sin saber nada de Wi-Fi.">socket</Term>, sin saber de radios ni tramas</>,
      'Ejemplo: "Hola, ¿llegas?" (15 bytes en UTF-8)',
      'El SO los encola en el buffer del protocolo de transporte',
    ],
  },
  {
    key: 'tp',
    layer: 'Transporte (TCP/UDP)',
    layerTag: 'orange',
    title: 'TCP o UDP encapsulan',
    text: 'El transporte agrega su cabecera con puertos (identifican la app) y, en TCP, secuencia, ACK y ventana.',
    details: [
      <>TCP: confiable, con <Term def="Apretón de manos inicial de TCP (SYN, SYN-ACK, ACK) para abrir la conexión.">handshake</Term>, retransmisiones y control de flujo</>,
      <>UDP: sin conexión, mínimo overhead — <Term def="Voz sobre IP: llamadas por internet (WhatsApp, Discord, juegos online).">VoIP</Term>, gaming, streaming en vivo</>,
      'Cabecera TCP = 20 bytes mínimo · UDP = solo 8 bytes',
    ],
  },
  {
    key: 'ip',
    layer: 'Red (IP)',
    layerTag: 'cyan',
    title: 'IP encapsula y configura el destino',
    text: 'La capa IP agrega origen, destino, TTL y protocolo. La "configuración" (IP, máscara, gateway) ya la entregó DHCP al conectarse al Wi-Fi.',
    details: [
      'Origen 192.168.1.50 · destino: el servidor (ej. 142.250.80.46)',
      <>Destino fuera de la LAN → el <Term def="Puerta de enlace: el router que saca tu tráfico hacia otras redes e internet.">gateway</Term> es el siguiente salto</>,
      <><Term def="Time To Live: contador que baja 1 en cada router; si llega a 0 el paquete muere. Evita bucles infinitos.">TTL</Term> evita bucles: baja en cada router</>,
    ],
  },
  {
    key: 'mac',
    layer: 'Subcapa MAC (802.11)',
    layerTag: 'cyan',
    title: 'La MAC arma la trama 802.11',
    text: 'Antes de salir al aire, la MAC construye la trama: direcciones, secuencia, Duration (reserva del medio) y FCS. Tocá cada campo.',
    details: [
      <>La MAC también decide cuándo hablar (<Term def="Escucha el canal y evita colisiones antes de transmitir.">CSMA/CA</Term>, <Term def="Espera aleatoria de N slots cuando el canal está ocupado.">backoff</Term>, <Term def="'¿Puedo hablar?' / 'Adelante': apretón de manos que reserva el canal.">RTS/CTS</Term>)</>,
      'Address 1 = AP · Address 2 = tu placa · Address 3 = BSSID',
      <>El campo <Term def="Microsegundos que el canal queda reservado para la transacción.">Duration</Term> reserva el canal (<Term def="Cronómetro virtual que prohíbe hablar hasta que expire.">NAV</Term>) · <Term def="Huella CRC-32: si no coincide, la trama se descarta.">FCS</Term> detecta errores</>,
    ],
  },
  {
    key: 'phy',
    layer: 'Capa Física (PHY)',
    layerTag: 'green',
    title: 'PHY modula y codifica la señal',
    text: 'Los bits se protegen contra errores, se reparten en subportadoras y se convierten en ondas de radio listas para la antena.',
    details: [
      <><Term def="Forward Error Correction: redundancia que corrige errores sin reenviar. LDPC es el código moderno.">Codificación FEC/LDPC</Term>: redundancia para corregir errores sin reenviar</>,
      <><Term def="Reordena bits para que un error puntual no destruya un símbolo entero.">Interleaving</Term>: dispersa bits para que un error puntual no arruine un <Term def="Unidad mínima que viaja por el aire: cada símbolo QAM lleva varios bits.">símbolo</Term></>,
      <><Term def="Modulación que combina amplitud y fase: más bits por símbolo, más velocidad, más sensible al ruido.">QAM</Term>: más bits por símbolo = más velocidad, más sensible al ruido</>,
      <><Term def="Divide el canal en subportadoras paralelas.">OFDM</Term>: ~52 <Term def="Cada subdivisión del canal OFDM, con sus propios símbolos en paralelo.">subportadoras</Term> paralelas (en 20 MHz), robusta al multitrayecto</>,
    ],
  },
  {
    key: 'ap',
    layer: 'Access Point',
    layerTag: 'amber',
    title: 'El AP recibe y decide si es para él',
    text: 'El AP demodula, valida el FCS y compara direcciones: si el BSSID coincide con el suyo, la procesa; si es de otra red, la ignora.',
    details: [
      <>1. Demodulación <Term def="Divide la señal en muchas subportadoras paralelas.">OFDM</Term> → bits</>,
      <>2. <Term def="Huella CRC-32 de la trama.">FCS (CRC-32)</Term> → ¿trama íntegra? Si falla: se descarta, sin ACK</>,
      <>3. Address 1 / <Term def="La MAC de la red del AP. El filtro que decide si la trama es de esta red.">BSSID</Term> → ¿es mi red?</>,
      <>4. Si es suya: extrae el datagrama IP y manda <Term def="Confirmación corta del receptor. Sin ACK, el emisor reintenta.">ACK</Term></>,
    ],
  },
  {
    key: 'eth',
    layer: 'Ethernet cableada',
    layerTag: 'green',
    title: 'El AP retransmite por Ethernet',
    text: 'El AP actúa como bridge: convierte la trama 802.11 en Ethernet 802.3 y la inyecta al switch cableado rumbo a internet.',
    details: [
      <>Re-encapsula: trama 802.11 → trama <Term def="El estándar Ethernet cableado: la 'hermana con cables' del 802.11.">Ethernet 802.3</Term></>,
      'El switch la conmuta al puerto correcto (aprende MACs)',
      <>El router la saca a internet (<Term def="El router reemplaza tu IP privada por su IP pública para salir a internet, y traduce la respuesta de vuelta.">NAT</Term> si es LAN privada)</>,
      'El servidor responde; el camino de vuelta es simétrico',
    ],
  },
]

const TAG_STYLE = {
  amber: { background: '#ffe8d3', color: '#c2410c', border: '1px solid #f5c69b' },
  orange: { background: '#fdf0d9', color: '#92400e', border: '1px solid #eed9a8' },
  cyan: { background: '#d9efeb', color: '#0b5f57', border: '1px solid #a9d8d1' },
  green: { background: '#d9f3e3', color: '#15803d', border: '1px solid #a9dfc0' },
}

/* Chip: etiqueta de cabecera tocable que explica qué significa cada campo.
   Usa Term con portal: el tooltip escapa de cualquier overflow:hidden y se
   voltea debajo si no entra arriba. */
function Chip({ cls, label, children }) {
  return (
    <Term
      className="chip"
      buttonClassName={`header-chip chip-btn ${cls}`}
      def={
        <>
          <strong>{children}</strong> — {label}
        </>
      }
    >
      {children}
    </Term>
  )
}

/* ---------- escena de vuelo: el paquete viaja ---------- */
const ROUTE = [
  [86, 158], // laptop
  [268, 66], // pico del tramo aéreo
  [436, 150], // AP
  [452, 214], // baja por el cable
  [600, 214], // servidor
]
/* fracciones exactas de cada nodo sobre la polilínea (sin números mágicos) */
function routeGeometry() {
  const lens = []
  let total = 0
  for (let i = 0; i < ROUTE.length - 1; i++) {
    const [x1, y1] = ROUTE[i]
    const [x2, y2] = ROUTE[i + 1]
    const len = Math.hypot(x2 - x1, y2 - y1)
    lens.push(len)
    total += len
  }
  return { lens, total }
}
const { lens: ROUTE_LENS, total: ROUTE_TOTAL } = routeGeometry()
const POS_AP = (ROUTE_LENS[0] + ROUTE_LENS[1]) / ROUTE_TOTAL
/* El punto solo "descansa" en nodos reales: la modulación ocurre DENTRO
   de la laptop (paso phy), el vuelo se ve en la transición hacia ap/eth */
const STEP_POS = { app: 0, tp: 0, ip: 0, mac: 0, phy: 0, ap: POS_AP, eth: 1 }

function routePointAt(frac) {
  const segs = []
  let total = 0
  for (let i = 0; i < ROUTE.length - 1; i++) {
    const [x1, y1] = ROUTE[i]
    const [x2, y2] = ROUTE[i + 1]
    const len = Math.hypot(x2 - x1, y2 - y1)
    segs.push({ len, from: ROUTE[i], to: ROUTE[i + 1] })
    total += len
  }
  let target = frac * total
  for (const s of segs) {
    if (target <= s.len) {
      const t = s.len === 0 ? 0 : target / s.len
      return [s.from[0] + (s.to[0] - s.from[0]) * t, s.from[1] + (s.to[1] - s.from[1]) * t]
    }
    target -= s.len
  }
  return ROUTE[ROUTE.length - 1]
}

function FlightScene({ stepKey }) {
  const groupRef = useRef(null)
  const fracRef = useRef(STEP_POS[stepKey] ?? 0)
  const rafRef = useRef(null)

  const target = STEP_POS[stepKey] ?? 0
  const processing = stepKey === 'mac' || stepKey === 'phy'
  const atAp = stepKey === 'ap' || stepKey === 'eth'
  const delivered = stepKey === 'eth'

  const placeAt = useCallback((f) => {
    if (groupRef.current) {
      const [x, y] = routePointAt(f)
      groupRef.current.setAttribute('transform', `translate(${x}, ${y})`)
    }
  }, [])

  useLayoutEffect(() => {
    placeAt(fracRef.current)
  }, [placeAt])

  useEffect(() => {
    const from = fracRef.current
    const to = target
    if (from === to) return
    const dur = 1100
    let start = null
    const tick = (ts) => {
      if (start === null) start = ts
      const t = Math.min(1, (ts - start) / dur)
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      const f = from + (to - from) * e
      fracRef.current = f
      placeAt(f)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, placeAt])

  return (
    <div className="flight-scene">
      <svg className="flight-svg" viewBox="0 0 680 250">
        <defs>
          <radialGradient id="dotGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff5f03" stopOpacity="1" />
            <stop offset="45%" stopColor="#ff5f03" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ff5f03" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="airGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0e7c72" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#0e7c72" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0e7c72" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* tramo aire */}
        <path className="flight-path air" d={`M ${ROUTE[0][0]} ${ROUTE[0][1]} L ${ROUTE[1][0]} ${ROUTE[1][1]} L ${ROUTE[2][0]} ${ROUTE[2][1]}`} />
        {/* tramo cable */}
        <path className="flight-path wire" d={`M ${ROUTE[2][0]} ${ROUTE[2][1] + 26} L ${ROUTE[3][0]} ${ROUTE[3][1]} L ${ROUTE[4][0]} ${ROUTE[4][1]}`} />

        {/* laptop */}
        <g>
          <rect x="52" y="132" width="68" height="46" rx="8" fill="#ffffff" stroke={processing ? '#ff5f03' : '#cfc7b0'} strokeWidth="2" />
          <rect x="59" y="139" width="54" height="28" rx="3" fill="#060b18" />
          <rect x="64" y="178" width="44" height="5" rx="2" fill="#cfc7b0" />
          {[{ dx: 70, dy: 148 }, { dx: 86, dy: 148 }, { dx: 102, dy: 148 }].map((p, i) => (
            <rect key={i} x={p.dx} y={p.dy} width="12" height="4" rx="2" fill={stepKey === 'app' || stepKey === 'tp' || stepKey === 'ip' ? '#ff5f03' : '#cfc7b0'} opacity={stepKey === 'app' || stepKey === 'tp' || stepKey === 'ip' ? 1 - i * 0.25 : 0.6} />
          ))}
          <text x="86" y="200" textAnchor="middle" className="flight-node-name">Tu laptop</text>
          <text x="86" y="214" textAnchor="middle" className="flight-node-label">192.168.1.50</text>
        </g>

        {/* AP */}
        <g>
          {atAp && (
            <>
              <circle className="wave-ring emit" cx="436" cy="124" r="26" />
              <circle className="wave-ring emit d2" cx="436" cy="124" r="26" />
            </>
          )}
          <rect x="404" y="128" width="64" height="44" rx="9" fill="#ffffff" stroke={atAp ? '#0e7c72' : '#cfc7b0'} strokeWidth="2" />
          <circle cx="436" cy="124" r="4" fill={atAp ? '#0e7c72' : '#cfc7b0'} />
          <path d="M424 116a17 17 0 0 1 24 0M418 110a25 25 0 0 1 36 0" fill="none" stroke={atAp ? '#0e7c72' : '#cfc7b0'} strokeWidth="2" strokeLinecap="round" />
          <text x="436" y="162" textAnchor="middle" fontSize="9" fill={atAp ? '#0e7c72' : '#55606f'} fontWeight="700">AP · CasaWiFi</text>
          <text x="436" y="200" textAnchor="middle" className="flight-node-name">Access Point</text>
          <text x="436" y="214" textAnchor="middle" className="flight-node-label">{AP_BSSID}</text>
        </g>

        {/* servidor */}
        <g>
          <rect x="566" y="188" width="68" height="52" rx="8" fill="#ffffff" stroke={delivered ? '#16a34a' : '#cfc7b0'} strokeWidth="2" />
          <line x1="566" y1="205" x2="634" y2="205" stroke="#cfc7b0" strokeWidth="1.5" />
          <line x1="566" y1="222" x2="634" y2="222" stroke="#cfc7b0" strokeWidth="1.5" />
          <circle cx="576" cy="196" r="2.5" fill={delivered ? '#16a34a' : '#cfc7b0'} />
          <circle cx="576" cy="213" r="2.5" fill={delivered ? '#16a34a' : '#cfc7b0'} />
          <circle cx="576" cy="230" r="2.5" fill={delivered ? '#16a34a' : '#cfc7b0'} />
          <text x="600" y="200" textAnchor="middle" className="flight-node-name">Servidor</text>
          <text x="600" y="114" textAnchor="middle" className="flight-node-label">internet</text>
        </g>

        {/* nube aire */}
        <ellipse cx="268" cy="66" rx="120" ry="34" fill="url(#airGrad)" opacity="0.5" />
        <text x="268" y="30" textAnchor="middle" fontSize="11" fill="#0e7c72" fontFamily="'Ubuntu Mono', monospace" letterSpacing="2">— AIRE · 5 GHz —</text>
        <text x="540" y="244" textAnchor="middle" fontSize="11" fill="#16a34a" fontFamily="'Ubuntu Mono', monospace" letterSpacing="2">— CABLE · Ethernet —</text>

        {/* el paquete */}
        <g ref={groupRef}>
          <circle r="16" fill="url(#dotGlow)" opacity="0.9" />
          <circle r="6.5" fill="#ff5f03" stroke="#ffffff" strokeWidth="2" />
        </g>
      </svg>
      <div className="flight-caption">
        {stepKey === 'app' && <>El dato nace en la laptop — todavía no salió a ningún lado</>}
        {stepKey === 'tp' && <>El transporte lo envuelve — <strong>sigue dentro del SO</strong></>}
        {stepKey === 'ip' && <>IP decide el destino — <strong>sigue dentro del SO</strong></>}
        {stepKey === 'mac' && <>Trama 802.11 lista — <strong>en la cola de la placa Wi-Fi</strong></>}
        {stepKey === 'phy' && <>Modulando <strong>dentro de la placa</strong> — todavía no salió al aire</>}
        {stepKey === 'ap' && <>El AP lo capturó — ahora decide <strong>¿es para mí?</strong></>}
        {stepKey === 'eth' && <>Convertido a Ethernet — <strong>viaja por cable</strong> al servidor</>}
      </div>
    </div>
  )
}

const PHY_LABELS = [
  '1 · Scrambling', '2 · Codificación FEC', '3 · Interleaving', '4 · Mapeo QAM', '5 · IFFT → OFDM', '6 · Señal RF',
]

/* pipeline PHY: se enciende chip por chip al montarse */
function PhyPipeline() {
  const [lit, setLit] = useState(0)
  useEffect(() => {
    const id = setInterval(() => {
      setLit((v) => {
        if (v >= PHY_LABELS.length) {
          clearInterval(id)
          return v
        }
        return v + 1
      })
    }, 420)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="phy-steps">
      {PHY_LABELS.map((label, i) => (
        <span key={label} className={`phy-chip ${lit > i ? 'on' : ''}`}>{label}</span>
      ))}
    </div>
  )
}

/* match de BSSID carácter por carácter al montarse */
function BssidMatch() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const id = setInterval(() => {
      setCount((v) => {
        if (v >= AP_BSSID.length) {
          clearInterval(id)
          return v
        }
        return v + 1
      })
    }, 90)
    return () => clearInterval(id)
  }, [])
  return (
    <>
      <div className="bssid-match" aria-label={`BSSID propio ${AP_BSSID}`}>
        {AP_BSSID.split('').map((ch, i) => (
          <span key={i} className={`ch ${i < count ? 'hit' : ''}`}>{ch}</span>
        ))}
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6, fontFamily: 'var(--mono)' }}>
        A1 de la trama = mi BSSID → <strong style={{ color: 'var(--green)' }}>¡ES PARA MÍ!</strong>
      </div>
      <div className="bssid-match" style={{ marginTop: 8 }} aria-label={`BSSID ajeno ${FOREIGN_BSSID}`}>
        {FOREIGN_BSSID.split('').map((ch, i) => (
          <span key={i} className={`ch ${i < count ? (FOREIGN_BSSID[i] === AP_BSSID[i] ? 'hit' : 'miss') : ''}`}>{ch}</span>
        ))}
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6, fontFamily: 'var(--mono)' }}>
        Trama vecina de otra red → <strong style={{ color: 'var(--red)' }}>ignorada</strong>
      </div>
    </>
  )
}

export default function PacketJourney() {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [hoverField, setHoverField] = useState(null)
  const timerRef = useRef(null)

  const cur = steps[step]

  const stopPlay = useCallback(() => {
    setPlaying(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const play = useCallback(() => {
    if (step >= steps.length - 1) setStep(0)
    setPlaying(true)
  }, [step])

  useEffect(() => {
    if (!playing) return
    timerRef.current = setInterval(() => {
      setStep((s) => {
        if (s >= steps.length - 1) {
          clearInterval(timerRef.current)
          timerRef.current = null
          setPlaying(false)
          return s
        }
        return s + 1
      })
    }, 3600)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [playing])

  /* pipeline PHY y match BSSID viven en hijos con key={step}: se reinician solos */

  const order = useMemo(() => ['app', 'tp', 'ip', 'mac', 'phy', 'ap', 'eth'], [])
  const showEncap = (key) => order.indexOf(key) <= order.indexOf(cur.key)

  const encapLayers = [
    { key: 'app', cls: 'el-app', name: 'Datos de la aplicación', side: 'Payload', body: <>"Hola, ¿llegas?"</> },
    {
      key: 'tp', cls: 'el-tp', name: 'Transporte · TCP', side: 'segmento',
      body: <><Chip cls="hdr-tp" label="Puerto destino: ¿a qué programa va? El 443 significa web segura (HTTPS). Como el departamento dentro del edificio (la IP).">dport:443</Chip><Chip cls="hdr-tp" label="Número de secuencia: ordena los bytes. Si falta uno en el camino, TCP lo pide de nuevo.">seq:1024</Chip><Chip cls="hdr-tp" label="Acuse de recibo: confirma cuántos bytes ya llegaron bien (0 = es el primer envío).">ack:0</Chip><Chip cls="hdr-tp" label="Ventana: cuántos bytes puede mandar sin esperar respuesta. Así controla el flujo para no ahogar al receptor.">win:64240</Chip>"Hola, ¿llegas?"</>,
    },
    {
      key: 'ip', cls: 'el-ip', name: 'Red · IP', side: 'paquete',
      body: <><Chip cls="hdr-ip" label="IP origen: quién envía. 192.168.1.50 es tu laptop dentro de tu casa.">src 192.168.1.50</Chip><Chip cls="hdr-ip" label="IP destino: quién recibe. Esta es la dirección del servidor en internet.">dst 142.250.80.46</Chip><Chip cls="hdr-ip" label="Time To Live: empieza en 64 y baja 1 en cada router. Si llega a 0, el paquete muere: así se evitan bucles infinitos.">TTL 64</Chip>…</>,
    },
    {
      key: 'mac', cls: 'el-mac', name: 'Subcapa MAC · 802.11', side: 'trama',
      body: <><Chip cls="hdr-mac" label="Address 1 = receptor: la MAC del AP. Si no coincide con ningún AP cercano, la trama se ignora.">A1 AP</Chip><Chip cls="hdr-mac" label="Address 2 = transmisor: la MAC de tu placa Wi-Fi.">A2 STA</Chip><Chip cls="hdr-mac" label="Address 3 = filtro/BSSID: identifica de qué red es la trama.">A3 BSSID</Chip><Chip cls="hdr-mac" label="Duration: microsegundos que el canal queda reservado para esta transacción (el NAV ajeno).">Dur</Chip><Chip cls="hdr-mac" label="FCS: huella CRC-32 de la trama. Si no coincide al recibir, se descarta sin ACK.">FCS</Chip>…</>,
    },
    {
      key: 'phy', cls: 'el-phy', name: 'Física · PHY', side: 'radio',
      body: <><Chip cls="hdr-phy" label="OFDM: reparte la señal en unas 52 subportadoras paralelas; robusta contra rebotes de la señal.">OFDM</Chip><Chip cls="hdr-phy" label="64-QAM: mete 6 bits en cada símbolo. Rápido, pero exige señal limpia.">64-QAM</Chip><Chip cls="hdr-phy" label="FEC 5/6: de cada 6 bits, 5 son datos y 1 es redundancia para corregir errores sin reenviar.">FEC 5/6</Chip>→ 5 GHz por la antena</>,
    },
  ]

  return (
    <div>
      <span className="kicker">Slide 04 · El viaje</span>
      <h2 className="slide-title">Viaje de un paquete — <span className="hl-amber">App → Wi-Fi → Ethernet</span></h2>
      <p className="slide-sub">Presioná Play y mirá el punto ámbar: es tu dato viajando por la pila, el aire y el cable</p>

      <div className="journey-controls">
        <button className="play-btn" onClick={playing ? stopPlay : play}>
          {playing ? <><PauseIcon size={15} /> Pausar</> : step >= steps.length - 1 ? <><RestartIcon size={15} /> Reiniciar</> : <><PlayIcon size={15} /> Play</>}
        </button>
        <button className="step-btn" onClick={() => { stopPlay(); setStep((s) => Math.max(0, s - 1)) }} disabled={step === 0}>
          <ChevLIcon size={14} /> Anterior
        </button>
        <button className="step-btn" onClick={() => { stopPlay(); setStep((s) => Math.min(steps.length - 1, s + 1)) }} disabled={step >= steps.length - 1}>
          Siguiente <ChevRIcon size={14} />
        </button>
        <span className="step-label">Paso {step + 1} / {steps.length}</span>
      </div>

      <div className="journey-stage">
        <div className="journey-visual">
          <FlightScene stepKey={cur.key} />

          {['app', 'tp', 'ip'].includes(cur.key) && (
            <div className="encap-flow">
              {encapLayers.filter((l) => showEncap(l.key)).map((l, i) => (
                <div key={l.key} className={`encap-layer ${l.cls} visible`} style={{ transitionDelay: `${i * 130}ms` }}>
                  <div className="encap-name"><span>{l.name}</span><span>{l.side}</span></div>
                  <div className="encap-data">{l.body}</div>
                </div>
              ))}
              <div className="chips-hint"><InfoIcon size={15} /> Tocá cada etiqueta (dport, TTL, A1…) para saber qué significa cada campo</div>
            </div>
          )}

          {cur.key === 'mac' && (
            <div>
              <div className="frame-hint"><InfoIcon size={15} /> Trama 802.11 real — tocá un campo para ver qué lleva dentro</div>
              <div className="frame-diagram">
                {frameFields.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className={`frame-field ${f.cls} ${hoverField === f.id ? 'hl' : ''}`}
                    onMouseEnter={() => setHoverField(f.id)}
                    onFocus={() => setHoverField(f.id)}
                    onClick={() => setHoverField(hoverField === f.id ? null : f.id)}
                    style={{ borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}
                  >
                    {f.short}
                    <span className="fw">{f.size}</span>
                  </button>
                ))}
              </div>
              <div className="field-info">
                {hoverField ? (
                  <>
                    <strong>{frameFields.find((f) => f.id === hoverField).label}</strong>{' '}
                    <span className="size">{frameFields.find((f) => f.id === hoverField).size}</span>
                    <p style={{ margin: '6px 0 0', fontSize: 13, lineHeight: 1.6 }}>
                      {frameFields.find((f) => f.id === hoverField).info}
                    </p>
                  </>
                ) : (
                  <span style={{ color: 'var(--muted)' }}>Pasá el mouse o tocá cada campo de la trama para ver qué información lleva</span>
                )}
              </div>
            </div>
          )}

          {cur.key === 'phy' && (
            <div className="wave-scene" style={{ minHeight: 0, paddingTop: 6 }}>
              <div className="mod-badge">OFDM · 64-QAM · codificación 5/6</div>
              <svg className="wave-svg" viewBox="0 0 420 120">
                <defs>
                  <linearGradient id="wg2" x1="0" x2="1">
                    <stop offset="0%" stopColor="#16a34a" />
                    <stop offset="100%" stopColor="#0e7c72" />
                  </linearGradient>
                </defs>
                {Array.from({ length: 7 }).map((_, i) => (
                  <path
                    key={i}
                    d={`M 10 ${60 + (i - 3) * 9} Q 60 ${60 + (i - 3) * (i % 2 ? 20 : -20)} 110 ${60 + (i - 3) * 9} T 210 ${60 + (i - 3) * 9} T 310 ${60 + (i - 3) * 9} T 410 ${60 + (i - 3) * 9}`}
                    fill="none"
                    stroke="url(#wg2)"
                    strokeWidth="1.7"
                    opacity={0.3 + i * 0.1}
                    className="p2p-link"
                    style={{ animationDelay: `${i * 0.12}s` }}
                  />
                ))}
                <circle cx="14" cy="60" r="6" fill="#16a34a" />
                <circle cx="406" cy="60" r="6" fill="#0e7c72" />
              </svg>
              <PhyPipeline key={`phy-${step}`} />
              <div className="phy-note">
                Cada etapa transforma los bits un poco más, hasta que solo queda radio. Los términos con{' '}
                <Term def="Mezcla pseudoaleatoria de bits.">scrambling</Term>,{' '}
                <Term def="Forward Error Correction: redundancia para corregir errores sin reenviar.">FEC</Term> e{' '}
                <Term def="Reordena bits para que un error puntual no destruya un símbolo entero.">interleaving</Term>{' '}
                tienen glosario: tocalos.
              </div>
            </div>
          )}

          {cur.key === 'ap' && (
            <div className="ap-scene" style={{ minHeight: 0, paddingTop: 4 }}>
              <div className="ap-box match">
                <div className="ap-icon">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
                    <path d="M8.5 15.5a5 5 0 0 1 7 0" />
                    <path d="M6 18a9 9 0 0 1 12 0" />
                    <path d="M12 13.5V21" />
                    <path d="M8.5 21h7" />
                  </svg>
                </div>
                <div className="ap-name">Access Point — Red "CasaWiFi"</div>
                <BssidMatch key={`bssid-${step}`} />
              </div>
              <div className="check-flow">
                {[
                  <>Demodular <Term def="Orthogonal Frequency Division Multiplexing: divide la señal en muchas subportadoras paralelas.">OFDM</Term> → recuperar bits</>,
                  <>Verificar <Term def="Frame Check Sequence: huella CRC-32 de la trama.">FCS</Term> → ¿trama íntegra?</>,
                  <>Comparar BSSID carácter por carácter → ¿es mi red?</>,
                  <>Enviar <Term def="Acknowledgement: confirmación corta que cierra el intercambio.">ACK</Term> a la estación</>,
                ].map((label, i) => (
                  <div key={i} className="check-item done stage-in" style={{ '--d': `${900 + i * 350}ms` }}>
                    <span className="status"><CheckIcon size={15} /></span>
                    {label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {cur.key === 'eth' && (
            <div className="ethernet-exit">
              <strong style={{ color: 'var(--green)' }}>Bridge 802.11 → 802.3:</strong> el AP pela la
              cabecera inalámbrica y reenvuelve el MISMO datagrama IP en una trama Ethernet, conservando
              las MAC de origen y destino: en la LAN cableada el paquete parece venir directo de la laptop
              (bridge transparente, sin reescribir direcciones).
            </div>
          )}
        </div>

        <div className="journey-explain">
          <h3>{cur.title}</h3>
          <div className="layer-tag">
            <span className="tag" style={TAG_STYLE[cur.layerTag]}>{cur.layer}</span>
          </div>
          <p>{cur.text}</p>
          <ul className="detail-list">
            {cur.details.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </div>
      </div>
    </div>
  )
}
