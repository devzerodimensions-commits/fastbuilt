# Fastbuilt — Permanent link banana (deploy)

Site build ho chuki hai: **`web/dist`** folder (5 MB, fully self-contained — images, fonts, logo sab andar).
Isme abhi bundled sample data hai, to koi backend/DB ki zarurat nahi — bas ye folder host karo.

## Sabse aasan (Netlify Drop) — 2 minute
1. Browser me kholo: **https://app.netlify.com/drop**
2. `web\dist` folder ko us page pe **drag-and-drop** kar do.
3. Turant ek live link mil jayega (jaise `https://random-name.netlify.app`).
4. Link **permanent** rakhne ke liye free account bana lo (GitHub/email se 1 click) — "Claim / Keep this site".
5. Chaho to Netlify me **Site settings → Change site name** se link ka naam badal lo (e.g. `fastbuilt.netlify.app`).
6. Baad me apna domain (fastbuilt.in) bhi laga sakte ho: Domain settings → Add custom domain.

> Ye link kisi ko bhi bhej sakte ho — unke phone/PC sab pe khulega, tera PC band ho tab bhi. 🎉

## Alternative hosts (same dist folder)
- **Cloudflare Pages** — pages.cloudflare.com → Upload assets → `dist` folder.
- **Vercel** — vercel.com → new project → drag dist (or connect GitHub).
- **Render (Static Site)** — GitHub repo se; build command `npm --prefix web run build`, publish dir `web/dist`.

## Site update karne pe (naye changes)
Jab bhi kuch change karo:
```
cd web
npm run build
```
Phir naya `web\dist` folder dobara drag-drop (ya host apne aap rebuild kar dega agar GitHub se connected hai).

## Aage jab real data + admin panel chahiye (optional, full-stack)
Tab backend (Node) + PostgreSQL bhi deploy karna hoga (Render + Render Postgres).
Frontend me `VITE_API_URL` set karke usse connect karenge. Abhi ke review/sharing ke liye upar wala static deploy kaafi hai.
