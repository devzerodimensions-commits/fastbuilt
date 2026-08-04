import { useLocation } from 'react-router-dom'

// A wipe panel that re-plays on every route change (big.dk-style page transition).
export default function PageTransition() {
  const { pathname } = useLocation()
  return <div className="page-wipe" key={pathname} aria-hidden="true" />
}
