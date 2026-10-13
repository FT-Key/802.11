import { useState } from 'react'
import { CardIcon, ApIcon, AntennaIcon, SignalIcon } from './icons.jsx'
import Term from './Term.jsx'

const antennas = [
  {
    id: 'omni',
    name: 'Omnidireccional',
    desc: 'Cobertura de 360° en el plano horizontal. La más común en hogares y oficinas.',
    color: '#0e7c72',
    pattern: 'M 150 130 m -42 0 a 42 42 0 1 1 84 0 a 42 42 0 1 1 -84 0 M 150 130 m -72 0 a 72 72 0 1 1 144 0 a 72 72 0 1 1 -144 0',
  },
  {
    id: 'directional',
    name: 'Direccional',
    desc: 'Haz concentrado en una dirección. Mayor alcance ahí; ideal para enlaces punto a punto.',
    color: '#ff5f03',
    pattern: 'M 150 130 L 92 62 M 150 130 L 150 42 M 150 130 L 208 62 M 150 130 L 82 102 M 150 130 L 218 102',
  },
  {
    id: 'sector',
    name: 'Sectorial',
    desc: 'Cubre un ángulo limitado (90°–120°). Típica en campus y torres: mezcla de ambas.',
    color: '#16a34a',
    pattern: 'M 150 130 L 70 52 M 150 130 L 110 40 M 150 130 L 150 36 M 150 130 L 190 40 M 150 130 L 230 52 M 62 66 A 96 96 0 0 1 238 66',
  },
]

export default function SlideElements() {
  const [antenna, setAntenna] = useState('omni')
  const cur = antennas.find((a) => a.id === antenna)

  return (
    <div>
      <span className="kicker">Slide 08 · Hardware</span>
      <h2 className="slide-title">Elementos para conectar <span className="hl-amber">redes inalámbricas</span></h2>
      <p className="slide-sub">El hardware que hace funcionar una WLAN</p>

      <div className="grid-3">
        <div className="element-card reveal" style={{ '--d': '0ms' }}>
          <div className="el-icon"><CardIcon size={26} /></div>
          <h3>Tarjetas / Adaptadores de red</h3>
          <p>
            Envían y reciben la información. Pueden ser PCIe, USB o integradas M.2
            (lo más común hoy). La velocidad depende             del estándar que soporten (a, b, g, n, ac y ax)
            y de cuántos <Term def="Flujos espaciales simultáneos: más streams = más velocidad.">streams</Term> manejen.
          </p>
          <div className="el-tags">
            <span className="tag amber">PCIe</span>
            <span className="tag cyan">USB</span>
            <span className="tag green">M.2 / Integrada</span>
            <span className="tag ghost">Multi-band</span>
          </div>
        </div>

        <div className="element-card reveal" style={{ '--d': '100ms' }}>
          <div className="el-icon"><ApIcon size={26} /></div>
          <h3>Access Point (AP)</h3>
          <p>
            Nodo central en modo infraestructura. Concentra señales de los clientes y las puentea
            a la red cableada. También puede actuar como{' '}
            <Term def="Une dos segmentos de red como si fueran uno solo.">bridge</Term> o{' '}
            <Term def="Reemite la señal para ampliar cobertura (a costa de la mitad del throughput).">repeater</Term>.
          </p>
          <div className="el-tags">
            <span className="tag amber">Infraestructura</span>
            <span className="tag cyan">Bridge</span>
            <span className="tag green">Repeater</span>
            <span className="tag ghost">Roaming ESS</span>
          </div>
        </div>

        <div className="element-card reveal" style={{ '--d': '200ms' }}>
          <div className="el-icon"><AntennaIcon size={26} /></div>
          <h3>Antenas</h3>
          <p>
            Definen <em>hacia dónde</em> va la energía. Elegí abajo un tipo para ver su patrón
            de radiación animado y cuándo conviene cada una.
          </p>
          <div className="el-tags">
            <span className="tag amber">Omnidireccional</span>
            <span className="tag cyan">Direccional</span>
            <span className="tag green">Sectorial</span>
          </div>
        </div>
      </div>

      <div className="antenna-demo reveal" style={{ '--d': '280ms' }}>
        <h3><SignalIcon size={17} /> Patrón de radiación — elegí una antena</h3>
        <div className="antenna-types">
          {antennas.map((a) => (
            <button
              key={a.id}
              type="button"
              className={`antenna-type ${antenna === a.id ? 'active' : ''}`}
              onClick={() => setAntenna(a.id)}
              aria-pressed={antenna === a.id}
            >
              <div className="at-icon" style={{ color: a.color }}><AntennaIcon size={26} /></div>
              <h4>{a.name}</h4>
              <p>{a.desc}</p>
            </button>
          ))}
        </div>

        <div className="antenna-stage">
          <svg viewBox="0 0 300 220" width="300" height="220">
            <defs>
              <radialGradient id="aglow" cx="50%" cy="59%" r="50%">
                <stop offset="0%" stopColor={cur.color} stopOpacity="0.28" />
                <stop offset="100%" stopColor={cur.color} stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="150" cy="130" r="102" fill="url(#aglow)" />
            <g key={antenna} className="beam-sweep">
              <path d={cur.pattern} fill="none" stroke={cur.color} strokeWidth="2.5" strokeLinecap="round" />
            </g>
            <circle cx="150" cy="130" r="15" fill="#ffffff" stroke={cur.color} strokeWidth="2" />
            <circle cx="150" cy="130" r="3.5" fill={cur.color} />
            <text x="150" y="212" textAnchor="middle" fontSize="12" fill={cur.color} fontWeight="700" fontFamily="Sora, sans-serif">
              {cur.name}
            </text>
          </svg>
        </div>
        <p className="antenna-caption">
          <strong>Cómo se elige:</strong> oficina entera → omnidireccional. Enlace entre dos edificios
          a 1 km → direccional (haz estrecho, poca interferencia lateral). Campus con clientes
          repartidos en un ángulo → sectorial.
        </p>
      </div>
    </div>
  )
}
