import { UserProfile, JobDescription, Course } from "./types";

// Skill ontology with synonyms
export const skillOntology: Record<string, string[]> = {
  "JavaScript": ["JS", "Javascript", "javascript", "js"],
  "TypeScript": ["TS", "Typescript", "typescript", "ts"],
  "Python": ["python", "py"],
  "React": ["ReactJS", "React.js", "reactjs", "react"],
  "SQL": ["sql", "Sql", "MySQL", "PostgreSQL", "mysql", "postgresql"],
  "HTML": ["html", "HTML5", "html5"],
  "CSS": ["css", "CSS3", "css3", "Tailwind", "tailwindcss"],
  "Node.js": ["NodeJS", "node", "nodejs", "Node"],
  "Git": ["git", "GitHub", "github", "version control"],
  "Excel": ["excel", "Microsoft Excel", "Spreadsheets", "spreadsheets"],
  "Tableau": ["tableau"],
  "Power BI": ["PowerBI", "powerbi", "power bi"],
  "R": ["r", "R programming"],
  "Statistics": ["statistics", "statistical analysis", "stats"],
  "Machine Learning": ["ML", "ml", "machine learning"],
  "Data Visualization": ["data visualization", "data viz", "dataviz"],
  "Selenium": ["selenium"],
  "JIRA": ["jira", "Jira"],
  "Agile": ["agile", "Scrum", "scrum"],
  "Testing": ["QA", "qa", "quality assurance", "test automation", "manual testing"],
  "Java": ["java"],
  "C++": ["cpp", "c++", "C plus plus"],
  "Docker": ["docker", "containerization"],
  "AWS": ["aws", "Amazon Web Services"],
  "REST API": ["REST", "rest", "RESTful", "API", "APIs"],
  "MongoDB": ["mongodb", "mongo"],
  "Pandas": ["pandas"],
  "NumPy": ["numpy"],
  "Communication": ["communication", "verbal communication", "written communication"],
  "Problem Solving": ["problem solving", "analytical thinking", "critical thinking"],
};

export const normalizeSkill = (raw: string): string => {
  for (const [canonical, synonyms] of Object.entries(skillOntology)) {
    if (canonical.toLowerCase() === raw.toLowerCase() || synonyms.some(s => s.toLowerCase() === raw.toLowerCase())) {
      return canonical;
    }
  }
  return raw;
};

// Role skill requirements
export const roleRequirements: Record<string, { required: string[]; preferred: string[] }> = {
  "Data Analyst": {
    required: ["SQL", "Excel", "Python", "Statistics", "Data Visualization"],
    preferred: ["Tableau", "Power BI", "R", "Pandas", "NumPy", "Machine Learning", "Communication"],
  },
  "Frontend Developer": {
    required: ["JavaScript", "HTML", "CSS", "React", "Git"],
    preferred: ["TypeScript", "Node.js", "REST API", "Testing", "Docker", "Agile", "Problem Solving"],
  },
  "QA Engineer": {
    required: ["Testing", "SQL", "JIRA", "Selenium", "Agile"],
    preferred: ["JavaScript", "Python", "REST API", "Git", "Docker", "Communication", "Problem Solving"],
  },
};

