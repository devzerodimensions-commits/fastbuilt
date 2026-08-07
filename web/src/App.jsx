import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/Header'
import Home from './pages/Home'
import Project from './pages/Project'
import Team from './pages/Team'
import Workers from './pages/Workers'
import PageTransition from './components/PageTransition'
import IntroLoader from './components/IntroLoader'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'

export default function App() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  const isAdmin = pathname.startsWith('/admin')

  // Admin area — no public site chrome (header, intro, transitions)
  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
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
        <Route path="/project/:slug" element={<Project />} />
        <Route path="/team" element={<Team />} />
        <Route path="/workers" element={<Workers />} />
      </Routes>
    </>
  )
}
