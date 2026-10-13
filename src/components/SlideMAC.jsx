import { useState } from 'react'
import { SignalIcon, CheckIcon, InfoIcon } from './icons.jsx'
import Term from './Term.jsx'

const compat = [
  {
    std: '802.11a',
    line: 'no compatible con 802.11b/g',
    detail: '802.11a opera en 5 GHz con OFDM; 802.11b y 802.11g operan en 2.4 GHz con otra modulación: hablan "otro idioma" de radio y no pueden intercambiar tramas entre sí.',
  },
  {
    std: '802.11b',
    line: 'base de 2.4 GHz',
    detail: '802.11b sentó las bases de la adopción masiva del Wi-Fi en 2.4 GHz. Los equipos "b/g/n" (todos de 2.4 GHz) heredan de aquí.',
  },
  {
    std: '802.11g',
    line: 'compatible con b',
    detail: '802.11g mantiene compatibilidad hacia atrás con 802.11b: un cliente 802.11b puede asociarse a un AP 802.11g, aunque a 11 Mbps y con CCK en vez de OFDM.',
  },
  {
    std: '802.11n',
    line: 'compatible con a/b/g',
    detail: (
      <>
        802.11n puede operar en 2.4 GHz (compatible con b y con g) y en 5 GHz (compatible con a).{' '}
        <Term def="Equipos y redes que trabajan en dos bandas a la vez (2.4 y 5 GHz).">Dual-band</Term>:
        el AP n ofrece ambos radios.
      </>
    ),
  },
  {
    std: '802.11ac',
    line: 'compatible con a/n (solo 5 GHz)',
    detail: '802.11ac trabaja exclusivamente en 5 GHz. Es compatible con clientes 802.11a y 802.11n de esa banda; no toca el legado 2.4 GHz.',
  },
  {
    std: '802.11ad',
    line: 'compatible total (multi-banda)',
    detail: '802.11ad usa 60 GHz para rendimiento extremo, pero los APs multi-banda combinan radios 2.4/5 GHz (a, b, g, n y ac) para mantener compatibilidad total.',
  },
  {
    std: '802.11ax',
    line: 'compatible con todas (a–ax)',
    detail: '802.11ax (Wi-Fi 6) es retrocompatible con todas las generaciones. En 2.4/5 GHz convive con clientes legacy; en 6 GHz (Wi-Fi 6E) solo opera ax.',
  },
]