// Demo user with pre-populated data
export const demoUser: UserProfile = {
  name: "Priya Sharma",
  email: "demo@skillbridge.com",
  resume: {
    name: "Priya Sharma",
    email: "demo@skillbridge.com",
    skills: [
      { skill: "Python", proficiency: 75 },
      { skill: "SQL", proficiency: 70 },
      { skill: "JavaScript", proficiency: 60 },
      { skill: "HTML", proficiency: 80 },
      { skill: "CSS", proficiency: 75 },
      { skill: "React", proficiency: 55 },
      { skill: "Git", proficiency: 65 },
      { skill: "Excel", proficiency: 70 },
      { skill: "Communication", proficiency: 80 },
      { skill: "Problem Solving", proficiency: 75 },
    ],
    experience: [
      { role: "Web Development Intern", company: "TechStart Labs", years: 0.5 },
      { role: "Data Analysis Volunteer", company: "NGO DataForGood", years: 0.3 },
    ],
    education: [
      { degree: "B.Tech Computer Science", institution: "Delhi Technological University", year: 2024 },
    ],
  },
  readinessScore: {
    score: 62,
    band: "Intermediate",
    breakdown: { skillCoverage: 65, experienceLevel: 45, educationMatch: 75 },
  },
  roleMatches: [
    {
      role: "Frontend Developer",
      matchPercentage: 72,
      requiredSkills: ["JavaScript", "HTML", "CSS", "React", "Git"],
      matchedSkills: ["JavaScript", "HTML", "CSS", "React", "Git"],
      missingSkills: ["TypeScript", "Testing", "REST API"],
    },
    {
      role: "Data Analyst",
      matchPercentage: 58,
      requiredSkills: ["SQL", "Excel", "Python", "Statistics", "Data Visualization"],
      matchedSkills: ["SQL", "Excel", "Python"],
      missingSkills: ["Statistics", "Data Visualization", "Tableau", "Power BI"],
    },
    {
      role: "QA Engineer",
      matchPercentage: 40,
      requiredSkills: ["Testing", "SQL", "JIRA", "Selenium", "Agile"],
      matchedSkills: ["SQL"],
      missingSkills: ["Testing", "JIRA", "Selenium", "Agile"],
    },
  ],
  missingSkills: [
    { skill: "TypeScript", importance: "high", forRoles: ["Frontend Developer"] },
    { skill: "Testing", importance: "high", forRoles: ["Frontend Developer", "QA Engineer"] },
    { skill: "Statistics", importance: "high", forRoles: ["Data Analyst"] },
    { skill: "Data Visualization", importance: "medium", forRoles: ["Data Analyst"] },
    { skill: "REST API", importance: "medium", forRoles: ["Frontend Developer", "QA Engineer"] },
  ],
  completedCourses: ["course-1", "course-5"],
  completedMilestones: ["milestone-1"],
};

