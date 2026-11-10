// Editable text blocks. Each section becomes Settings fields named h_<key>_kicker / _title / _highlight / _text.
// "{count}" in a title is replaced with the number of live programs.
export const SECTIONS = [
  // [key, admin label, tab, defaults]
  ["home_mission", "Home · Mission", "Homepage", { kicker: "Why we exist" }],
  ["home_programs", "Home · Programs list", "Homepage", { kicker: "What we teach", title: "{count} programs.", highlight: "One goal: job-ready.", text: "Pick one specialisation or stack them. Each program has its own page with the full curriculum, schedule and projects." }],
  ["home_featured", "Home · Featured programs", "Homepage", { kicker: "Most asked about", title: "Where most students start" }],
  ["home_compare", "Home · Comparison", "Homepage", { kicker: "Why we're different", title: "Not another", highlight: "computer course.", text: "Here's what changes when the syllabus is built by people who do this work every week." }],
  ["home_how", "Home · How a batch works", "Homepage", { kicker: "How a batch works", title: "From first visit to", highlight: "final project." }],
  ["home_batches", "Home · Upcoming batches", "Homepage", { kicker: "Upcoming batches", title: "Seats are limited. Pick your start date." }],
  ["home_campus", "Home · Campus", "Homepage", { kicker: "The campus", title: "Your classroom is waiting." }],
  ["home_trainers", "Home · Trainers", "Homepage", { kicker: "Trainers", title: "Taught by people who", highlight: "do the work.", text: "Every trainer runs live client projects — and brings them into class." }],
  ["home_stories", "Home · Student stories", "Homepage", { kicker: "Student stories", title: "In their own words" }],
  ["home_workshops", "Home · Workshops", "Homepage", { kicker: "Free workshops", title: "Come for a workshop. See how we teach." }],
  ["home_apply", "Home · Apply form", "Homepage", { kicker: "Admissions open", title: "Apply for the next batch", text: "Takes 30 seconds. We'll call you back." }],
  ["home_faq", "Home · FAQ", "Homepage", { kicker: "FAQ", title: "Questions, answered." }],
  ["home_blog", "Home · Blog", "Homepage", { kicker: "From the blog", title: "Guides for your next step" }],

  ["admissions_hero", "Admissions · Top", "Pages text", { kicker: "Admissions open", title: "Joining is simple.", highlight: "Seats are limited.", text: "Apply in 30 seconds, get a free counselling call or campus visit, and reserve your seat in the batch and timing that suits you." }],
  ["admissions_steps", "Admissions · Process", "Pages text", { kicker: "How admission works" }],
  ["admissions_eligibility", "Admissions · Who can apply", "Pages text", { kicker: "Who can apply", title: "If you can use a computer, you can start." }],
  ["admissions_timings", "Admissions · Batch timings", "Pages text", { kicker: "Batch timings", text: "Exact timings vary by program — check the batch list below or ask admissions." }],
  ["admissions_batches", "Admissions · Batch list", "Pages text", { kicker: "Upcoming batches", title: "Every program, every start date." }],
  ["admissions_form", "Admissions · Form", "Pages text", { kicker: "Application form", title: "Apply for a batch", text: "No fee to apply. An advisor will call you within one working day." }],
  ["admissions_faq", "Admissions · FAQ", "Pages text", { kicker: "FAQ", title: "Before you apply." }],

  ["about_story", "About · Story", "Pages text", { kicker: "Our story", title: "Practitioners first. Teachers second." }],
  ["about_principles", "About · Principles", "Pages text", { kicker: "Our principles", title: "How we do things here" }],
  ["about_team", "About · Who teaches", "Pages text", { kicker: "Who teaches here", title: "The people", highlight: "behind the classes.", text: "We only hire trainers who are doing the work right now — so what you learn on Monday is what the market is using on Monday." }],
  ["about_cta", "About · Bottom call-to-action", "Pages text", { title: "Want to see if we're the right fit?", highlight: "Let's talk." }],

  ["contact_hero", "Contact · Top", "Pages text", { kicker: "Contact", title: "Let's talk about", highlight: "your next step.", text: "Questions about programs, timings or batches? Call, WhatsApp or visit the campus — our admissions team replies the same day." }],
  ["contact_form", "Contact · Form", "Pages text", { title: "Send us a message", text: "Fill in the form and our team will contact you within 24 hours." }],

  ["program_form", "Program page · Apply form", "Pages text", { title: "Apply for this program", text: "Leave your details — admissions will call you with batch dates and timings." }],
  ["program_projects", "Program page · Projects intro", "Pages text", { text: "Every project is done in class with trainer feedback — and goes straight into your portfolio." }],

  ["footer", "Footer · Big headline", "General", { title: "Your next skill starts", highlight: "in a real classroom." }],
];

export const SECTION_DEFAULTS = Object.fromEntries(
  SECTIONS.flatMap(([key, , , d]) => ["kicker", "title", "highlight", "text"].map((p) => [`h_${key}_${p}`, d[p] || ""]))
);

// Per-page SEO: settings fields seo_<key>_title / _description / _image
export const SEO_PAGES = [
  ["home", "Homepage", "/"],
  ["courses", "Programs", "/courses"],
  ["admissions", "Admissions", "/admissions"],
  ["about", "About", "/about"],
  ["contact", "Contact", "/contact"],
  ["events", "Workshops", "/events"],
  ["blog", "Blog", "/blog"],
];

/* Read a section from settings */
export const sec = (s, key, count) => {
  const g = (p) => s[`h_${key}_${p}`] ?? SECTION_DEFAULTS[`h_${key}_${p}`] ?? "";
  const title = String(g("title")).replace("{count}", count ?? "");
  return { kicker: g("kicker"), title, highlight: g("highlight"), text: g("text") };
};
