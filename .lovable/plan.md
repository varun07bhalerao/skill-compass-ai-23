

# SkillBridge — AI Career Guidance & Skill Gap Analyzer

## Overview
A polished, full MVP web app for students and fresh graduates to upload resumes, get AI-powered skill analysis, job readiness scores, personalized learning roadmaps, and career guidance. Uses real AI for parsing and recommendations, with mock seed data for the demo experience. Bilingual: English + Hindi.

---

## Pages & Features

### 1. Landing Page
- Hero section with tagline: "Bridge the gap between your skills and your dream career"
- Key feature highlights (Resume Analysis, Skill Matching, Learning Roadmap)
- CTA buttons: "Get Started" / "Try Demo"
- Bilingual language toggle (EN/HI) in header

### 2. Authentication (Mock)
- Login/Signup forms with demo credentials pre-filled
- Google login button (visual only)
- Demo user: demo@skillbridge.com / password123
- Auth state stored in localStorage

### 3. Dashboard (Main Hub)
- **Readiness Gauge** — circular chart showing composite score (Beginner/Intermediate/Job-Ready)
- **Progress Bars** — skill proficiency levels for top skills
- **Top Trending Skills** — bar/line chart showing in-demand skills for selected role
- **Quick Stats** — cards showing matched roles count, skills analyzed, courses recommended
- **Recent Activity** — timeline of recent actions (uploads, completed courses)

### 4. Resume Upload & Analysis
- Drag-and-drop file upload (PDF/DOCX accepted)
- **Real AI parsing** via Lovable AI edge function — extracts name, email, skills with proficiency, experience, education
- Parsed results displayed in structured cards
- Parsed data saved to localStorage for use across the app

### 5. Skill Analysis & Matching
- **Skill Normalization** — AI maps synonyms to canonical tokens (e.g., "JS" → "JavaScript")
- **Role Matching** — shows match % against 3 target roles (Data Analyst, Frontend Developer, QA Engineer)
- **Top 5 Missing Skills** — prioritized list with importance rating
- **Readiness Score** — composite score with band label and breakdown

### 6. Learning Roadmap
- **AI-generated 8–12 week plan** with 3 milestones
- Timeline visualization (week-by-week view)
- 2 project suggestions per roadmap
- 3 curated course/resource recommendations per missing skill (title, provider, link)
- Progress checkboxes for each milestone (saved to localStorage)

### 7. Course & Resource Recommendations
- Grid of recommended courses organized by missing skill
- Each card: title, provider (Coursera, Udemy, YouTube, etc.), link, estimated duration
- Filtering by skill category

### 8. Job Matching
- Top 3 matched job roles with match percentage
- Job description previews from seed data (50 job descriptions across 3 roles)
- Required vs. possessed skills comparison view

### 9. Video-to-Notes
- Input field to paste a tutorial URL
- AI generates 3–5 bullet point summary
- Display formatted notes with copy functionality

### 10. Progress Tracking
- Track completed courses, milestones, and skill improvements
- Visual progress over time (line chart)
- Achievement badges for milestones reached

---

## Multilingual Support (EN + Hindi)
- Language toggle in the top navigation bar
- All UI strings, labels, and headings available in both languages
- Uses React context for language state management

## Seed Data
- 20 sample resume profiles (stored as JSON)
- 50 job descriptions across Data Analyst, Frontend Developer, QA roles
- Pre-computed skill ontology with synonym mappings
- Demo user with pre-populated analysis results

## AI Integration (Lovable Cloud)
- **Edge function: `parse-resume`** — sends resume text to Lovable AI, returns structured JSON
- **Edge function: `generate-roadmap`** — generates personalized learning plan
- **Edge function: `skill-match`** — analyzes skills against job roles
- **Edge function: `video-notes`** — summarizes tutorial content

## Design
- Clean, modern UI with shadcn/ui components and Tailwind CSS
- Recharts for all data visualizations (gauges, progress bars, line/bar charts)
- Responsive design for desktop and mobile
- Color scheme: professional blues and greens conveying trust and growth

