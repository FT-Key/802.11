import { useState } from 'react'
import Term from './Term.jsx'

export default function SlideAdHoc() {
  const [focus, setFocus] = useState(null)
  const dim = (id) => (focus && focus !== id ? 'dim' : '')

  const link = (id, x1, y1, x2, y2, color, dur, OppDur) => (
    <g className={`topo-link ${dim(id)}`}>
      <line className="p2p-link" x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2" />
      <circle r="5" fill={color}>
        <animateMotion dur={dur} repeatCount="indefinite" path={`M ${x1} ${y1} L ${x2} ${y2}`} />
      </circle>
      <circle r="5" fill={color} opacity="0.55">
        <animateMotion dur={OppDur} repeatCount="indefinite" path={`M ${x2} ${y2} L ${x1} ${y1}`} />
      </circle>
    </g>
  )

  const node = (id, x, label, sub, icon) => (
    <g
      className={`topo-node ${dim(id)}`}
      onMouseEnter={() => setFocus(id)}
      onMouseLeave={() => setFocus(null)}
      style={{ cursor: 'pointer' }}
    >
      <rect x={x} y="100" width="72" height="48" rx="9" fill="#ffffff" stroke={focus === id ? '#ff5f03' : '#0e7c72'} strokeWidth="2" />
      <g transform={`translate(${x + 36}, 118)`} color={focus === id ? '#ff5f03' : '#0e7c72'}>{icon}</g>
      <rect x={x + 14} y="148" width="44" height="0" />
      <text x={x + 36} y="170" textAnchor="middle" fontSize="11" fill="#111827" fontWeight="700" fontFamily="Oswald, sans-serif">{label}</text>
      <text x={x + 36} y="185" textAnchor="middle" fontSize="9" fill="#55606f" fontFamily="'Ubuntu Mono', monospace">{sub}</text>
    </g>
  )

  const laptopIcon = (
    <g transform="translate(-11, -9)" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="0" y="0" width="22" height="13" rx="2" />
      <path d="M-2 17h26" />
    </g>
  )
  const phoneIcon = (
    <g transform="translate(-8, -11)" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="0" y="0" width="16" height="24" rx="3" />
    </g>
  )

  return (
    <div>
      <span className="kicker">Slide 06 · Topologías</span>
      <h2 className="slide-title">Topología <span className="hl-cyan">Ad-hoc</span> (IBSS)</h2>
      <p className="slide-sub">
        Peer-to-peer sin access point —{' '}
        <Term def="Independent Basic Service Set: conjunto de estaciones que hablan directo, sin AP.">IBSS</Term>.
        Cada nodo usa el mismo <Term def="Service Set Identifier: el nombre de la red Wi-Fi que elegís en tu celular.">SSID</Term> (el
        nombre de la red). Pasá el mouse por un nodo para ver sus enlaces.
      </p>

      <div className="topo-canvas">
        <div className="topo-svg-wrap">
          <svg viewBox="0 0 640 250" width="640" height="250">
            <circle className="wifi-pulse" cx="191" cy="124" r="30" fill="none" stroke="#0e7c72" strokeWidth="1.5" />
            <circle className="wifi-pulse" cx="449" cy="124" r="30" fill="none" stroke="#0e7c72" strokeWidth="1.5" style={{ animationDelay: '0.6s' }} />
            <circle className="wifi-pulse" cx="320" cy="124" r="34" fill="none" stroke="#ff5f03" strokeWidth="1.5" style={{ animationDelay: '1.2s' }} />

            {link('a', 227, 124, 284, 124, '#0e7c72', '2.2s', '3.1s')}
            {link('b', 356, 124, 413, 124, '#0e7c72', '2.6s', '2.2s')}
            {link('c', 200, 152, 440, 152, '#ff5f03', '3.4s', '2.8s')}

            {node('a', 155, 'Notebook A', 'SSID "Proyecto"', laptopIcon)}
            {node('b', 413, 'Notebook B', 'SSID "Proyecto"', laptopIcon)}
            {node('c', 284, 'Celular', 'mismo canal', phoneIcon)}

            <text x="320" y="30" textAnchor="middle" fontSize="13" fill="#ff5f03" fontWeight="700" fontFamily="Oswald, sans-serif">IBSS — sin punto central</text>
            <text x="320" y="48" textAnchor="middle" fontSize="11" fill="#55606f">los puntos en movimiento son tramas reales viajando · todos compiten con CSMA/CA</text>
            <text x="320" y="232" textAnchor="middle" fontSize="10" fill="#55606f">cada nodo es emisor y receptor a la vez</text>
          </svg>
        </div>
      </div>

      <div className="topo-info-grid">
        <div className="card info-block reveal" style={{ '--d': '0ms' }}>
          <h3><span className="tag cyan">Definición</span></h3>
          <p>
            Cada nodo se comunica de forma peer-to-peer con los demás, sin pasar por un AP.
            Los dispositivos se interconectan directamente con un SSID común.
          </p>
          <h3><span className="tag green">Características clave</span></h3>
          <ul>
            <li>No requiere infraestructura central</li>
            <li>Todos los nodos tienen el mismo rol</li>
            <li>Ideal para redes temporales o pequeñas</li>
            <li>Configuración rápida (SSID común)</li>
            <li>Alcance limitado a la distancia entre dispositivos</li>
          </ul>
        </div>
        <div className="card info-block reveal" style={{ '--d': '120ms' }}>
          <h3><span className="tag amber">Ejemplo práctico</span></h3>
          <div className="example-box">
            <strong>Dos notebooks en una reunión</strong> se conectan entre sí para compartir archivos
            sin router ni AP: forman un IBSS temporal con el mismo SSID y canal.
          </div>
          <h3 style={{ marginTop: 14 }}><span className="tag ghost">También se usa en</span></h3>
          <ul>
            <li>Redes de emergencia (terremotos, desastres)</li>
            <li>Juegos locales / LAN party inalámbrica</li>
            <li>Transferencia punto a punto (Wi-Fi Direct es un caso similar)</li>
            <li>Redes mesh entre nodos IoT</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