// 50 Job descriptions across 3 roles
export const jobDescriptions: JobDescription[] = [
  // Data Analyst (17)
  { id: "job-1", title: "Junior Data Analyst", company: "Flipkart", role: "Data Analyst", description: "Analyze sales data and create dashboards to drive business insights. Work with SQL and Python to process large datasets.", requiredSkills: ["SQL", "Python", "Excel", "Data Visualization"], experienceLevel: "0-2 years", location: "Bangalore" },
  { id: "job-2", title: "Data Analyst", company: "Zomato", role: "Data Analyst", description: "Build analytics pipelines and create reports for food delivery metrics. Strong SQL and statistical analysis required.", requiredSkills: ["SQL", "Statistics", "Python", "Tableau"], experienceLevel: "1-3 years", location: "Gurugram" },
  { id: "job-3", title: "Business Data Analyst", company: "Paytm", role: "Data Analyst", description: "Drive data-informed decisions for payment products. Create and maintain dashboards using Power BI.", requiredSkills: ["SQL", "Power BI", "Excel", "Statistics"], experienceLevel: "0-2 years", location: "Noida" },
  { id: "job-4", title: "Data Analyst Intern", company: "BYJU'S", role: "Data Analyst", description: "Support the analytics team in analyzing student learning patterns and engagement metrics.", requiredSkills: ["SQL", "Excel", "Python", "Data Visualization"], experienceLevel: "Fresher", location: "Bangalore" },
  { id: "job-5", title: "Analytics Associate", company: "Razorpay", role: "Data Analyst", description: "Analyze payment transaction data and identify trends. Build automated reporting solutions.", requiredSkills: ["SQL", "Python", "Statistics", "Tableau"], experienceLevel: "1-2 years", location: "Bangalore" },
  { id: "job-6", title: "Data Analyst", company: "Swiggy", role: "Data Analyst", description: "Create data models and dashboards for delivery optimization. Experience with Python and SQL essential.", requiredSkills: ["Python", "SQL", "Data Visualization", "Statistics"], experienceLevel: "0-2 years", location: "Bangalore" },
  { id: "job-7", title: "Junior Analyst", company: "Deloitte", role: "Data Analyst", description: "Support consulting teams with data analysis and visualization for enterprise clients.", requiredSkills: ["Excel", "SQL", "Power BI", "Communication"], experienceLevel: "Fresher", location: "Hyderabad" },
  { id: "job-8", title: "Data Insights Analyst", company: "PhonePe", role: "Data Analyst", description: "Generate insights from UPI transaction data. Build predictive models and KPI dashboards.", requiredSkills: ["SQL", "Python", "Machine Learning", "Tableau"], experienceLevel: "1-3 years", location: "Bangalore" },
  { id: "job-9", title: "Research Analyst", company: "CRISIL", role: "Data Analyst", description: "Conduct quantitative research and statistical analysis for financial markets.", requiredSkills: ["Statistics", "R", "Excel", "Data Visualization"], experienceLevel: "0-2 years", location: "Mumbai" },
  { id: "job-10", title: "Data Analyst", company: "Ola", role: "Data Analyst", description: "Analyze ride data to optimize pricing and supply-demand matching algorithms.", requiredSkills: ["Python", "SQL", "Statistics", "Pandas"], experienceLevel: "1-2 years", location: "Bangalore" },
  { id: "job-11", title: "Marketing Data Analyst", company: "Nykaa", role: "Data Analyst", description: "Analyze customer behavior and campaign performance. Create attribution models.", requiredSkills: ["SQL", "Excel", "Data Visualization", "Statistics"], experienceLevel: "0-2 years", location: "Mumbai" },
  { id: "job-12", title: "Operations Analyst", company: "Amazon", role: "Data Analyst", description: "Optimize warehouse operations through data analysis. Build automated reporting.", requiredSkills: ["SQL", "Excel", "Python", "Data Visualization"], experienceLevel: "0-2 years", location: "Hyderabad" },
  { id: "job-13", title: "Data Analyst", company: "Infosys", role: "Data Analyst", description: "Deliver analytics solutions for global enterprise clients across multiple domains.", requiredSkills: ["SQL", "Python", "Tableau", "Statistics"], experienceLevel: "Fresher", location: "Pune" },
  { id: "job-14", title: "Product Data Analyst", company: "Meesho", role: "Data Analyst", description: "Drive product decisions with data. A/B testing and user behavior analysis.", requiredSkills: ["SQL", "Python", "Statistics", "Data Visualization"], experienceLevel: "1-2 years", location: "Bangalore" },
  { id: "job-15", title: "Data Analyst", company: "Wipro", role: "Data Analyst", description: "Support enterprise analytics projects with data modeling and visualization.", requiredSkills: ["SQL", "Power BI", "Excel", "Python"], experienceLevel: "Fresher", location: "Chennai" },
  { id: "job-16", title: "Supply Chain Analyst", company: "BigBasket", role: "Data Analyst", description: "Analyze supply chain data to improve inventory management and demand forecasting.", requiredSkills: ["SQL", "Excel", "Python", "Statistics"], experienceLevel: "0-2 years", location: "Bangalore" },
  { id: "job-17", title: "Healthcare Data Analyst", company: "Practo", role: "Data Analyst", description: "Analyze healthcare data for patient engagement and platform optimization.", requiredSkills: ["SQL", "Python", "Data Visualization", "Statistics"], experienceLevel: "0-2 years", location: "Bangalore" },

  // Frontend Developer (17)
  { id: "job-18", title: "Junior Frontend Developer", company: "Freshworks", role: "Frontend Developer", description: "Build responsive UI components for SaaS products using React and TypeScript.", requiredSkills: ["React", "JavaScript", "TypeScript", "CSS", "HTML"], experienceLevel: "0-2 years", location: "Chennai" },
  { id: "job-19", title: "Frontend Engineer", company: "Razorpay", role: "Frontend Developer", description: "Develop payment dashboard interfaces. Strong React and state management skills needed.", requiredSkills: ["React", "JavaScript", "TypeScript", "Git", "REST API"], experienceLevel: "1-3 years", location: "Bangalore" },
  { id: "job-20", title: "React Developer", company: "Zerodha", role: "Frontend Developer", description: "Build trading platform UI with real-time data visualization using React.", requiredSkills: ["React", "JavaScript", "HTML", "CSS", "Git"], experienceLevel: "1-2 years", location: "Bangalore" },
  { id: "job-21", title: "UI Developer", company: "Flipkart", role: "Frontend Developer", description: "Create engaging e-commerce interfaces. Mobile-first responsive design required.", requiredSkills: ["React", "JavaScript", "CSS", "HTML", "Testing"], experienceLevel: "0-2 years", location: "Bangalore" },
  { id: "job-22", title: "Frontend Developer Intern", company: "Cred", role: "Frontend Developer", description: "Support the frontend team in building fintech product features with React.", requiredSkills: ["JavaScript", "React", "HTML", "CSS", "Git"], experienceLevel: "Fresher", location: "Bangalore" },
  { id: "job-23", title: "Frontend Engineer", company: "Swiggy", role: "Frontend Developer", description: "Build food ordering and delivery tracking interfaces with optimal performance.", requiredSkills: ["React", "TypeScript", "JavaScript", "REST API", "CSS"], experienceLevel: "1-3 years", location: "Bangalore" },
  { id: "job-24", title: "Web Developer", company: "TCS", role: "Frontend Developer", description: "Develop enterprise web applications for global clients using modern frameworks.", requiredSkills: ["JavaScript", "React", "HTML", "CSS", "Git"], experienceLevel: "Fresher", location: "Mumbai" },
  { id: "job-25", title: "Frontend Developer", company: "Paytm", role: "Frontend Developer", description: "Build payment and wallet interfaces with focus on UX and performance.", requiredSkills: ["React", "JavaScript", "TypeScript", "HTML", "CSS"], experienceLevel: "0-2 years", location: "Noida" },
  { id: "job-26", title: "React Developer", company: "Myntra", role: "Frontend Developer", description: "Create fashion e-commerce experiences with React and advanced CSS animations.", requiredSkills: ["React", "JavaScript", "CSS", "HTML", "Git"], experienceLevel: "1-2 years", location: "Bangalore" },
  { id: "job-27", title: "Frontend Engineer", company: "PhonePe", role: "Frontend Developer", description: "Build UPI payment flows and financial dashboards with React and TypeScript.", requiredSkills: ["React", "TypeScript", "JavaScript", "REST API", "Testing"], experienceLevel: "1-3 years", location: "Bangalore" },
  { id: "job-28", title: "UI/UX Developer", company: "Ola", role: "Frontend Developer", description: "Design and develop ride-hailing interfaces with focus on user experience.", requiredSkills: ["React", "JavaScript", "CSS", "HTML", "Git"], experienceLevel: "0-2 years", location: "Bangalore" },
  { id: "job-29", title: "Frontend Developer", company: "Infosys", role: "Frontend Developer", description: "Build scalable web applications for enterprise clients using React ecosystem.", requiredSkills: ["React", "JavaScript", "HTML", "CSS", "Node.js"], experienceLevel: "Fresher", location: "Pune" },
  { id: "job-30", title: "Web Application Developer", company: "Wipro", role: "Frontend Developer", description: "Develop and maintain client-facing web applications with modern tech stack.", requiredSkills: ["JavaScript", "React", "HTML", "CSS", "Git"], experienceLevel: "Fresher", location: "Hyderabad" },
  { id: "job-31", title: "Frontend Developer", company: "Dream11", role: "Frontend Developer", description: "Build fantasy sports platform UI with real-time updates and animations.", requiredSkills: ["React", "TypeScript", "JavaScript", "CSS", "REST API"], experienceLevel: "1-2 years", location: "Mumbai" },
  { id: "job-32", title: "Software Engineer (Frontend)", company: "Atlassian", role: "Frontend Developer", description: "Build collaboration tools UI with focus on accessibility and performance.", requiredSkills: ["React", "TypeScript", "JavaScript", "Testing", "Git"], experienceLevel: "0-2 years", location: "Bangalore" },
  { id: "job-33", title: "Frontend Developer", company: "Meesho", role: "Frontend Developer", description: "Create social commerce experiences for resellers and end users.", requiredSkills: ["React", "JavaScript", "CSS", "HTML", "REST API"], experienceLevel: "0-2 years", location: "Bangalore" },
  { id: "job-34", title: "Junior Web Developer", company: "HCL", role: "Frontend Developer", description: "Develop responsive web applications for enterprise clients.", requiredSkills: ["JavaScript", "HTML", "CSS", "React", "Git"], experienceLevel: "Fresher", location: "Noida" },

  // QA Engineer (16)
  { id: "job-35", title: "QA Engineer", company: "Flipkart", role: "QA Engineer", description: "Design and execute test plans for e-commerce platform. Automate regression tests.", requiredSkills: ["Testing", "Selenium", "SQL", "JIRA", "Agile"], experienceLevel: "0-2 years", location: "Bangalore" },
  { id: "job-36", title: "Software Tester", company: "Infosys", role: "QA Engineer", description: "Manual and automated testing for enterprise software projects.", requiredSkills: ["Testing", "Selenium", "JIRA", "SQL", "Agile"], experienceLevel: "Fresher", location: "Mysore" },
  { id: "job-37", title: "QA Automation Engineer", company: "Razorpay", role: "QA Engineer", description: "Build test automation framework for payment APIs and dashboard.", requiredSkills: ["Testing", "JavaScript", "Selenium", "REST API", "Git"], experienceLevel: "1-3 years", location: "Bangalore" },
  { id: "job-38", title: "Test Engineer", company: "TCS", role: "QA Engineer", description: "Execute test cases and report defects for client projects. Knowledge of SDLC required.", requiredSkills: ["Testing", "JIRA", "SQL", "Agile", "Communication"], experienceLevel: "Fresher", location: "Chennai" },
  { id: "job-39", title: "QA Engineer Intern", company: "Swiggy", role: "QA Engineer", description: "Support QA team in testing food delivery app features. Learn automation frameworks.", requiredSkills: ["Testing", "SQL", "JIRA", "Agile"], experienceLevel: "Fresher", location: "Bangalore" },
  { id: "job-40", title: "SDET", company: "Amazon", role: "QA Engineer", description: "Design and implement automated test suites for AWS services.", requiredSkills: ["Testing", "Python", "Selenium", "REST API", "Docker"], experienceLevel: "1-3 years", location: "Hyderabad" },
  { id: "job-41", title: "QA Analyst", company: "Wipro", role: "QA Engineer", description: "Analyze requirements and create comprehensive test strategies for enterprise clients.", requiredSkills: ["Testing", "JIRA", "SQL", "Agile", "Communication"], experienceLevel: "Fresher", location: "Pune" },
  { id: "job-42", title: "Automation Tester", company: "Paytm", role: "QA Engineer", description: "Automate test cases for payment workflows using Selenium and Python.", requiredSkills: ["Testing", "Selenium", "Python", "SQL", "JIRA"], experienceLevel: "0-2 years", location: "Noida" },
  { id: "job-43", title: "QA Engineer", company: "Ola", role: "QA Engineer", description: "Test ride-hailing features and ensure quality across mobile and web platforms.", requiredSkills: ["Testing", "JIRA", "SQL", "Selenium", "Agile"], experienceLevel: "0-2 years", location: "Bangalore" },
  { id: "job-44", title: "Test Automation Engineer", company: "Freshworks", role: "QA Engineer", description: "Build and maintain automation frameworks for SaaS product testing.", requiredSkills: ["Testing", "JavaScript", "Selenium", "Git", "REST API"], experienceLevel: "1-2 years", location: "Chennai" },
  { id: "job-45", title: "QA Engineer", company: "PhonePe", role: "QA Engineer", description: "Test UPI payment flows and financial transactions. Security testing experience preferred.", requiredSkills: ["Testing", "SQL", "JIRA", "Selenium", "Agile"], experienceLevel: "1-2 years", location: "Bangalore" },
  { id: "job-46", title: "Quality Analyst", company: "HCL", role: "QA Engineer", description: "Perform functional and regression testing for enterprise applications.", requiredSkills: ["Testing", "JIRA", "SQL", "Agile", "Selenium"], experienceLevel: "Fresher", location: "Noida" },
  { id: "job-47", title: "QA Engineer", company: "Myntra", role: "QA Engineer", description: "Test e-commerce platform features including search, cart, and checkout flows.", requiredSkills: ["Testing", "Selenium", "SQL", "JIRA", "JavaScript"], experienceLevel: "0-2 years", location: "Bangalore" },
  { id: "job-48", title: "Test Engineer", company: "Deloitte", role: "QA Engineer", description: "Support quality assurance for consulting project deliverables.", requiredSkills: ["Testing", "JIRA", "SQL", "Communication", "Agile"], experienceLevel: "Fresher", location: "Hyderabad" },
  { id: "job-49", title: "QA Engineer", company: "Dream11", role: "QA Engineer", description: "Test fantasy sports platform with focus on real-time scoring accuracy.", requiredSkills: ["Testing", "Selenium", "REST API", "SQL", "Git"], experienceLevel: "1-2 years", location: "Mumbai" },
  { id: "job-50", title: "Software Tester", company: "Cognizant", role: "QA Engineer", description: "Execute test plans and automate regression suites for global clients.", requiredSkills: ["Testing", "Selenium", "JIRA", "SQL", "Agile"], experienceLevel: "Fresher", location: "Chennai" },
];

