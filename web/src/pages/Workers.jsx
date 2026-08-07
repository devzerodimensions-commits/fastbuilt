import { useEffect, useState } from 'react'
import Footer from '../components/Footer'
import { fetchWorkers, imgWorker } from '../lib/workers'

export default function Workers() {
  const [workers, setWorkers] = useState([])
  useEffect(() => { fetchWorkers().then(setWorkers) }, [])

  return (
    <>
      <section className="team-head">
        <h1>Our workforce</h1>
        <p>The hands on the ground — masons, fixers, carpenters and site crews who build every Fastbuilt project.</p>
      </section>

      <div className="team-grid workers-grid">
        {workers.map((w) => (
          <figure className="team-card" key={w.id ?? w.image}>
            <div className="team-img">
              <img src={imgWorker(w.image)} alt={w.name} loading="lazy" />
            </div>
            <figcaption className="team-cap">
              <span className="tc-name">{w.name}</span>
              <span className="tc-role">{w.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <Footer />
    </>
  )
}
