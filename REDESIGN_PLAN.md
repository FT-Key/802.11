# Plan de rediseño — Presentación interactiva IEEE 802.11

> **Sesión 2 (completada):** skill **`stitch`** aplicado — tema claro enterprise
> (surface `#EDEADE`, texto `#111827`, primario `#072C2C` en header/footer,
> secundario `#FF5F03`, éxito `#16A34A`, alerta `#D97706`, peligro `#DC2626`;
> fuentes Ubuntu / Oswald / Ubuntu Mono, radios 12/8/4, sombras suaves sin glow).
> Verificado en navegador: intro, viaje (Play punta a punta), CSMA, tabla expandida;
> 0 errores de consola, lint y build en verde.
>
> **Sesión 3 (completada):** aprendizaje + legibilidad. Glosario inline total (RF, hidden node,
> b/g→802.11b/g, slots, fallback, throughput, NAT, TTL, socket…), chips tocables en cada
> cabecera TCP/IP/MAC/PHY, mini-glosario en el simulador CSMA, slide 09 Glosario con buscador,
> hint global en el header, tipografía base subida (~14-16px cuerpo) y alturas fijas en
> viaje/CSMA para eliminar saltos de scroll. Lint/build en verde (sin navegador en esta sesión).
>
> **Sesión 4 (completada):** auditoría técnica + fix tooltips recortados. Verificado contra estándar:
> 60 GHz correcto (se aclaró "¡giga, no mega!"); DIFS corregido a 28/34/50 µs según banda;
> Frame Body 2346→2304; "Hola, ¿llegas?" 18→15 bytes; bridge Ethernet transparente (conserva MACs);
> Address 3 precisada; OFDM calificado a 20 MHz. Tooltips migrados a portal con flip automático
> (ya ningún overflow:hidden los recorta); quitado overflow de .journey-visual y height fijo
> de .wave-scene. Lint/build en verde.
>
> **Sesión 1 (histórica):** se había pedido _"Cargá el skill `frontend-design` y aplicá el
> `REDESIGN_PLAN.md`"_ — ya aplicado (dirección "Noche de radio", hoy reemplazada por `stitch`).

## 0. Contexto del proyecto

- React 19 + Vite 8 + `@vitejs/plugin-react-swc`, archivos `.jsx`, estilos en `src/styles.css` (único CSS global con variables `:root`).
- Shell de slides en `src/Presentation.jsx` + 8 slides en `src/components/`.
- Audiencia: estudiantes exponiendo en clase (Redes de Datos 4k2). Tono: educativo, claro, memorable.
- Quejas a resolver: (1) paleta de colores fea, (2) animaciones poco creativas / transiciones feas,
  (3) exceso de jerga sin explicar (ej. "scrambling"), (4) falta de animaciones visibles
  (ej. un dato que realmente "viaje por el aire" hasta el AP).

## 1. Nueva dirección estética (propuesta; el skill decide el detalle final)

- **Concepto:** "Noche de radio" — laboratorio nocturno de RF, fondo tinta profundo con una sola
  señal luminosa ámbar + cian de apoyo. Nada de degradados violeta-azul genéricos.
- **Paleta propuesta (roles fijos, sin excepciones):**
  - Fondo: `#060B18` (tinta) / panel `#0C1428` / línea `#1E2C4F`
  - Texto: `#EDF2FF` / secundario `#8FA0C2`
  - Acento primario (señal/acción): ámbar `#FFB224`
  - Acento secundario (aire/datos): cian `#22D3EE`
  - Éxito: `#34D399` / peligro: `#F87171` / aviso NAV: conservar ámbar con otro tratamiento
  - Eliminar el uso actual de rosa/púrpura salvo que el skill lo justifique.
- **Tipografía (Google Fonts, link en `index.html`):** display `Sora` o similar con carácter técnico;
  cuerpo legible para aula (`Atkinson Hyperlegible` ideal para estudiantes); mono `JetBrains Mono`.
  Prohibido: Inter/Roboto/Arial/system como idea visual principal.
- **Texturas/detalle:** grano sutil (SVG noise), malla de fondo tipo "espectro", bordes con glow tenue
  solo en elementos activos. Iconografía: reemplazar emojis por SVG inline propio.

## 2. Transiciones entre slides (hoy: `slideIn` genérico)

- Transición direccional: avanzar desliza desde la derecha, retroceder desde la izquierda
  (rastrear dirección en `Presentation.jsx` con el índice anterior).
- Crossfade + leve `translateX` + blur de 120 ms solo con `transform/opacity`.
- Barra de progreso con shimmer; dots de navegación con tooltip del título (ya existe `title`).
- Respetar `prefers-reduced-motion` en todo el sitio.

## 3. Animaciones por componente (lo importante: que SE VEAN)

### `PacketJourney.jsx` — "el dato viaja"
- Nueva escena "vuelo": SVG con ruta curva **dispositivo → ondas en el aire → AP → cable → switch/servidor**;
  un **paquete luminoso recorre la ruta** (`offset-path` o animación SMIL/CSS sobre el path) en cada paso,
  con anillos de onda expandiéndose desde las antenas.
- Encapsulado: las cabeceras (TCP→IP→MAC) se **apilan con stagger** (una cae sobre otra), no solo aparecen.
- Paso MAC: al pasar el mouse por un campo, el campo **pulsa** y el panel muestra la explicación
  (mantener interacción actual, mejorar el affordance).
- Paso PHY: animar el pipeline chip por chip durante el play (los `phy-chip` ya existen: encenderlos
  en secuencia en vez de todos juntos).
