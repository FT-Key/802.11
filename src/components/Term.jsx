import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'

/**
 * Term — glosario inline. Subraya el término con puntitos y muestra
 * la definición en un tooltip renderizado en un portal (document.body),
 * así ningún `overflow: hidden` ancestro puede recortarlo.
 * Se voltea debajo del término si no hay espacio arriba.
 *
 * Uso: <Term def="...">OFDM</Term>
 *      <Term def="..." example="Ej: ...">NAV</Term>
 *      <Term className="chip" buttonClassName="header-chip hdr-tp" def="...">dport:443</Term>
 */
export default function Term({ children, def, example, className = '', buttonClassName = '' }) {
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)
  const [pos, setPos] = useState(null)
  const btnRef = useRef(null)

  const place = useCallback(() => {
    const el = btnRef.current
    if (!el || typeof window === 'undefined') return
    const r = el.getBoundingClientRect()
    const below = r.top < 190
    const cx = Math.min(Math.max(r.left + r.width / 2, 170), window.innerWidth - 170)
    setPos({ below, top: below ? r.bottom + 10 : r.top - 10, left: cx })
  }, [])

  useEffect(() => {
    if (!pos) return
    const close = () => {
      setOpen(false)
      setHover(false)
    }
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [pos])

  const show = (open || hover) && pos && typeof document !== 'undefined'

  return (
    <span className={`term ${open ? 'open' : ''} ${className}`}>
      <button
        ref={btnRef}
        type="button"
        className={`term-btn ${buttonClassName}`}
        onMouseEnter={() => {
          place()
          setHover(true)
        }}
        onMouseLeave={() => setHover(false)}
        onFocus={() => {
          place()
          setHover(true)
        }}
        onBlur={() => {
          setHover(false)
          setOpen(false)
        }}
        onClick={() => {
          place()
          setOpen((o) => !o)
        }}
        aria-expanded={open}
      >
        {children}
      </button>
      {show &&
        createPortal(
          <span
            className={`term-tip floating ${pos.below ? 'below' : 'above'}`}
            role="tooltip"
            style={{ top: pos.top, left: pos.left }}
          >
            <span className="term-tip-def">{def}</span>
            {example ? <span className="term-tip-ex">{example}</span> : null}
          </span>,
          document.body,
        )}
    </span>
  )
}
