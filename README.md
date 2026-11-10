# eSkill Institute — Website + LMS + Admin CMS

Next.js 16 · React 19 · MongoDB (Mongoose) · Tailwind CSS v4

## Roz chalane ka tareeqa (Windows)

Do terminal kholen, project folder mein:

```bash
npm run db      # Terminal 1: MongoDB start (data .mongo-data folder mein)
npm run dev     # Terminal 2: website -> http://localhost:3000
```

- Website: http://localhost:3000
- Admin panel: http://localhost:3000/admin
- Admin email/password: `.env.local` file mein (`ADMIN_EMAIL`, `ADMIN_PASSWORD`)

## Pehli dafa setup (naye PC par)

```bash
npm install
copy .env.example .env.local   # phir values set karen
npm run db
npm run seed                   # admin + sample courses
npm run dev
```

`npm run seed -- --fresh` poora database saaf karke dobara sample data daalta hai.

## Abhi ka model (physical institute)

Site abhi ek on-campus institute ka portfolio hai: koi price nahi, koi online checkout nahi. Har program ka apna page hai
(curriculum, schedule, batches, projects, tools, careers, FAQs) aur har cheez Admin → Programs se editable hai.
Applications Admin → Applications mein aati hain. Online courses ka code (checkout, LMS player) project mein mojood hai, baad mein on kiya ja sakta hai.

Programs ka shuru ka content `scripts/programs.mjs` mein hai (`npm run seed -- --fresh` isay dobara daal deta hai — poora data saaf karke).

## Kya kya hai

**Website:** Home, Programs (search + filter), Course page (curriculum, batches, projects, tools, mentors, certificate, FAQs, callback form), Checkout (Bank / JazzCash / Easypaisa + transaction ID + screenshot), About, Contact, Blog, Masterclass, Policy pages, Certificate verify.

**Student LMS:** Register/Login, Dashboard, Video player (YouTube / Vimeo / Google Drive / Bunny / MP4), free preview lessons, Mark complete, 100% par certificate (unique ID).

**Admin CMS:** Dashboard, Courses (curriculum builder), Categories, Mentors, Orders (Approve = auto enroll), Enrollments, Students, Leads CRM, Masterclass, Blog, Pages, Testimonials, FAQs, Partners, Site settings (logo, hero text, contact, payment accounts, SEO).

## Images

Edurock template ki saari images `public/template/` mein hain. Admin mein kisi bhi image field mein
`/template/folder/file.png` likhen, ya upload button se apni image daalen (uploads `uploads/` folder mein jati hain).

## Production

```bash
npm run build
npm start
```

VPS par PM2 + Nginx + SSL use karen. `.env.local` mein `COOKIE_SECURE=true` rakhen (HTTPS ke saath) aur `uploads/` folder ka backup rakhen.
