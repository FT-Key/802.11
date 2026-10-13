import { useState, Fragment } from 'react'
import { BoltIcon, InfoIcon, CheckIcon } from './icons.jsx'
import Term from './Term.jsx'

const standards = [
  {
    name: '802.11a',
    year: '1999',
    topologias: 'Ad Hoc / Infraestructura',
    vel: '54 Mbps',
    mbps: 54,
    freq: '5 GHz',
    freqCls: 'freq-5',
    mod: 'OFDM',
    detail: {
      mejoras: (
        <>
          Primer estándar en usar modulación <Term def="Orthogonal Frequency Division Multiplexing: divide la señal en muchas subportadoras paralelas, robusta frente a interferencia.">OFDM</Term> y
          alcanzar 54 Mbps.
        </>
      ),
      puntos: [
        'Opera en la banda de 5 GHz (más canales, menos interferencia)',
        'OFDM divide la señal en múltiples subportadoras paralelas',
        <>
          Alcance menor que 802.11b por la mayor{' '}
          <Term def="Pérdida de fuerza de la señal con la distancia y los obstáculos. A mayor frecuencia, más atenuación.">atenuación</Term> a
          5 GHz
        </>,
      ],
      contra: 'No compatible con 802.11b (distinta banda y modulación).',
    },
  },
  {
    name: '802.11b',
    year: '1999',
    topologias: 'Ad Hoc / Infraestructura',
    vel: '11 Mbps',
    mbps: 11,
    freq: '2.4 GHz',
    freqCls: 'freq-24',
    mod: 'DSSS / CCK',
    detail: {
      mejoras: 'Popularizó el Wi-Fi. Aumentó el alcance y la penetración de obstáculos gracias a la banda de 2.4 GHz.',
      puntos: [
        <>
          Usa <Term def="Direct Sequence Spread Spectrum: dispersa cada bit en una secuencia más larga para resistir interferencia.">DSSS</Term> y{' '}
          <Term def="Complementary Code Keying: codificación que mete más bits por símbolo dentro de DSSS.">CCK</Term>
        </>,
        'Mejor alcance y penetración que 802.11a',
        <>
          Sólo 3{' '}
          <Term def="Canales cuyas frecuencias no se pisan entre sí. En 2.4 GHz solo hay 3 que no se solapan: el 1, el 6 y el 11.">canales no solapados</Term>{' '}
          en 2.4 GHz
        </>,
        'Más susceptible a interferencia (microondas, Bluetooth, etc.)',
      ],
      contra: 'Velocidad baja (11 Mbps) y pocos canales disponibles.',
    },
  },
  {
    name: '802.11g',
    year: '2003',
    topologias: 'Ad Hoc / Infraestructura',
    vel: '54 Mbps',
    mbps: 54,
    freq: '2.4 GHz',
    freqCls: 'freq-24',
    mod: 'OFDM + DSSS',
    detail: {
      mejoras: 'Combina la velocidad de 802.11a (54 Mbps, OFDM) con la banda de 2.4 GHz de 802.11b, manteniendo compatibilidad hacia atrás.',
      puntos: [
        <>
          Compatible hacia atrás con 802.11b (usa{' '}
          <Term def="Complementary Code Keying: codificación que mete más bits por símbolo dentro de DSSS.">CCK</Term> como{' '}
          <Term def="Modo de compatibilidad: si el otro extremo es viejo, se baja a su velocidad y técnica para seguir hablando.">fallback</Term>)
        </>,
        'OFDM en 2.4 GHz → 54 Mbps',
        'Sigue teniendo solo 3 canales no solapados en 2.4 GHz',
      ],
      contra: 'Al igual que 802.11b, sufre más interferencia en 2.4 GHz.',
    },
  },
  {
    name: '802.11n',
    year: '2009',
    topologias: 'Ad Hoc / Infraestructura',
    vel: '600 Mbps',
    mbps: 600,
    freq: '2.4 / 5 GHz',
    freqCls: 'freq-multi',
    mod: 'OFDM + MIMO',
    detail: {
      mejoras: (
        <>
          Introduce <Term def="Multiple Input Multiple Output: varias antenas envían flujos paralelos por el mismo canal.">MIMO</Term> con
          múltiples antenas, canales de 40 MHz y{' '}
          <Term def="Equipos y redes que trabajan en dos bandas a la vez (2.4 y 5 GHz).">dual-band</Term>.
        </>
      ),
      puntos: [
        'MIMO: hasta 4 antenas transmisoras y receptoras',
        <>
          Canales de 20 y 40 MHz (duplica el{' '}
          <Term def="Cuántos MHz ocupa la señal: más ancho = más velocidad, pero menos canales disponibles.">ancho de banda</Term>)
        </>,
        'Funciona en 2.4 GHz y 5 GHz simultáneamente (dual-band)',
        <>
          <Term def="Juntar varias tramas chicas en una sola transmisión para desperdiciar menos tiempo en preámbulos y esperas.">Frame aggregation</Term>{' '}
          para reducir overhead
        </>,
      ],
      contra: 'Las velocidades teóricas rara vez se alcanzan en la práctica.',
    },
  },
  {
    name: '802.11ac',
    year: '2013',
    topologias: 'Ad Hoc / Infraestructura',
    vel: '~3.5 Gbps',
    mbps: 3500,
    freq: '5 GHz',
    freqCls: 'freq-5',
    mod: 'OFDM + MU-MIMO DL',
    detail: {
      mejoras: (
        <>
          Canales de 80/160 MHz, <Term def="Multi-User MIMO: el AP transmite a varios clientes a la vez usando haces separados.">MU-MIMO</Term> de
          bajada y modulación hasta{' '}
          <Term def="Modulación que mete 8 bits en cada símbolo: rapidísima, pero exige una señal limpia.">256-QAM</Term>. Solo
          opera en 5 GHz.
        </>
      ),
      puntos: [
        'Canales de 80 y 160 MHz en 5 GHz',
        <>
          MU-MIMO: el AP envía a varios clientes a la vez (
          <Term def="Enlace de bajada: del AP hacia tu dispositivo. Lo contrario es uplink (subida).">downlink</Term>)
        </>,
        <>
          <Term def="El AP concentra la energía de radio hacia cada cliente en vez de irradiar en todas direcciones.">Beamforming</Term>:
          enfoca la señal hacia el cliente
        </>,
        'Modulación 256-QAM (más bits por símbolo)',
      ],
      contra: 'Requiere clientes y AP compatibles para aprovechar MU-MIMO.',
    },
  },
  {
    name: '802.11ad',
    year: '2012',
    topologias: 'Ad Hoc / Infraestructura',
    vel: '~7 Gbps',
    mbps: 7000,
    freq: '60 GHz',
    freqCls: 'freq-60',
    mod: 'DMG (mmWave)',
    detail: {
      mejoras: (
        <>
          Opera en la banda de 60 GHz —60.000 MHz (¡<strong>giga</strong>, no mega!),{' '}
          <Term def="Ondas de ~60 GHz, con longitud de onda de milímetros: muchísimo ancho disponible, poquísimo alcance.">ondas milimétricas</Term> de
          ~5 mm— con canales de hasta 2.16 GHz de ancho, logrando velocidades extremas.
        </>
      ),
      puntos: [
        'Banda de 60 GHz: enorme ancho de canal disponible',
        <>
          Hasta ~7 Gbps de{' '}
          <Term def="Velocidad REAL de datos útiles que llegan (siempre menor que la teórica del folleto).">throughput</Term> teórico
        </>,
        'Alcance muy corto (una habitación)',
        'Casi nula penetración de paredes',
      ],
      contra: 'Alcance muy limitado; pensado para reemplazar cables de corto alcance.',
    },
  },
  {
    name: '802.11ax',
    year: '2021',
    topologias: 'Ad Hoc / Infraestructura',
    vel: '~9.6 Gbps',
    mbps: 9600,
    freq: '2.4 / 5 / 6 GHz',
    freqCls: 'freq-multi',
    mod: 'OFDMA + MU-MIMO',
    detail: {
      mejoras: (
        <>
          Wi-Fi 6/6E.{' '}
          <Term def="Orthogonal Frequency Division Multiple Access: reparte las subportadoras entre varios clientes a la vez.">OFDMA</Term> permite
          dividir canales en unidades de recurso para servir a muchos clientes con eficiencia.
        </>
      ),
      puntos: [
        'OFDMA: subdivide el canal para multiusuario (subida y bajada)',
        <>
          <Term def="Cada red marca sus tramas con un 'color'; si escuchás otro color, podés transmitir igual. Reduce interferencia entre vecinos.">BSS Coloring</Term>:
          reduce interferencia entre redes vecinas
        </>,
        <>
          <Term def="Target Wake Time: el AP agenda cuándo despierta cada dispositivo IoT. Ahorra batería.">TWT</Term>: ahorro de
          batería en dispositivos IoT
        </>,
        'Wi-Fi 6E: extiende a la banda de 6 GHz (más canales, sin legado)',
        <>
          MU-MIMO completo: 8{' '}
          <Term def="Flujos espaciales simultáneos: cada uno lleva datos en paralelo. Más streams = más velocidad.">streams</Term> en
          downlink y uplink
        </>,
      ],
      contra: (
        <>
          Requiere hardware nuevo; convive con clientes{' '}
          <Term def="Equipos viejos (a/b/g/n/ac) que siguen funcionando en la red.">legacy</Term>, pero las ventajas
          plenas necesitan clientes compatibles.
        </>
      ),
    },
  },
]

