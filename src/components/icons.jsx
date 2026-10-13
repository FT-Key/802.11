/**
 * Icon — set propio de iconos SVG inline (trazo, currentColor).
 * Reemplaza los emojis de la UI para una estética consistente.
 */

function Svg({ children, size = 20, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const WifiIcon = (p) => (
  <Svg {...p}>
    <path d="M2.5 9a15 15 0 0 1 19 0" />
    <path d="M5.5 12.5a10.5 10.5 0 0 1 13 0" />
    <path d="M8.6 16a6 6 0 0 1 6.8 0" />
    <circle cx="12" cy="19.2" r="1.3" fill="currentColor" stroke="none" />
  </Svg>
)

export const LaptopIcon = (p) => (
  <Svg {...p}>
    <rect x="4" y="4.5" width="16" height="11" rx="1.5" />
    <path d="M2.5 19.5h19" />
  </Svg>
)

export const PhoneIcon = (p) => (
  <Svg {...p}>
    <rect x="7" y="2.5" width="10" height="19" rx="2" />
    <circle cx="12" cy="18" r="0.9" fill="currentColor" stroke="none" />
  </Svg>
)

export const ApIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    <path d="M8.5 15.5a5 5 0 0 1 7 0" />
    <path d="M6 18a9 9 0 0 1 12 0" />
    <path d="M12 13.5V21" />
    <path d="M8.5 21h7" />
  </Svg>
)

export const ChipIcon = (p) => (
  <Svg {...p}>
    <rect x="7" y="7" width="10" height="10" rx="1.5" />
    <path d="M10 2.5v3M14 2.5v3M10 18.5v3M14 18.5v3M2.5 10h3M2.5 14h3M18.5 10h3M18.5 14h3" />
  </Svg>
)

export const CardIcon = (p) => (
  <Svg {...p}>
    <rect x="2.5" y="5" width="19" height="14" rx="2" />
    <path d="M2.5 10h19" />
    <path d="M6 15h4" />
  </Svg>
)

export const AntennaIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    <path d="M12 13.5V21" />
    <path d="M5 5.5a10 10 0 0 1 14 0" />
    <path d="M7.5 8a6.5 6.5 0 0 1 9 0" />
  </Svg>
)

export const CheckIcon = (p) => (
  <Svg {...p}>
    <path d="M4 12.5l5 5L20 6.5" />
  </Svg>
)

export const XIcon = (p) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
)

export const PlayIcon = (p) => (
  <Svg {...p}>
    <path d="M7 4.5l13 7.5-13 7.5z" fill="currentColor" stroke="none" />
  </Svg>
)

export const PauseIcon = (p) => (
  <Svg {...p}>
    <rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none" />
    <rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none" />
  </Svg>
)

export const RestartIcon = (p) => (
  <Svg {...p}>
    <path d="M3.5 12a8.5 8.5 0 1 1 2.5 6" />
    <path d="M3.5 12V6.5M3.5 12H9" />
  </Svg>
)

export const ChevLIcon = (p) => (
  <Svg {...p}>
    <path d="M14.5 5.5L8 12l6.5 6.5" />
  </Svg>
)

export const ChevRIcon = (p) => (
  <Svg {...p}>
    <path d="M9.5 5.5L16 12l-6.5 6.5" />
  </Svg>
)

export const InfoIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5" />
    <circle cx="12" cy="7.8" r="1" fill="currentColor" stroke="none" />
  </Svg>
)

export const BoltIcon = (p) => (
  <Svg {...p}>
    <path d="M13 2.5L4.5 13.5H11L10 21.5l8.5-11H12z" />
  </Svg>
)

export const ShieldIcon = (p) => (
  <Svg {...p}>
    <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z" />
    <path d="M8.8 12l2.2 2.2 4.2-4.4" />
  </Svg>
)

export const LayersIcon = (p) => (
  <Svg {...p}>
    <path d="M12 3l9 5-9 5-9-5z" />
    <path d="M3 13l9 5 9-5" />
  </Svg>
)

export const ClockIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </Svg>
)

export const BookIcon = (p) => (
  <Svg {...p}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
    <path d="M4 20.5V5.5" />
    <path d="M20 18v3H6.5" />
  </Svg>
)

export const SignalIcon = (p) => (
  <Svg {...p}>
    <path d="M4 20v-6M9.3 20v-10M14.6 20V8M20 20V4" />
  </Svg>
)

export const CableIcon = (p) => (
  <Svg {...p}>
    <path d="M4 17h9a4 4 0 0 0 4-4V6" />
    <rect x="15" y="2.5" width="6" height="7" rx="1" />
    <path d="M2.5 17v4M5.5 17v2.5" />
  </Svg>
)

export const ServerIcon = (p) => (
  <Svg {...p}>
    <rect x="4" y="3.5" width="16" height="7" rx="1.5" />
    <rect x="4" y="13.5" width="16" height="7" rx="1.5" />
    <circle cx="7.5" cy="7" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="7.5" cy="17" r="0.9" fill="currentColor" stroke="none" />
  </Svg>
)

export const ArrowRIcon = (p) => (
  <Svg {...p}>
    <path d="M3.5 12h17M14 5.5L20.5 12 14 18.5" />
  </Svg>
)

export const MuteIcon = (p) => (
  <Svg {...p}>
    <path d="M4 10v4h3l4 3.5v-11L7 10z" />
    <path d="M16 9.5l5 5M21 9.5l-5 5" />
  </Svg>
)

export const DiceIcon = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
    <circle cx="8.5" cy="8.5" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="15.5" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="8.5" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="8.5" cy="15.5" r="1.1" fill="currentColor" stroke="none" />
  </Svg>
)