- Paso AP: el check de "¿es para mí?" con **comparación visual de BSSID** (las dos MAC se iluminan
  carácter por carácter al coincidir).

### `SlideCSMACA.jsx` — simulador
- Playhead automático: durante `▶ Play`, el contador de slots de backoff **descuenta solo**
  (animación real, no saltos entre pasos fijos); la barra NAV **se drena** como temporizador.
- Tramas RTS/CTS/DATA/ACK como **píldoras que vuelan** entre STA-X ↔ AP (pequeña animación SVG/CSS).
- La barra de medio conserva el sweep pero con color y etiqueta del estado actual.
- Escenario "sin CTS": mostrar el CW **duplicándose visualmente** (la fila de slots crece 15→31).

### `SlideStandards.jsx` — tabla
- Expandir filas con animación `grid-template-rows: 0fr → 1fr` (no aparición brusca).
- Agregar mini **barra logarítmica de velocidad** por fila (54M → 9.6G) para que la evolución se vea
  de un vistazo.

### `SlideAdHoc.jsx` / `SlideInfra.jsx` — topologías
- Puntos de datos **moviéndose por los enlaces** (círculos animados sobre las líneas, no solo dash).
- Hover en un nodo: resalta sus enlaces y atenúa el resto.

### `SlideIntro.jsx` / `SlideMAC.jsx` / `SlideElements.jsx`
- Pila de capas con reveal escalonado al entrar al slide (stagger).
- Compatibilidad: convertir en **línea de tiempo vertical** con conector animado.
- Antenas: el patrón de radiación ya es SVG — animar el barrido (rotación/pulso del haz).

## 4. Jerga: componente `<Term>` + glosario (obligatorio)

Crear `src/components/Term.jsx`: término subrayado con puntitos; hover/click muestra tooltip con
definición de una línea + ejemplo. Aplicarlo como mínimo a estos términos donde aparezcan:

| Término | Definición corta sugerida |
|---|---|
| Scrambling | Mezcla los bits para evitar secuencias largas de 0/1 que confunden al receptor |
| FEC / LDPC | Códigos que agregan redundancia para corregir errores sin retransmitir |
| Interleaving | Reordena bits para que un error puntual no destruya un símbolo entero |
| QAM | Modulación que combina amplitud y fase: más bits por símbolo, más sensible al ruido |
| OFDM / OFDMA | Divide el canal en muchas subportadoras (A = acceso multiusuario por subgrupos) |
| MIMO / MU-MIMO | Varias antenas transmiten flujos paralelos (MU = a varios clientes a la vez) |
| NAV | Temporizador virtual: "no hables hasta que expire" aunque escuches silencio |
| DIFS / SIFS | Silencios obligatorios antes de hablar (DIFS largo) o entre tramas de un intercambio (SIFS corto) |
| Backoff / CW | Espera aleatoria de 0–CW slots para desempatar estaciones |
| RTS / CTS | "¿Puedo hablar?" / "Adelante": reserva el canal antes de los datos |
| FCS (CRC-32) | Huella matemática de la trama; si no coincide, se descarta |
| BSSID / SSID | MAC del AP (BSSID) vs nombre de la red que ves (SSID) |
| Beacon | Anuncio periódico del AP con SSID, capacidades y timestamp |
| Hidden node | Dos estaciones que no se escuchan entre sí pero chocan en el AP |
| ESS / BSS / roaming | BSS = un AP + clientes; ESS = varios BSS con mismo SSID; roaming = cambiar de AP sin cortar |
| dBm / RSSI | Potencia de señal recibida (más cercano a 0 = mejor) |

## 5. Archivos a tocar (mapeo)

| Archivo | Cambio |
|---|---|
| `index.html` | Título (ok), fonts de Google, `lang="es"` (ok) |
| `src/styles.css` | Nuevos tokens, tipografías, keyframes, tooltips, utilidades de motion |
| `src/Presentation.jsx` | Transición direccional, shimmer en progreso |
| `src/components/Term.jsx` | **Nuevo**: tooltip de glosario |
| `src/components/PacketJourney.jsx` | Escena de vuelo SVG + stagger de headers + pipeline PHY secuencial + match de BSSID |
| `src/components/SlideCSMACA.jsx` | Backoff animado en play, tramas voladoras, NAV drenable, CW que crece |
| `src/components/SlideStandards.jsx` | Expand animado + barra log de velocidad |
| `src/components/SlideAdHoc.jsx`, `SlideInfra.jsx` | Paquetes en movimiento + hover de enlaces |
| `src/components/SlideIntro.jsx`, `SlideMAC.jsx`, `SlideElements.jsx` | Stagger de entrada, timeline, barrido de antena |
| Todos los slides | Reemplazar emojis por SVG inline; envolver jerga con `<Term>` |

## 6. Orden de ejecución sugerido

1. Tokens + tipografías + `Term.jsx` (base de todo).
2. `Presentation.jsx` (transiciones).
3. `PacketJourney.jsx` (pieza estrella).
4. `SlideCSMACA.jsx` (segunda pieza estrella).
5. Resto de slides + reemplazo de emojis.
6. `npm run build` + `npm run lint`, revisión responsive y `prefers-reduced-motion`.

## 7. Criterios de aceptación

- `npm run build` y `npm run lint` en verde.
- Ningún término del glosario aparece sin tooltip.
- Cada slide tiene al menos una animación visible y con propósito (no decoración gratuita).
- Funciona en desktop y mobile; sin solapamientos de texto.
- Con `prefers-reduced-motion`: todo queda estático pero legible.