const LOG_MIN = Math.log10(11)
const LOG_MAX = Math.log10(9600)
function speedWidth(mbps) {
  const w = ((Math.log10(mbps) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * 100
  return Math.max(5, w)
}

export default function SlideStandards() {
  const [open, setOpen] = useState(null)

  return (
    <div>
      <span className="kicker">Slide 02 · Evolución</span>
      <h2 className="slide-title">Estándares <span className="hl-amber">IEEE 802.11</span></h2>
      <p className="slide-sub">Clic en una fila para ver qué aporta cada versión respecto a la anterior</p>

      <div className="toggle-hint">
        <InfoIcon size={15} /> Tocá cualquier fila para desplegar la evolución · la barra muestra la velocidad en escala logarítmica
      </div>

      <div className="card standards-wrap" style={{ padding: 6 }}>
        <table className="standards-table">
          <thead>
            <tr>
              <th>Estándar</th>
              <th>Año</th>
              <th>Topología</th>
              <th>Acceso</th>
              <th>Vel. máx. teórica</th>
              <th>Frecuencia</th>
              <th>Modulación</th>
            </tr>
          </thead>
          <tbody>
            {standards.map((s, i) => (
              <Fragment key={s.name}>
                <tr
                  className={`standards-row ${open === i ? 'open' : ''}`}
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <td className="std-name">{s.name}</td>
                  <td className="std-year">{s.year}</td>
                  <td style={{ fontSize: 13 }}>{s.topologias}</td>
                  <td>
                    <Term def="Carrier Sense Multiple Access with Collision Avoidance: escucha el canal y evita colisiones antes de transmitir.">CSMA/CA</Term>
                  </td>
                  <td className="speed-cell">
                    <div className="speed-top">
                      <span className="speed-val">{s.vel}</span>
                    </div>
                    <div className="speed-bar">
                      <div
                        className={`speed-fill ${open === i ? 'lit' : ''}`}
                        style={{ width: open === i ? `${speedWidth(s.mbps)}%` : '0%' }}
                      />
                    </div>
                  </td>
                  <td><span className={`freq-chip ${s.freqCls}`}>{s.freq}</span></td>
                  <td style={{ fontSize: 13, color: 'var(--muted)' }}>{s.mod}</td>
                </tr>
                <tr className="std-detail-row">
                  <td colSpan={7} style={{ padding: 0, border: 'none' }}>
                    <div className={`std-expand ${open === i ? 'open' : ''}`}>
                      <div className="std-expand-inner">
                        <div className="std-detail">
                          <div style={{ gridColumn: '1 / -1' }}>
                            <h4><BoltIcon size={13} /> ¿Qué mejora?</h4>
                            <div className="improve">
                              <strong>{s.name}</strong> — {s.detail.mejoras}
                            </div>
                          </div>
                          <div>
                            <h4><CheckIcon size={13} /> Puntos clave</h4>
                            <ul>
                              {s.detail.puntos.map((p, j) => <li key={j}>{p}</li>)}
                            </ul>
                          </div>
                          <div>
                            <h4><InfoIcon size={13} /> Limitación</h4>
                            <ul>
                              <li>{s.detail.contra}</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card reveal" style={{ marginTop: 16, '--d': '100ms' }}>
        <h3 style={{ margin: '0 0 10px', fontSize: 14, fontFamily: 'var(--display)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <BoltIcon size={16} /> Dato clave
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 1.65 }}>
          Todas las versiones usan <strong style={{ color: 'var(--amber)' }}>CSMA/CA</strong> como protocolo de acceso
          y soportan topologías <strong style={{ color: 'var(--amber)' }}>Ad Hoc</strong> e{' '}
          <strong style={{ color: 'var(--amber)' }}>Infraestructura</strong>. Lo que evoluciona es la{' '}
          <strong style={{ color: 'var(--cyan)' }}>capa PHY</strong> (modulación, ancho de canal, MIMO/OFDMA)
          y la eficiencia de la subcapa MAC.
        </p>
      </div>
    </div>
  )
}
