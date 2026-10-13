import { useState } from 'react'
import { BookIcon } from './icons.jsx'

const groups = [
  {
    name: 'Acceso al medio',
    terms: [
      { t: 'CSMA/CA', d: 'Escucha el canal y evita colisiones ANTES de transmitir. El método de todo Wi-Fi.' },
      { t: 'CSMA/CD', d: 'Habla y si detecta choque, para y reintenta. El de Ethernet con cables; en Wi-Fi no sirve.' },
      { t: 'CCA', d: 'Clear Channel Assessment: la radio mide energía y busca preámbulos antes de hablar.' },
      { t: 'DIFS / SIFS', d: 'Silencios obligatorios: DIFS largo antes de competir (28 µs en 2.4 GHz OFDM, 34 en 5 GHz, 50 en 802.11b); SIFS corto entre tramas del mismo intercambio.' },
      { t: 'Backoff', d: 'Espera aleatoria de N slots cuando el canal está ocupado. Descuenta de a 1 por slot libre.' },
      { t: 'Slot / CW', d: 'Slot = tic mínimo (9 µs en OFDM, 20 µs en 802.11b). CW = ventana del sorteo (15→1023 en OFDM): a más fallos, más grande.' },
      { t: 'RTS / CTS', d: '"¿Puedo hablar?" / "Adelante": apretón de manos que reserva el canal con el campo Duration.' },
      { t: 'NAV', d: 'Network Allocation Vector: cronómetro virtual que prohíbe hablar hasta que expire, aunque oigas silencio.' },
      { t: 'Hidden node', d: 'Dos estaciones fuera de alcance mutuo que chocan en el AP. Se resuelve con RTS/CTS.' },
      { t: 'ACK', d: 'Acknowledgement: confirmación corta del receptor. Sin ACK, el emisor reintenta.' },
      { t: 'Retry limit', d: 'Reintentos máximos por paquete (típ. 7). Después se descarta y TCP lo reenvía.' },
    ],
  },
  {
    name: 'Trama y direcciones',
    terms: [
      { t: 'Trama 802.11', d: 'El "sobre" inalámbrico: Frame Control, Duration, 3-4 direcciones MAC, secuencia, datos y FCS.' },
      { t: 'FCS / CRC-32', d: 'Huella matemática de la trama. Si no coincide al recibir, se descarta sin ACK.' },
      { t: 'BSSID', d: 'La MAC de la red del AP. El filtro que decide "¿esta trama es de mi red?".' },
      { t: 'SSID', d: 'El nombre de la red Wi-Fi que elegís en tu celular (ej. "CasaWiFi").' },
      { t: 'Duration', d: 'Campo que anuncia en µs cuánto durará la transacción. Alimenta el NAV ajeno.' },
    ],
  },
  {
    name: 'Capa física (radio)',
    terms: [
      { t: 'RF / Radiofrecuencia', d: 'Las ondas de radio del Wi-Fi: bandas de 2.4, 5, 6 y 60 GHz según el estándar.' },
      { t: 'OFDM / OFDMA', d: 'Divide el canal en subportadoras paralelas. La A suma acceso multiusuario (varios clientes a la vez).' },
      { t: 'QAM', d: 'Modulación que combina amplitud y fase: más bits por símbolo, más velocidad, más sensible al ruido.' },
      { t: 'MIMO / MU-MIMO', d: 'Varias antenas con flujos paralelos. MU = a varios clientes a la vez.' },
      { t: 'DSSS / CCK', d: 'Técnicas viejas de 2.4 GHz (802.11b): dispersan los bits para resistir interferencia.' },
      { t: 'FEC / LDPC', d: 'Redundancia que corrige errores sin reenviar. LDPC es el código moderno.' },
      { t: 'Scrambling', d: 'Mezcla pseudoaleatoria de bits para evitar rachas de 0/1 que confunden al receptor.' },
      { t: 'Interleaving', d: 'Reordena bits para que un error puntual no destruya un símbolo entero.' },
      { t: 'Símbolo', d: 'Unidad mínima que viaja por el aire: cada símbolo QAM lleva varios bits.' },
      { t: 'Subportadora', d: 'Cada subdivisión del canal OFDM, con sus propios símbolos en paralelo.' },
      { t: 'Beamforming', d: 'El AP concentra la energía hacia cada cliente en vez de irradiar parejo.' },
      { t: 'Throughput', d: 'Velocidad REAL de datos útiles (siempre menor que la teórica del folleto).' },
      { t: 'Ancho de banda', d: 'Cuántos MHz ocupa la señal (20/40/80/160): más ancho = más velocidad.' },
      { t: 'Atenuación', d: 'La señal pierde fuerza con distancia y obstáculos; a más frecuencia, más se atenúa.' },
      { t: 'Dual-band', d: 'Equipos que trabajan en dos bandas a la vez (2.4 y 5 GHz).' },
      { t: 'Overhead', d: 'Tiempo/bytes gastados en control (preámbulos, esperas, cabeceras) en vez de datos.' },
    ],
  },
  {
    name: 'Red y equipos',
    terms: [
      { t: 'TCP / UDP', d: 'TCP: confiable con handshake y reintentos. UDP: rápido sin conexión (juegos, llamadas).' },
      { t: 'Handshake', d: 'Apretón de manos de TCP (SYN, SYN-ACK, ACK) para abrir la conexión.' },
      { t: 'Socket', d: 'Canal de software por el que una app envía/recibe red sin saber de Wi-Fi.' },
      { t: 'IP / TTL', d: 'IP direcciona entre redes. TTL baja 1 por router; en 0 el paquete muere (anti-bucles).' },
      { t: 'Gateway / NAT', d: 'Gateway: el router que te saca a internet. NAT: traduce tu IP privada a la pública.' },
      { t: 'Half-duplex', d: 'La antena transmite O recibe, nunca ambas: por eso no detecta su propia colisión.' },
      { t: 'IBSS / BSS / ESS', d: 'IBSS = red sin AP. BSS = un AP + clientes. ESS = varios BSS con mismo SSID + roaming.' },
      { t: 'Roaming', d: 'Cambiar de AP sin cortar la sesión, dentro de la misma red extendida.' },
      { t: 'Downlink / Uplink', d: 'Bajada (AP→vos) y subida (vos→AP).' },
      { t: 'Legacy', d: 'Equipos viejos (a/b/g/n/ac) que siguen funcionando en la red.' },
      { t: 'Fallback', d: 'Si el otro extremo es viejo, se baja a su velocidad/técnica para seguir hablando.' },
      { t: 'Streams', d: 'Flujos espaciales simultáneos: cada uno lleva datos en paralelo.' },
    ],
  },
]

