// Workers / on-site people — same hover behaviour as the Team page.
// Photos cropped from the client's PDF collage; B&W ones AI-colourised.
// Replace with real worker photos + names later.
export const WORKERS = [
  { name: 'Ramesh Patel', role: 'Senior Mason', img: 'worker1' },
  { name: 'Sita Ben', role: 'Steel Fixer', img: 'worker2' },
  { name: 'Imran Shaikh', role: 'Site Supervisor', img: 'worker3' },
  { name: 'On-site Crew', role: 'Erection Team', img: 'worker4' },
  { name: 'Mahesh Rana', role: 'Shuttering Carpenter', img: 'worker5' },
  { name: 'Dinesh Chauhan', role: 'Concrete Foreman', img: 'worker6' },
]

export function imgWorker(k) { return `/images/workers/${k}.jpg` }