// Course recommendations
export const courseRecommendations: Course[] = [
  { id: "course-1", title: "TypeScript for React Developers", provider: "Udemy", link: "https://udemy.com", duration: "12 hours", skill: "TypeScript", description: "Master TypeScript with React. Learn types, generics, and advanced patterns." },
  { id: "course-2", title: "JavaScript Testing with Jest", provider: "Coursera", link: "https://coursera.org", duration: "8 hours", skill: "Testing", description: "Learn unit testing, integration testing, and TDD with Jest and React Testing Library." },
  { id: "course-3", title: "REST API Design & Development", provider: "YouTube", link: "https://youtube.com", duration: "6 hours", skill: "REST API", description: "Build RESTful APIs from scratch. Learn best practices for API design." },
  { id: "course-4", title: "Statistics for Data Science", provider: "Khan Academy", link: "https://khanacademy.org", duration: "20 hours", skill: "Statistics", description: "Foundation in probability, distributions, hypothesis testing, and regression." },
  { id: "course-5", title: "Data Visualization with Tableau", provider: "Coursera", link: "https://coursera.org", duration: "15 hours", skill: "Data Visualization", description: "Create interactive dashboards and tell stories with data using Tableau." },
  { id: "course-6", title: "Tableau Desktop Specialist", provider: "Udemy", link: "https://udemy.com", duration: "10 hours", skill: "Tableau", description: "Prepare for the Tableau certification exam with hands-on projects." },
  { id: "course-7", title: "Power BI Complete Course", provider: "YouTube", link: "https://youtube.com", duration: "8 hours", skill: "Power BI", description: "Learn Power BI from basics to advanced DAX and data modeling." },
  { id: "course-8", title: "Selenium WebDriver with Python", provider: "Udemy", link: "https://udemy.com", duration: "14 hours", skill: "Selenium", description: "Master browser automation with Selenium. Build robust test frameworks." },
  { id: "course-9", title: "JIRA for Beginners", provider: "Coursera", link: "https://coursera.org", duration: "5 hours", skill: "JIRA", description: "Learn project management with JIRA. Agile boards, sprints, and workflows." },
  { id: "course-10", title: "Agile & Scrum Masterclass", provider: "Udemy", link: "https://udemy.com", duration: "10 hours", skill: "Agile", description: "Understand Agile methodology, Scrum framework, and sprint planning." },
  { id: "course-11", title: "Docker for Developers", provider: "YouTube", link: "https://youtube.com", duration: "4 hours", skill: "Docker", description: "Containerize your applications with Docker. Learn compose and orchestration." },
  { id: "course-12", title: "Machine Learning A-Z", provider: "Coursera", link: "https://coursera.org", duration: "40 hours", skill: "Machine Learning", description: "Complete ML course covering supervised, unsupervised learning, and deep learning." },
  { id: "course-13", title: "Advanced React Patterns", provider: "YouTube", link: "https://youtube.com", duration: "6 hours", skill: "React", description: "Learn compound components, render props, hooks patterns, and performance optimization." },
  { id: "course-14", title: "SQL for Data Analytics", provider: "Udemy", link: "https://udemy.com", duration: "12 hours", skill: "SQL", description: "Master SQL queries, joins, window functions, and CTEs for data analysis." },
  { id: "course-15", title: "Python for Data Science", provider: "Coursera", link: "https://coursera.org", duration: "25 hours", skill: "Python", description: "Learn Python with Pandas, NumPy, and Matplotlib for data science workflows." },
  { id: "course-16", title: "R Programming Fundamentals", provider: "Khan Academy", link: "https://khanacademy.org", duration: "15 hours", skill: "R", description: "Learn R programming for statistical analysis and data visualization." },
  { id: "course-17", title: "Node.js Complete Guide", provider: "Udemy", link: "https://udemy.com", duration: "18 hours", skill: "Node.js", description: "Build backend services with Node.js, Express, and MongoDB." },
  { id: "course-18", title: "Pandas Data Analysis", provider: "YouTube", link: "https://youtube.com", duration: "8 hours", skill: "Pandas", description: "Master data manipulation with Pandas. DataFrames, merging, and time series." },
];

// Demo activity timeline
export const demoActivity = [
  { id: "act-1", type: "upload" as const, title: "Uploaded resume", timestamp: "2024-01-15T10:30:00Z" },
  { id: "act-2", type: "analysis" as const, title: "Skills analyzed — 10 skills detected", timestamp: "2024-01-15T10:31:00Z" },
  { id: "act-3", type: "course" as const, title: "Completed: TypeScript for React Developers", timestamp: "2024-01-20T14:00:00Z" },
  { id: "act-4", type: "milestone" as const, title: "Milestone reached: Foundation Complete", timestamp: "2024-01-28T09:00:00Z" },
  { id: "act-5", type: "course" as const, title: "Completed: Data Visualization with Tableau", timestamp: "2024-02-05T16:00:00Z" },
];