export default function SlideMAC() {
  const [activeCompat, setActiveCompat] = useState(null)

  return (
    <div>
      <span className="kicker">Slide 03 · Enlace</span>
      <h2 className="slide-title">Comparación — <span className="hl-cyan">Capa de Enlace</span> (MAC)</h2>
      <p className="slide-sub">Protocolo de acceso al medio y compatibilidad entre estándares</p>

      <div className="mac-cols">
        <div className="card mac-col reveal" style={{ '--d': '0ms' }}>
          <h3><span className="tag cyan">CSMA/CA</span> Protocolo de acceso</h3>
          <p>
            Todos los estándares 802.11 utilizan{' '}
            <Term def="Carrier Sense Multiple Access with Collision Avoidance: escucha el canal y evita colisiones antes de transmitir.">CSMA/CA</Term>.
            A diferencia de Ethernet (<Term def="Collision Detection: habla y si detecta choque, para y reintenta. En Wi-Fi no funciona porque la radio es half-duplex.">CSMA/CD</Term>),
            no detectan colisiones después de transmitir: las <strong style={{ color: 'var(--amber)' }}>evitan antes</strong> mediante:
          </p>
          <div className="mac-feature">
            <span className="bullet green" />
            <span>
              <strong>Escucha del canal</strong> —{' '}
              <Term def="Clear Channel Assessment: la radio mide energía y busca preámbulos 802.11 antes de hablar.">CCA</Term> antes
              de transmitir
            </span>
          </div>
          <div className="mac-feature">
            <span className="bullet green" />
            <span>
              <strong>RTS/CTS</strong> —{' '}
              <Term def="Request/Clear to Send: apretón de manos que reserva el canal e incluye el tiempo de reserva.">handshake</Term>{' '}
              opcional que "reserva" el medio
            </span>
          </div>
          <div className="mac-feature">
            <span className="bullet green" />
            <span>
              <strong>Backoff aleatorio</strong> — si el canal está ocupado, espera{' '}
              <Term def="Slot: tic mínimo del Wi-Fi (9 µs en OFDM). El backoff descuenta de a 1 slot por vez.">N slots</Term> al azar
              (ver simulador en el slide 05)
            </span>
          </div>
          <div className="mac-feature">
            <span className="bullet red" />
            <span>
              <strong>Por qué no CSMA/CD:</strong> en{' '}
              <Term def="Radio Frequency: las ondas de radio que usa el Wi-Fi (bandas de 2.4, 5, 6 y 60 GHz).">radiofrecuencia (RF)</Term>{' '}
              no podés escuchar y transmitir a la vez{' '}
              (<Term def="La antena transmite O recibe, nunca ambas a la vez. Por eso no puede detectar su propia colisión.">half-duplex</Term>),
              así que la colisión no se puede detectar en el momento exacto
            </span>
          </div>
        </div>

        <div className="card mac-col reveal" style={{ '--d': '120ms' }}>
          <h3><span className="tag green">Retrocompatibilidad</span> Línea de tiempo</h3>
          <div className="compat-chain">
            <div className="tl">
              {compat.map((c) => (
                <div className={`tl-item ${activeCompat === c.std ? 'active' : ''}`} key={c.std}>
                  <span className="tl-dot" />
                  <button
                    className="compat-item"
                    onClick={() => setActiveCompat(activeCompat === c.std ? null : c.std)}
                    aria-expanded={activeCompat === c.std}
                  >
                    <span className="std-badge">{c.std}</span>
                    <span className="arrow">→ {c.line}</span>
                  </button>
                  {activeCompat === c.std && (
                    <div className="compat-detail">
                      <strong>{c.std}</strong> — {c.detail}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card reveal" style={{ marginTop: 16, '--d': '200ms' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 14, fontFamily: 'var(--display)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <SignalIcon size={16} /> ¿Por qué CSMA/CA y no CSMA/CD?
        </h3>
        <div className="grid-3">
          <div className="mac-feature" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <strong style={{ color: 'var(--amber)' }}>
              <Term def="La antena transmite O recibe, nunca ambas a la vez. Por eso no puede detectar su propia colisión.">Half-duplex</Term> por diseño
            </strong>
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>Una antena no puede recibir y transmitir al mismo tiempo sin cancelación de eco compleja</span>
          </div>
          <div className="mac-feature" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <strong style={{ color: 'var(--amber)' }}>
              <Term def="Dos estaciones que no se escuchan entre sí pero chocan en el AP. Se resuelve con RTS/CTS.">Hidden node problem</Term>
            </strong>
            <span style={{ color: 'var(--muted)', fontSize: 13 }}>Dos estaciones fuera de alcance mutuo (no se "escuchan") pueden chocar en el AP → se resuelve con RTS/CTS</span>
          </div>
          <div className="mac-feature" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <strong style={{ color: 'var(--amber)' }}>Colisión cara</strong>
            <span style={{ color: 'var(--muted)', fontSize: 13 }}>Detectar una colisión en <Term def="Radio Frequency: las ondas de radio que usa el Wi-Fi (bandas de 2.4, 5, 6 y 60 GHz).">radiofrecuencia (RF)</Term> es costoso e impreciso; prevenirla es más eficiente</span>
          </div>
        </div>
      </div>

      <div className="card reveal" style={{ marginTop: 16, '--d': '260ms', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <InfoIcon size={18} />
        <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
          <CheckIcon size={13} /> Todo lo que tenga{' '}
          <span className="term" style={{ pointerEvents: 'none' }}>
            <span className="term-btn" style={{ cursor: 'help' }}>subrayado punteado</span>
          </span>{' '}
          es un término del glosario: pasá el mouse (o tocalo) para ver su definición.
        </p>
      </div>
    </div>
  )
}
