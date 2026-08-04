import Footer from '../components/Footer'
import { TEAM, imgTeam } from '../lib/team'

export default function Team() {
  return (
    <>
      <section className="team-head">
        <h1>The people behind Fastbuilt</h1>
        <p>Engineers, designers and site teams who deliver every project — fast, and built to last.</p>
      </section>

      <div className="team-grid">
        {TEAM.map((m) => (
          <figure className="team-card" key={m.face}>
            <div className="team-img">
              <img src={imgTeam(m.face)} alt={m.name} loading="lazy" />
            </div>
            <figcaption className="team-cap">
              <span className="tc-name">{m.name}</span>
              <span className="tc-role">{m.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <Footer />
    </>
  )
}
