import { useState } from 'react'
import Term from './Term.jsx'

export default function SlideInfra() {
  const [focus, setFocus] = useState(null)
  const dim = (id) => (focus && focus !== id ? 'dim' : '')

  const clients = [
    { id: 'pc', label: 'PC', x1: 116, y1: 168, x2: 292, y2: 66, dur: '2.4s', icon: 'laptop' },
    { id: 'cel', label: 'Celular', x1: 212, y1: 168, x2: 312, y2: 92, dur: '2s', icon: 'phone' },
    { id: 'iot', label: 'IoT', x1: 440, y1: 172, x2: 372, y2: 88, dur: '2.8s', icon: 'chip' },
    { id: 'nb', label: 'Notebook', x1: 560, y1: 176, x2: 392, y2: 74, dur: '2.2s', icon: 'laptop' },
  ]

  const glyph = (kind) => {
    if (kind === 'phone')
      return (
        <g transform="translate(-8, -11)" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="0" y="0" width="16" height="24" rx="3" />
        </g>
      )
    if (kind === 'chip')
      return (
        <g transform="translate(-10, -10)" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <rect x="0" y="0" width="20" height="20" rx="3" />
          <path d="M7 -4v4M13 -4v4M7 20v4M13 20v4M-4 7h4M-4 13h4M20 7h4M20 13h4" />
        </g>
      )
    return (
      <g transform="translate(-11, -9)" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="0" y="0" width="22" height="13" rx="2" />
        <path d="M-2 17h26" />
      </g>
    )
  }

  return (
    <div>
      <span className="kicker">Slide 07 · Topologías</span>
      <h2 className="slide-title">Topología de <span className="hl-amber">Infraestructura</span> (BSS/ESS)</h2>
      <p className="slide-sub">
        Access Point central — el modo de hogares y empresas. Pasá el mouse por un cliente para aislar su enlace.
      </p>

      <div className="topo-canvas">
        <div className="topo-svg-wrap">
          <svg viewBox="0 0 680 300" width="680" height="300">
            <g
              className={`topo-node ${dim('ap')}`}
              onMouseEnter={() => setFocus('ap')}
              onMouseLeave={() => setFocus(null)}
              style={{ cursor: 'pointer' }}
            >
              <rect x="290" y="30" width="100" height="58" rx="11" fill="#ffffff" stroke="#ff5f03" strokeWidth="2" />
              <circle cx="340" cy="52" r="4" fill="#ff5f03" />
              <path d="M328 44a17 17 0 0 1 24 0M322 38a25 25 0 0 1 36 0" fill="none" stroke="#ff5f03" strokeWidth="2" strokeLinecap="round" />
              <text x="340" y="78" textAnchor="middle" fontSize="10" fill="#ff5f03" fontWeight="700" fontFamily="'Ubuntu Mono', monospace">Access Point</text>
            </g>

            {clients.map((c, i) => (
              <g key={c.id}>
                <g className={`topo-link ${dim(c.id)}`}>
                  <line className="p2p-link" x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2} stroke="#0e7c72" strokeWidth="1.6" style={{ animationDelay: `${i * 0.25}s` }} />
                  <circle r="4.5" fill="#0e7c72">
                    <animateMotion dur={c.dur} repeatCount="indefinite" path={`M ${c.x1} ${c.y1} L ${c.x2} ${c.y2}`} />
                  </circle>
                  <circle r="4.5" fill="#ff5f03" opacity="0.7">
                    <animateMotion dur={c.dur} begin={`${i * 0.4}s`} repeatCount="indefinite" path={`M ${c.x2} ${c.y2} L ${c.x1} ${c.y1}`} />
                  </circle>
                </g>
                <g
                  className={`topo-node ${dim(c.id)}`}
                  onMouseEnter={() => setFocus(c.id)}
                  onMouseLeave={() => setFocus(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <rect x={c.x1 - 28} y={c.y1 - 8} width="56" height="40" rx="8" fill="#ffffff" stroke={focus === c.id ? '#ff5f03' : '#cfc7b0'} strokeWidth="2" />
                  <g transform={`translate(${c.x1}, ${c.y1 + 8})`} color={focus === c.id ? '#ff5f03' : '#0e7c72'}>{glyph(c.icon)}</g>
                  <text x={c.x1} y={c.y1 + 48} textAnchor="middle" fontSize="10" fill="#111827" fontWeight="700" fontFamily="Oswald, sans-serif">{c.label}</text>
                </g>
              </g>
            ))}

            <line x1="340" y1="90" x2="340" y2="238" stroke="#16a34a" strokeWidth="3" />
            <circle cx="340" cy="238" r="5" fill="#16a34a" />
            <circle r="4" fill="#16a34a">
              <animateMotion dur="1.8s" repeatCount="indefinite" path="M 340 100 L 340 236" />
            </circle>
            <rect x="278" y="250" width="124" height="36" rx="8" fill="#ffffff" stroke="#16a34a" strokeWidth="2" />
            <text x="340" y="273" textAnchor="middle" fontSize="11" fill="#16a34a" fontWeight="700" fontFamily="'Ubuntu Mono', monospace">Switch Ethernet</text>

            <text x="340" y="15" textAnchor="middle" fontSize="12" fill="#55606f">red inalámbrica (BSS) — teal sube · naranja baja</text>
            <text x="520" y="272" textAnchor="middle" fontSize="10" fill="#16a34a">→ red cableada (ESS / internet)</text>
          </svg>
        </div>
      </div>

      <div className="topo-info-grid">
        <div className="card info-block reveal" style={{ '--d': '0ms' }}>
          <h3><span className="tag amber">Definición</span></h3>
          <p>
            Un <Term def="Nodo central que concentra las señales Wi-Fi y las puentea a la red cableada.">Access Point</Term> central:
            todas las estaciones hablan a través de él, y él las conecta (típicamente por cable) a la red cableada.
          </p>
          <h3><span className="tag green">Características clave</span></h3>
          <ul>
            <li>El AP actúa como "switch" inalámbrico</li>
            <li>
              Permite <Term def="Cambiar de AP sin cortar la sesión, dentro de una misma red extendida.">roaming</Term> entre
              varios APs (<Term def="Extended Service Set: varios BSS con el mismo SSID, unidos por la red cableada.">ESS</Term>)
            </li>
            <li>Mayor control, seguridad y cobertura</li>
            <li>Es el modo usado en hogares y empresas</li>
            <li>Soporta muchos clientes simultáneos</li>
          </ul>
        </div>
        <div className="card info-block reveal" style={{ '--d': '120ms' }}>
          <h3><span className="tag cyan">Ejemplo práctico</span></h3>
          <div className="example-box">
            <strong>Red Wi-Fi de una oficina o casa:</strong> el router/AP se conecta al módem por cable
            y todos los dispositivos (PCs, celulares, IoT) se asocian al AP.
          </div>
          <h3 style={{ marginTop: 14 }}><span className="tag ghost">BSS → ESS</span></h3>
          <div className="example-box cyan-box">
            <strong><Term def="Basic Service Set: un AP más sus clientes asociados.">BSS</Term></strong> = un AP + sus clientes asociados.<br />
            <strong><Term def="Extended Service Set: varios BSS con el mismo SSID, unidos por la red cableada.">ESS</Term></strong> = varios BSS interconectados por el sistema de distribución,
            mismo SSID → el cliente hace <em>roaming</em> sin cortar la sesión.
          </div>
        </div>
      </div>
    </div>
  )
}
