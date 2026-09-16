/* ═══════════════════════════════════════════════════════════════════════════
 *
 *   CONTENT  —  THIS IS THE ONLY FILE YOU NEED TO EDIT.
 *
 *   Everything you see on the site lives in the object below. Change a value
 *   here, save, refresh the browser — done. You never have to touch
 *   index.html, style.css or app.js.
 *
 *   Two rules:
 *     1. Keep the quotes "" around text and the commas , between entries.
 *     2. To add an item to a list, copy an existing block between its { }
 *        braces, paste it below, and edit the copy.
 *
 * ═══════════════════════════════════════════════════════════════════════════ */

window.SITE = {

  /* ─────────────────────────────────────────────────────────────────────────
     WHO YOU ARE  —  drives the hero, the browser tab, and the profile block.
     ───────────────────────────────────────────────────────────────────────── */
  profile: {
    // Full name. Used for the <title> tag and metadata.
    name: "Muhammad Hafizh Rifan Rabtsani",

    // The big hero headline, split into lines. Wrap ONE word in [[ ]] and it
    // will be printed in the accent colour. Add or remove lines freely.
    headline: [
      "Muhammad",
      "[[Hafizh]] Rifan"
    ],

    // The small line above your name. This one decodes on load.
    role: "Software Engineer",

    // City and IANA timezone — powers the live local clock.
    location: "Jakarta, Indonesia",
    timezone: "Asia/Jakarta",

    // Availability pill. Set available to false to show it greyed out.
    available: false,
    availableLabel: "Looking for Opportunities",

    // Link to your CV. Leave as "" to hide the button entirely.
    cvUrl: "https://docs.google.com/document/d/14u-yXx91URZ4HZ2_fvbdaYOk5nNHSyxq/preview",
    cvLabel: "View CV",

    // Contact details, shown in the last section.
    email: "hafizhrifan0515@gmail.com",
    phone: "+62 813 1177 7595",

    // WhatsApp number in international format, digits only, no + or spaces.
    whatsapp: "6281311777595"
  },

  /* ─────────────────────────────────────────────────────────────────────────
     ABOUT  —  the profile section. `lead` is set large in italic serif.
     ───────────────────────────────────────────────────────────────────────── */
  about: {
    lead: "A 4th-year Computer Science student working across software engineering, machine learning, and AI research.",

    body: "At PUSTIKOM UNJ, I developed frontend systems using Vue.js and Nuxt, while at KMUTT, Thailand, I led the machine learning component of an international research project and developed a deployed AI-based cold-chain logistics solution. I also have freelance video editing experience, working with international clients and creating content for different audiences.",

    facts: [
      { label: "Based in", value: "Jakarta, ID" },
      { label: "Studying", value: "Computer Science, UNJ" },
      { label: "Focus", value: "Software · AI/ML · Research" },
      { label: "Status", value: "Looking for Opportunities" }
    ]
  },

  /* ─────────────────────────────────────────────────────────────────────────
     EXPERIENCE  —  newest first. Copy a whole { } block to add a role.
     ───────────────────────────────────────────────────────────────────────── */
  experience: [
    {
      period: "Sep 2026",
      title: "AI Augmented Software Developer",
      org: "SocioTrax — Full-time",
      points: [
        "Handle maintenance, feature development and daily engineering tasks using Next.js and Prisma.",
        "Use AI coding tools to accelerate implementation, debugging and refactoring.",
        "Collaborate through Git/GitHub — code reviews, testing and technical documentation."
      ]
    },
    {
      period: "Jun – Jul 2026",
      title: "AI Research Intern",
      org: "KMUTT, Thailand",
      points: [
        "Researched cold-chain logistics optimization under Assoc. Prof. Dr. Wiboonsak Watthayu and Dr. Suvil Chomchaiya.",
        "Built data pipelines in Python, Pandas and NumPy for shipment-level risk prediction.",
        "Trained Logistic Regression, Random Forest and XGBoost models, reaching up to 0.97 ROC-AUC.",
        "Deployed a full-stack decision-support app with React, Flask, PostgreSQL (Neon) and Vercel."
      ]
    },
    {
      period: "Mar – Jun 2026",
      title: "Software Engineer Intern — Frontend & UI/UX",
      org: "PUSTIKOM, UNJ",
      points: [
        "Built 10 frontend features across Admin and Employee roles for SIPEG, UNJ's personnel system.",
        "Implemented reusable components — DataTables, modals, badges, headers, sidebars — from Figma.",
        "Designed the SIPP document-generation workflow in Figma end to end."
      ]
    },
    {
      period: "Jun 2025",
      title: "Freelance Frontend Developer",
      org: "Remote",
      points: [
        "Designed and built a responsive site in HTML, CSS and vanilla JavaScript to spec.",
        "Owned the full lifecycle — layout, styling, interactivity and deployment.",
        "Deployed and maintained on Netlify."
      ]
    },
    {
      period: "Dec 2024 – Mar 2026",
      title: "Freelance Video Editor",
      org: "Remote",
      points: [
        "Edited 50+ long- and short-form videos for self-improvement and education creators.",
        "Worked with a 700k+ subscriber channel reaching 4+ million views.",
        "Run a personal 4k+ subscriber channel focused on video editing.",
        "Used Premiere Pro and After Effects for pacing, motion graphics and retention."
      ],
      link: { label: "View Portfolio", href: "https://hafzmp4.netlify.app" }
    }
  ],

  /* ─────────────────────────────────────────────────────────────────────────
     PROJECTS  —  shown as a numbered index. Copy a { } block to add one.
     ───────────────────────────────────────────────────────────────────────── */
  projects: [
    {
      title: "Cold-Chain Logistics Optimizer",
      year: "2026",
      stack: ["React.js", "Flask", "Scikit-learn", "Pandas", "PostgreSQL"],
      blurb: "A full-stack AI decision-support app for cold-chain shipment risk. ML models score a 0–100 composite risk with Nominal/Warning/Critical alerts, plus milk-run and CPM/PERT route scheduling.",
      image: "",
      links: []
    },
    {
      title: "TaxFlow",
      year: "2025",
      stack: ["Laravel Blade", "PHP", "Tailwind CSS", "MySQL"],
      blurb: "A tax management web app with Taxpayer and Admin roles — tax calculation, return submission, document uploads and online payment, built on Laravel MVC.",
      image: "images/taxflow-logo.png",
      links: [
        { label: "GitHub", href: "https://github.com/hafzrfn/Taxflow" }
      ]
    },
    {
      title: "Nutra",
      year: "2025",
      stack: ["Kotlin", "Jetpack Compose", "SQLite"],
      blurb: "An Android calorie and macro tracker — daily targets, intake logging, and a multi-screen flow from splash to daily tracking, with SQLite for persistence.",
      image: "images/nutrapng.png",
      links: [
        { label: "GitHub", href: "https://github.com/hafzrfn/calorietracker" }
      ]
    },
    {
      title: "DineWithUswah",
      year: "2024",
      stack: ["HTML", "CSS", "JavaScript"],
      blurb: "A responsive e-commerce storefront with an interactive order modal that redirects to WhatsApp — deployed on Netlify for real customers.",
      image: "images/logodine.jpg",
      links: [
        { label: "GitHub", href: "https://github.com/hafzrfn/dinewithuswah" },
        { label: "Live", href: "https://dinewithuswah.netlify.app/" }
      ]
    }
  ],

  /* ─────────────────────────────────────────────────────────────────────────
     STACK  —  grouped tools. Icons are greyscale and colour in on hover.
     Note: SQL, Nuxt.js, Flask, Pandas/NumPy/Scikit-learn, Figma, Vercel and
     Netlify are on the résumé but skipped here — no icon file for them in
     images/ yet. Drop one in and add a line to include it.
     ───────────────────────────────────────────────────────────────────────── */
  stack: [
    {
      group: "Languages",
      items: [
        { name: "HTML5", icon: "images/html-5-svgrepo-com.svg" },
        { name: "CSS3", icon: "images/css-3-svgrepo-com.svg" },
        { name: "JavaScript", icon: "images/javascript-svgrepo-com.svg" },
        { name: "Python", icon: "images/python-svgrepo-com.svg" },
        { name: "C++", icon: "images/cpp-svgrepo-com.svg" },
        { name: "PHP", icon: "images/php-svgrepo-com.svg" }
      ]
    },
    {
      group: "Frameworks",
      items: [
        { name: "Next.js", icon: "images/nextjs.svg" },
        { name: "React", icon: "images/react-svgrepo-com.svg" },
        { name: "Vue.js", icon: "images/vuejs.svg" },
        { name: "Laravel", icon: "images/laravel-svgrepo-com.svg" },
        { name: "Tailwind CSS", icon: "images/tailwind-svgrepo-com.svg" },
        { name: "Compose", icon: "images/compose.png" }
      ]
    },
    {
      group: "Databases",
      items: [
        { name: "PostgreSQL", icon: "images/postgresql.svg" },
        { name: "MySQL", icon: "images/mysql-svgrepo-com.svg" },
        { name: "Prisma", icon: "images/prisma.svg" }
      ]
    },
    {
      group: "Tools",
      items: [
        { name: "Docker", icon: "images/docker.svg" },
        { name: "Git", icon: "images/git-svgrepo-com.svg" },
        { name: "GitHub", icon: "images/github-svgrepo-com.svg" },
        { name: "VS Code", icon: "images/vscode-svgrepo-com.svg" },
        { name: "Android Studio", icon: "images/android-studio-icon.webp" }
      ]
    },
    {
      group: "Creative",
      items: [
        { name: "Premiere Pro", icon: "images/adobe-premiere-svgrepo-com.svg" },
        { name: "After Effects", icon: "images/adobe-after-effects-svgrepo-com.svg" }
      ]
    }
  ],

  /* ─────────────────────────────────────────────────────────────────────────
     EDUCATION
     ───────────────────────────────────────────────────────────────────────── */
  education: [
    {
      period: "2023 — 2027",
      degree: "Bachelor of Computer Science",
      school: "Universitas Negeri Jakarta (UNJ)",
      detail: "Cumulative GPA 3.72 / 4.00 · Expected graduation 2027"
    }
  ],

  /* ─────────────────────────────────────────────────────────────────────────
     SOCIAL LINKS
     ───────────────────────────────────────────────────────────────────────── */
  socials: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/muhammad-hafizh-rifan-931611294/", icon: "fa-brands fa-linkedin-in" },
    { label: "GitHub", href: "https://github.com/hafzrfn", icon: "fa-brands fa-github" }
  ],

  /* ─────────────────────────────────────────────────────────────────────────
     FOOTER
     ───────────────────────────────────────────────────────────────────────── */
  footer: {
    note: "Designed and built in Jakarta.",
    credit: "© 2026 Hafizh Rifan"
  }

};
