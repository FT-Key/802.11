import { WifiIcon, BookIcon, SignalIcon, AntennaIcon, LayersIcon } from './icons.jsx'
import Term from './Term.jsx'

const points = [
  {
    icon: <BookIcon size={22} />,
    title: 'Definición',
    text: (
      <>
        Conjunto de estándares de la <strong>IEEE</strong> para redes inalámbricas de área local{' '}
        (<Term def="Wireless Local Area Network: red de área local sin cables.">WLAN</Term>).
        Conocido popularmente como Wi-Fi.
      </>
    ),
  },
  {
    icon: <SignalIcon size={22} />,
    title: 'Acceso al medio',
    text: (
      <>
        Utiliza <Term def="Carrier Sense Multiple Access with Collision Avoidance: escucha el canal y evita colisiones antes de transmitir." example="A diferencia de Ethernet, que detecta la colisión después (CSMA/CD).">CSMA/CA</Term>{' '}
        en lugar del <Term def="Collision Detection: el método de Ethernet con cables —habla y si detecta choque, para y reintenta.">CSMA/CD</Term> de Ethernet.
      </>
    ),
  },
  {
    icon: <AntennaIcon size={22} />,
    title: 'Medio de transmisión',
    text: (
      <>
        Ondas electromagnéticas (<Term def="Ondas de radio entre 2.4, 5, 6 y 60 GHz según el estándar.">radiofrecuencia</Term>).
        No usa cables. Principal ventaja: movilidad.
      </>
    ),
  },
  {
    icon: <LayersIcon size={22} />,
    title: 'Capas que define',
    text: (
      <>
        Capa Física (<Term def="Physical Layer: modula, codifica y convierte bits en ondas de radio.">PHY</Term>) y
        subcapa <Term def="Media Access Control: arma las tramas, decide cuándo hablar y confirma recepciones.">MAC</Term> de
        la capa de Enlace. Compatible con las capas superiores (como Ethernet).
      </>
    ),
  },
]

const layers = [
  { cls: 'l-app', who: 'Aplicación', what: 'HTTP, FTP, video…' },
  { cls: 'l-tp', who: 'Transporte (TCP/UDP)', what: 'Segmentos / datagramas' },
  { cls: 'l-net', who: 'Red (IP)', what: 'Enrutamiento, direccionamiento' },
  { cls: 'l-mac', who: 'Enlace — Subcapa MAC (802.11)', what: 'Tramas, CSMA/CA, ACK' },
  { cls: 'l-phy', who: 'Física (PHY 802.11)', what: 'Modulación, codificación, radio' },
]

export default function SlideIntro() {
  return (
    <div>
      <div className="intro-hero">
        <span className="kicker">Slide 01 · Fundamentos</span>
        <div className="hero-mark">
          <WifiIcon size={32} />
        </div>
        <h2>
          ¿Qué es <span className="stroke-cyan">IEEE 802.11</span>?
        </h2>
        <div className="wifi-name">
          El estándar detrás del <strong>Wi-Fi</strong> · Redes Inalámbricas de Área Local
        </div>
      </div>

      <div className="intro-points">
        {points.map((p, i) => (
          <div className="card intro-point reveal" style={{ '--d': `${i * 90}ms` }} key={p.title}>
            <div className="icon">{p.icon}</div>
            <div>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="layers-stack">
        {layers.map((l, i) => (
          <div className={`layer-bar ${l.cls}`} style={{ '--d': `${200 + i * 110}ms` }} key={l.who}>
            <span className="who">{l.who}</span>
            <span className="what">{l.what}</span>
          </div>
        ))}
        <div className="layers-note">
          802.11 define solo las <strong>dos capas inferiores</strong> — lo demás lo aporta la pila TCP/IP
        </div>
      </div>
    </div>
  )
}
