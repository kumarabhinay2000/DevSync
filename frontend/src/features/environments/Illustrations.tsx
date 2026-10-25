import type { EnvId } from './data'

/** Flat, decorative illustrations. They carry no data. */
function Development() {
  return (
    <svg viewBox="0 0 240 150" className="h-full w-full" aria-hidden>
      <rect width="240" height="150" rx="14" fill="#E8EEFF" />
      {/* background windows */}
      <rect x="18" y="26" width="52" height="38" rx="6" fill="#fff" stroke="#B9C9FF" strokeWidth="2" />
      <rect x="26" y="36" width="26" height="4" rx="2" fill="#B9C9FF" />
      <rect x="26" y="46" width="34" height="4" rx="2" fill="#D6E0FF" />
      <rect x="176" y="18" width="48" height="34" rx="6" fill="#fff" stroke="#B9C9FF" strokeWidth="2" />
      <circle cx="187" cy="29" r="3" fill="#275DFF" />
      <rect x="195" y="27" width="22" height="4" rx="2" fill="#D6E0FF" />
      <rect x="184" y="39" width="32" height="4" rx="2" fill="#D6E0FF" />
      {/* laptop */}
      <rect x="64" y="30" width="112" height="76" rx="9" fill="#fff" stroke="#275DFF" strokeWidth="3" />
      <rect x="72" y="38" width="96" height="60" rx="4" fill="#152022" />
      <text x="82" y="62" fontSize="17" fontWeight="700" fill="#BAE4D0" fontFamily="ui-monospace, Consolas, monospace">
        {'>_'}
      </text>
      <rect x="82" y="72" width="52" height="4" rx="2" fill="#3a4a55" />
      <rect x="82" y="82" width="34" height="4" rx="2" fill="#3a4a55" />
      <path d="M52 108h136l-8 12H60z" fill="#275DFF" />
    </svg>
  )
}

function Staging() {
  return (
    <svg viewBox="0 0 240 150" className="h-full w-full" aria-hidden>
      <rect width="240" height="150" rx="14" fill="#DDF0E6" />
      {/* browser / test window */}
      <rect x="36" y="22" width="132" height="92" rx="8" fill="#fff" stroke="#3F9E78" strokeWidth="3" />
      <path d="M36 30a8 8 0 0 1 8-8h116a8 8 0 0 1 8 8v10H36z" fill="#BAE4D0" />
      <circle cx="48" cy="31" r="3" fill="#3F9E78" />
      <circle cx="58" cy="31" r="3" fill="#3F9E78" />
      <circle cx="68" cy="31" r="3" fill="#3F9E78" />
      <rect x="48" y="54" width="60" height="6" rx="3" fill="#BAE4D0" />
      <path d="M50 74l6 6 10-12" fill="none" stroke="#2E8B66" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="74" y="72" width="64" height="6" rx="3" fill="#D6EDE2" />
      <path d="M50 94l6 6 10-12" fill="none" stroke="#2E8B66" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="74" y="92" width="48" height="6" rx="3" fill="#D6EDE2" />
      {/* flask */}
      <path
        d="M178 58h22v22l16 28a8 8 0 0 1-7 12h-40a8 8 0 0 1-7-12l16-28z"
        fill="#BAE4D0"
        stroke="#2E8B66"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <rect x="174" y="52" width="30" height="7" rx="3.5" fill="#fff" stroke="#2E8B66" strokeWidth="3" />
      <path d="M170 106h38" stroke="#2E8B66" strokeWidth="3" strokeLinecap="round" />
      <circle cx="188" cy="96" r="3" fill="#2E8B66" />
      <circle cx="198" cy="88" r="2.4" fill="#2E8B66" />
    </svg>
  )
}

function Production() {
  return (
    <svg viewBox="0 0 240 150" className="h-full w-full" aria-hidden>
      <rect width="240" height="150" rx="14" fill="#E4E8EE" />
      {/* cloud */}
      <g fill="#1B2A4A">
        <circle cx="94" cy="66" r="24" />
        <circle cx="126" cy="52" r="30" />
        <circle cx="158" cy="68" r="22" />
        <rect x="94" y="66" width="64" height="24" />
      </g>
      <path d="M118 74l8 8 14-16" fill="none" stroke="#BAE4D0" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {/* servers */}
      <g>
        <rect x="88" y="100" width="64" height="16" rx="4" fill="#fff" stroke="#1B2A4A" strokeWidth="2.5" />
        <circle cx="99" cy="108" r="2.6" fill="#1B2A4A" />
        <rect x="110" y="106" width="30" height="4" rx="2" fill="#B5BECC" />
        <rect x="88" y="120" width="64" height="16" rx="4" fill="#fff" stroke="#1B2A4A" strokeWidth="2.5" />
        <circle cx="99" cy="128" r="2.6" fill="#1B2A4A" />
        <rect x="110" y="126" width="30" height="4" rx="2" fill="#B5BECC" />
      </g>
      <path d="M120 90v10M120 116v4" stroke="#1B2A4A" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export function EnvIllustration({ id }: { id: EnvId }) {
  if (id === 'staging') return <Staging />
  if (id === 'production') return <Production />
  return <Development />
}