export default function SlideGlossary() {
  const [q, setQ] = useState('')
  const norm = (s) => s.toLowerCase()
  const filtered = groups
    .map((g) => ({ ...g, terms: g.terms.filter((t) => norm(t.t).includes(norm(q)) || norm(t.d).includes(norm(q))) }))
    .filter((g) => g.terms.length > 0)
  const total = filtered.reduce((n, g) => n + g.terms.length, 0)

  return (
    <div>
      <span className="kicker">Slide 09 · Glosario</span>
      <h2 className="slide-title">Glosario <span className="hl-amber">802.11</span></h2>
      <p className="slide-sub">Todos los términos que aparecen subrayados en la presentación, con su explicación corta. Escribí para filtrar.</p>

      <input
        className="gloss-search"
        type="search"
        placeholder="Buscar término… (ej. NAV, QAM, BSSID)"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Buscar en el glosario"
      />

      {total === 0 ? (
        <div className="card gloss-empty">Sin resultados para "{q}". Probá con otra palabra.</div>
      ) : (
        <div className="glossary-groups">
          {filtered.map((g) => (
            <div className="card gloss-group reveal" key={g.name}>
              <h3><BookIcon size={17} /> {g.name} <span className="gloss-count">{g.terms.length}</span></h3>
              {g.terms.map((t) => (
                <div className="gloss-item" key={t.t}>
                  <div className="gloss-term">{t.t}</div>
                  <div className="gloss-def">{t.d}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
