import { SECTION_DEFAULTS } from "./content.js";

export const DEFAULT_SETTINGS = {
  ...SECTION_DEFAULTS,
  siteUrl: "",
  ogImage: "",
  favicon: "",
  googleVerification: "",
  ga4Id: "",
  headerCta: "Apply now",
  formTimings: ["Morning (10 AM – 1 PM)", "Afternoon (2 PM – 5 PM)", "Evening (6 PM – 9 PM)", "Weekend"],
  batchTimes: [
    { title: "Morning", hours: "10 AM – 1 PM", text: "Best for students and fresh graduates" },
    { title: "Afternoon", hours: "2 PM – 5 PM", text: "For those with flexible days" },
    { title: "Evening", hours: "6 PM – 9 PM", text: "For working people and business owners" },
    { title: "Weekend", hours: "Sat & Sun", text: "For anyone busy during the week" },
  ],
  trainerPrinciples: [
    { title: "Active practitioners", text: "Every trainer runs live SEO, ads, automation or development projects alongside teaching." },
    { title: "Show, then do", text: "Trainers demo on a real screen, then sit with you while you do it yourself." },
    { title: "Honest feedback", text: "Your work is reviewed line by line — what's good, what's not, and how to fix it." },
    { title: "Reachable", text: "Questions after class? Trainers stay for practice time and answer on the class group." },
  ],
  certificatePoints: ["Awarded after your final project is reviewed", "Unique certificate ID for every student", "Anyone can verify it on our website", "Add it to your CV, LinkedIn and Fiverr/Upwork profile"],
  siteName: "eSkill Institute",
  tagline: "An on-campus institute for search, marketing, AI and web skills — taught by people who do the work.",
  logo: "",
  topbarText: "",
  phone: "+92 300 0000000",
  whatsapp: "923000000000",
  email: "info@yourinstitute.pk",
  address: "Your campus address, City, Pakistan",
  campusHours: "Mon – Sat · 10:00 AM – 9:00 PM",
  mapEmbed: "",
  facebook: "", instagram: "", youtube: "", linkedin: "", tiktok: "",

  heroBadge: "First batches now forming · On-campus",
  heroTitle: "Learn the skills the internet",
  heroHighlight: "actually runs on.",
  heroSubtitle: "SEO for Google and AI search, social media, Meta ads, AI automation and web development — taught in Urdu & English, in small classroom batches, on real Pakistani businesses and projects.",
  heroImage: "",

  stats: [
    { value: "14", label: "Specialised programs" },
    { value: "On-campus", label: "Classroom batches" },
    { value: "Small", label: "Batches, real attention" },
    { value: "Project-first", label: "Portfolio from week one" },
  ],

  mission: "Most institutes still teach the internet of ten years ago. We built this one around how search, marketing and software actually work today — Google and AI answers side by side, automation everywhere, and clients who pay for results, not certificates.",
  vision: "A city where anyone willing to put in the work can learn a modern digital skill properly, in a real classroom, close to home.",
  aboutTitle: "A classroom built around what the market pays for today",
  aboutText: "We are practitioners first — SEO specialists, marketers, automation builders and developers who run real projects every week.\n\nWe started this institute because we kept meeting talented people who had sat through long courses and still couldn't do the job: outdated syllabi, slides instead of practice, and no one to review their work.\n\nSo we did it the other way round. Small batches. A real classroom. Every topic taught on a live website, account or app. And a trainer who checks your work, not just your attendance.",
  aboutImage: "",

  whyUs: [
    { icon: "", title: "Taught on real projects", text: "Every module is practised on a live website, ad account or app — often for real local businesses." },
    { icon: "", title: "Small classroom batches", text: "Limited seats so your trainer knows your name, your project and where you're stuck." },
    { icon: "", title: "Updated for AI search", text: "We teach Google and AI answers (ChatGPT, Gemini, Perplexity) together — because that's how people search now." },
    { icon: "", title: "Portfolio, not just a certificate", text: "You leave with work you can show clients and employers, plus a certificate anyone can verify." },
  ],

  comparison: [
    { topic: "Syllabus", traditional: "Same notes for years", ours: "Reviewed every batch — includes AI search, automation and new ad formats" },
    { topic: "Practice", traditional: "Theory, slides and dummy exercises", ours: "Live websites, real ad accounts and working apps from week one" },
    { topic: "Search", traditional: "Google-only, keyword-stuffing era SEO", ours: "SEO + AEO + GEO: rank on Google and get cited in AI answers" },
    { topic: "Trainers", traditional: "Full-time lecturers", ours: "Practitioners who run client projects every week" },
    { topic: "Batch size", traditional: "Crowded halls", ours: "Small batches with one-to-one feedback" },
    { topic: "Examples", traditional: "Foreign case studies you can't relate to", ours: "Pakistani businesses — local shops on Google Maps, Daraz & Shopify stores, clinics, real estate" },
    { topic: "Outcome", traditional: "A certificate", ours: "A portfolio, a verifiable certificate and a clear path to a job, clients or your own business" },
  ],

  howSteps: [
    { title: "Visit or call", text: "Talk to an advisor, see the campus and pick the program and timing that fits you." },
    { title: "Learn in class", text: "Short, focused sessions with a trainer — explain, demo, then you do it yourself in class." },
    { title: "Build on real work", text: "Each module ends with a project on a live site, account or app that goes into your portfolio." },
    { title: "Get reviewed & certified", text: "Your final project is reviewed by the trainer. Pass and you get a certificate with a unique ID." },
  ],

  admissionSteps: [
    { title: "Apply or call", text: "Fill the short form or call us. An advisor gets back to you within a day." },
    { title: "Free counselling", text: "Visit the campus (or talk on call) to understand the program, timings and what you'll build." },
    { title: "Reserve your seat", text: "Confirm your batch and timing. Seats are limited and filled in order." },
    { title: "Start your batch", text: "Orientation on day one, then straight into hands-on classes." },
  ],
  eligibility: [
    "Students (intermediate and above), graduates and working professionals",
    "Business owners who want to grow their own business online",
    "Freelancers who want to add a high-demand skill",
    "Basic computer use is enough for most programs — no coding needed unless stated",
  ],

  campusTitle: "A real classroom, not a recorded video",
  campusText: "Classes happen on campus in a focused lab setting — a trainer in the room, your batch around you, and time set aside every session for hands-on practice and questions.",
  campusImage: "",
  campusFeatures: ["Computer lab with high-speed internet and power backup", "Classes in Urdu & English", "Morning batches for students, evening & weekend batches for working people", "Practice time and trainer help after class"],

  ctaTitle: "Ready to start? Let's find your batch.",
  ctaText: "Tell us what you want to learn and when you're free. An advisor will call you with batch dates, timings and everything you need to know.",

  bankName: "", accountTitle: "", accountNumber: "", iban: "", jazzcash: "", easypaisa: "",
  paymentNote: "",

  footerAbout: "An on-campus institute teaching SEO, AI search, social media, Meta ads, AI automation, web development and vibe coding — in small, project-based batches.",
  seoTitle: "eSkill Institute — SEO, AI Search, Marketing & Web Courses in Pakistan",
  seoDescription: "On-campus courses in SEO, Local SEO, Technical SEO, AI SEO, AEO, GEO, social media marketing, Meta ads, AI automation, web development and vibe coding.",
};
