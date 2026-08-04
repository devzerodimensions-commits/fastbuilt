// Small square brand-style marks per category (like the icons in the reference site)
const ICONS = {
  PEB: (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" fill="#111" />
      <path d="M9 27V17l11-6 11 6v10" stroke="#fff" strokeWidth="1.8" />
      <path d="M9 27h22" stroke="#fff" strokeWidth="1.8" />
      <path d="M15 27v-6h10v6" stroke="#fff" strokeWidth="1.5" />
    </svg>
  ),
  Civil: (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" fill="#111" />
      <path d="M8 15c4 0 4 4 8 4s4-4 8-4 4 4 8 4" stroke="#fff" strokeWidth="1.8" />
      <path d="M11 19v10M20 19v10M29 19v10" stroke="#fff" strokeWidth="1.6" />
      <path d="M8 29h24" stroke="#fff" strokeWidth="1.8" />
    </svg>
  ),
  'Container Structures': (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" fill="#111" />
      <rect x="9" y="14" width="22" height="13" stroke="#fff" strokeWidth="1.8" />
      <path d="M13 14v13M17 14v13M23 14v13M27 14v13" stroke="#fff" strokeWidth="1.2" />
    </svg>
  ),
  'Other Works': (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" fill="#111" />
      <circle cx="20" cy="20" r="5.5" stroke="#fff" strokeWidth="1.8" />
      <path d="M20 8v4M20 28v4M8 20h4M28 20h4M11.5 11.5l2.8 2.8M25.7 25.7l2.8 2.8M28.5 11.5l-2.8 2.8M14.3 25.7l-2.8 2.8" stroke="#fff" strokeWidth="1.6" />
    </svg>
  ),
}

export default function CategoryIcon({ category }) {
  return <span className="picon">{ICONS[category] || ICONS['Other Works']}</span>
}
