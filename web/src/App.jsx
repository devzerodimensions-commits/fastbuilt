import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useSettings } from './lib/settings'
import Header from './components/Header'
import Home from './pages/Home'
import Team from './pages/Team'
import Workers from './pages/Workers'
import PageTransition from './components/PageTransition'
import IntroLoader from './components/IntroLoader'
import AdminLogin from './pages/admin/AdminLogin'
import AdminForgot from './pages/admin/AdminForgot'
import AdminReset from './pages/admin/AdminReset'
import AdminDashboard from './pages/admin/AdminDashboard'

export default function App() {
  const { pathname } = useLocation()
  const settings = useSettings()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  // Apply a custom favicon set in the dashboard (Settings). Falls back to the
  // static /favicon.ico shipped in index.html when none is configured.
  useEffect(() => {
    const fav = settings?.favicon
    if (!fav || fav === '/favicon.ico') return
    document.querySelectorAll("link[rel~='icon'], link[rel='apple-touch-icon']").forEach((l) => l.remove())
    const link = document.createElement('link')
    link.rel = 'icon'
    link.href = fav
    document.head.appendChild(link)
  }, [settings?.favicon])

  // Keep the browser tab title in sync with the site title/tagline setting
  useEffect(() => {
    if (settings?.site_title) document.title = `${settings.site_title}${settings.tagline ? ' — ' + settings.tagline : ''}`
  }, [settings?.site_title, settings?.tagline])

  const isAdmin = pathname.startsWith('/admin')

  // Admin area — no public site chrome (header, intro, transitions)
  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/forgot" element={<AdminForgot />} />
        <Route path="/admin/reset" element={<AdminReset />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    )
  }

  return (
    <>
      <IntroLoader />
      <PageTransition />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/team" element={<Team />} />
        <Route path="/workers" element={<Workers />} />
      </Routes>
    </>
  )
}
