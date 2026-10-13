import { useState, useEffect, useCallback, useRef } from 'react'
import { WifiIcon, ChevLIcon, ChevRIcon, InfoIcon } from './components/icons.jsx'
import SlideIntro from './components/SlideIntro.jsx'
import SlideStandards from './components/SlideStandards.jsx'
import SlideMAC from './components/SlideMAC.jsx'
import PacketJourney from './components/PacketJourney.jsx'
import SlideCSMACA from './components/SlideCSMACA.jsx'
import SlideAdHoc from './components/SlideAdHoc.jsx'
import SlideInfra from './components/SlideInfra.jsx'
import SlideElements from './components/SlideElements.jsx'
import SlideGlossary from './components/SlideGlossary.jsx'

const slides = [
  { id: 'intro', title: '¿Qué es 802.11?', component: SlideIntro },
  { id: 'standards', title: 'Estándares', component: SlideStandards },
  { id: 'mac', title: 'Capa MAC', component: SlideMAC },
  { id: 'journey', title: 'Viaje de un paquete', component: PacketJourney },
  { id: 'csma', title: 'CSMA/CA', component: SlideCSMACA },
  { id: 'adhoc', title: 'Ad-hoc', component: SlideAdHoc },
  { id: 'infra', title: 'Infraestructura', component: SlideInfra },
  { id: 'elements', title: 'Elementos de red', component: SlideElements },
  { id: 'glossary', title: 'Glosario', component: SlideGlossary },
]

export default function Presentation() {
  const [current, setCurrent] = useState(0)
  const [dir, setDir] = useState('fwd')
  const prevRef = useRef(0)

  const go = useCallback((i) => {
    const next = Math.max(0, Math.min(slides.length - 1, i))
    setDir(next >= prevRef.current ? 'fwd' : 'back')
    prevRef.current = next
    setCurrent(next)
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') go(current + 1)
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') go(current - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current, go])

  const Current = slides[current].component

  return (
    <div className="presentation">
      <header className="pres-header">
        <div className="pres-brand">
          <span className="pres-logo">
            <WifiIcon size={22} />
          </span>
          <div>
            <h1>NORMA IEEE <span className="thin">802.11</span></h1>
            <p>Redes Inalámbricas Wi-Fi · Redes de Datos 4k2</p>
          </div>
        </div>
        <span className="gloss-hint" title="Pasá el mouse o tocá los términos subrayados para ver su definición">
          <InfoIcon size={13} /> <u>Subrayado punteado</u> = definición
        </span>
        <nav className="pres-nav" aria-label="Slides">
          {slides.map((s, i) => (
            <button
              key={s.id}
              className={i === current ? 'nav-dot active' : 'nav-dot'}
              onClick={() => go(i)}
              title={s.title}
              aria-label={`Ir a: ${s.title}`}
            >
              {i + 1}
            </button>
          ))}
        </nav>
      </header>

      <main className="pres-stage">
        <div key={current} className={`slide enter-${dir}`}>
          <Current />
        </div>
      </main>

      <footer className="pres-footer">
        <button className="pres-btn" onClick={() => go(current - 1)} disabled={current === 0}>
          <ChevLIcon size={15} /> Anterior
        </button>
        <div className="pres-progress" role="progressbar" aria-valuenow={current + 1} aria-valuemin={1} aria-valuemax={slides.length}>
          <div className="pres-progress-bar" style={{ width: `${((current + 1) / slides.length) * 100}%` }} />
        </div>
        <span className="pres-counter">{current + 1} / {slides.length}</span>
        <button className="pres-btn" onClick={() => go(current + 1)} disabled={current === slides.length - 1}>
          Siguiente <ChevRIcon size={15} />
        </button>
      </footer>
    </div>
  )
}
