import React from "react";
import { Code, Target, Briefcase, Award, MonitorPlay, Brain, Database, Shield, Cloud } from "lucide-react";

const baseTips = [
  { title: "Portfolio Building", description: "Deploy 3 distinct projects on GitHub and host them live.", icon: <Briefcase className="h-5 w-5 text-indigo-500" /> },
  { title: "Resume Crafting", description: "Create a 1-page ATS-friendly resume.", icon: <Code className="h-5 w-5 text-indigo-500" /> },
  { title: "Mock Interviews", description: "Practice explaining your logic out loud clearly.", icon: <MonitorPlay className="h-5 w-5 text-indigo-500" /> }
];

const softwareDevData = {
    category: "trending", icon: Code, title: "Software Developer Roadmap",
    description: "Your step-by-step guide to becoming a Full Stack Software Developer.",
    roadmapStages: [
      { level: "Beginner", title: "Web Basics", description: "HTML, CSS, JS Fundamentals.", skills: ["HTML5", "CSS3", "JS", "Git"], duration: "2-3 Months", color: "bg-blue-500/10 text-blue-600 border-blue-200", freeCourses: [{ name: "Web Dev Info", channel: "Code With Harry", link: "https://www.youtube.com/watch?v=6mbwJ2xhgzM", platform: "YouTube" }], projects: ["Portfolio", "Calculator"] },
      { level: "Intermediate", title: "Frameworks & Backend", description: "React, Node.js.", skills: ["React", "Node.js", "Express", "MongoDB"], duration: "3-4 Months", color: "bg-purple-500/10 text-purple-600 border-purple-200", freeCourses: [{ name: "React Course", channel: "FreeCodeCamp", link: "https://www.youtube.com/watch?v=bMknfKXIFA8", platform: "YouTube" }], projects: ["Weather App", "Task App"] },
      { level: "Advanced", title: "Full Stack Mastery", description: "Next.js, System Design.", skills: ["Next.js", "System Design", "Docker"], duration: "2-3 Months", color: "bg-orange-500/10 text-orange-600 border-orange-200", freeCourses: [{ name: "Next.js Course", channel: "Apna College", link: "https://www.youtube.com/watch?v=ZVnjOPwW4ZA", platform: "YouTube" }], projects: ["E-commerce App"] }
    ],
    paidCourses: [
      { name: "The Web Developer Bootcamp", platform: "Udemy", author: "Colt Steele", reason: "Best starting point for full-stack.", priority: "High Core", link: "https://www.udemy.com/course/the-web-developer-bootcamp/" },
      { name: "Full-Stack Web Development with React", platform: "Coursera", author: "HKUST", reason: "Comprehensive academic foundation.", priority: "High", link: "https://www.coursera.org/learn/front-end-react" },
      { name: "CS50's Web Programming", platform: "edX", author: "Harvard University", reason: "Deep dive into web architecture.", priority: "Medium", link: "https://www.edx.org/course/cs50s-web-programming-with-python-and-javascript" },
      { name: "Complete Next.js Developer", platform: "ZeroToMastery", author: "Andrei Neagoie", reason: "Modern frameworks focus.", priority: "Medium", link: "https://zerotomastery.io/courses/learn-next-js/" },
      { name: "System Design Interview Prep", platform: "ByteByteGo", author: "Alex Xu", reason: "Crucial for senior dev roles.", priority: "High Core", link: "https://bytebytego.com/" }
    ],
    jobPrepTips: [...baseTips, { title: "DSA", description: "Practice Leetcode daily.", icon: <Target className="h-5 w-5 text-indigo-500" /> }]
};

const aiEngineerData = {
    category: "trending", icon: Brain, title: "AI Engineer Roadmap",
    description: "Learn to build intelligent systems, LLMs, and neural networks.",
    roadmapStages: [
      { level: "Beginner", title: "Math & Python", description: "Linear Algebra & Python basics.", skills: ["Python", "Calculus"], duration: "2 Months", color: "bg-blue-500/10 text-blue-600 border-blue-200", freeCourses: [{ name: "Python", channel: "Sentdex", link: "https://www.youtube.com/watch?v=eXBD2bB9-RA", platform: "YouTube" }], projects: ["Matrix Calculator"] },
      { level: "Intermediate", title: "Neural Networks", description: "PyTorch & Transformers.", skills: ["PyTorch", "Transformers"], duration: "4 Months", color: "bg-purple-500/10 text-purple-600 border-purple-200", freeCourses: [{ name: "Neural Networks", channel: "Andrej Karpathy", link: "https://www.youtube.com/watch?v=VMj-3S1tku0", platform: "YouTube" }], projects: ["Text Summarizer"] },
      { level: "Advanced", title: "LLMs & Agentic AI", description: "Finetuning mass architectures.", skills: ["RAG", "Agentic AI"], duration: "3 Months", color: "bg-orange-500/10 text-orange-600 border-orange-200", freeCourses: [{ name: "NLP Course", channel: "Hugging Face", link: "https://www.youtube.com/watch?v=00GKzGkeMv4", platform: "YouTube" }], projects: ["Personal RAG Assistant"] }
    ],
    paidCourses: [
      { name: "Deep Learning Specialization", platform: "Coursera", author: "Andrew Ng", reason: "Gold standard for NN.", priority: "High Core", link: "https://www.coursera.org/specializations/deep-learning" },
      { name: "Natural Language Processing", platform: "Coursera", author: "DeepLearning.AI", reason: "Essential for LLMs.", priority: "High", link: "https://www.coursera.org/specializations/natural-language-processing" },
      { name: "PyTorch for Deep Learning", platform: "Udemy", author: "Daniel Bourke", reason: "Hands-on PyTorch mastery.", priority: "Medium", link: "https://www.udemy.com/course/pytorch-for-deep-learning/" },
      { name: "Machine Learning Engineering for Production", platform: "Coursera", author: "Andrew Ng", reason: "Deploying AI models (MLOps).", priority: "High", link: "https://www.coursera.org/specializations/machine-learning-engineering-for-production-mlops" },
      { name: "Generative AI with Large Language Models", platform: "Coursera", author: "AWS", reason: "Modern Agentic AI basics.", priority: "Medium", link: "https://www.coursera.org/learn/generative-ai-with-llms" }
    ],
    jobPrepTips: baseTips
};

const dataScientistData = {
    category: "trending", icon: Database, title: "Data Scientist Roadmap",
    description: "Master data analysis and predictive modeling.",
    roadmapStages: [
      { level: "Beginner", title: "Data Math & Python", description: "Pandas, NumPy, Stat.", skills: ["Python", "Pandas"], duration: "2 Months", color: "bg-blue-500/10 text-blue-600 border-blue-200", freeCourses: [{ name: "Python for Beginners", channel: "Mosh", link: "https://www.youtube.com/watch?v=_uQrJ0TkZlc", platform: "YouTube" }], projects: ["EDA Dashboard"] },
      { level: "Intermediate", title: "Machine Learning", description: "Scikit-Learn, models.", skills: ["Scikit-Learn", "SQL"], duration: "3 Months", color: "bg-purple-500/10 text-purple-600 border-purple-200", freeCourses: [{ name: "ML Basics", channel: "Andrew Ng", link: "https://www.youtube.com/watch?v=jGwO_UgTS7I", platform: "YouTube" }], projects: ["House Price Prediction"] }
    ],
    paidCourses: [
      { name: "Data Science Specialization", platform: "Coursera", author: "Johns Hopkins", reason: "Industry recognized foundation.", priority: "High Core", link: "https://www.coursera.org/specializations/jhu-data-science" },
      { name: "Python for Data Science Bootcamp", platform: "Udemy", author: "Jose Portilla", reason: "Hands-on Pandas/Numpy.", priority: "High", link: "https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/" },
      { name: "Machine Learning A-Z", platform: "Udemy", author: "Kirill Eremenko", reason: "Broad algorithm coverage.", priority: "Medium", link: "https://www.udemy.com/course/machinelearning/" },
      { name: "Statistics with Python", platform: "Coursera", author: "University of Michigan", reason: "Core statistical concepts.", priority: "Medium", link: "https://www.coursera.org/specializations/statistics-with-python" },
      { name: "Advanced SQL for Data Scientists", platform: "Udemy", author: "Maven Analytics", reason: "Crucial querying skills.", priority: "High Core", link: "https://www.udemy.com/course/advanced-sql-mysql-for-analytics-business-intelligence/" }
    ],
    jobPrepTips: baseTips
};

const cloudEngineerData = {
    category: "similar", icon: Cloud, title: "Cloud Engineer Roadmap",
    description: "Master cloud infrastructure and CI/CD.",
    roadmapStages: [
      { level: "Beginner", title: "Cloud Basics", description: "AWS fundamentals, Linux.", skills: ["AWS", "Linux"], duration: "2 Months", color: "bg-blue-500/10 text-blue-600 border-blue-200", freeCourses: [{ name: "AWS", channel: "FreeCodeCamp", link: "https://www.youtube.com/watch?v=SOTamWNgDKc", platform: "YouTube" }], projects: ["S3 Static Site"] },
      { level: "Intermediate", title: "IaC & Tools", description: "Docker, Terraform.", skills: ["Docker", "Terraform"], duration: "4 Months", color: "bg-purple-500/10 text-purple-600 border-purple-200", freeCourses: [{ name: "DevOps", channel: "Nana", link: "https://www.youtube.com/watch?v=j5Zsa_eOXeY", platform: "YouTube" }], projects: ["CI/CD Pipeline"] }
    ],
    paidCourses: [
      { name: "Ultimate AWS Solutions Architect", platform: "Udemy", author: "Stephane Maarek", reason: "Standard for Cloud.", priority: "High Core", link: "https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/" },
      { name: "Docker and Kubernetes", platform: "Udemy", author: "Stephen Grider", reason: "Essential containerization.", priority: "High", link: "https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/" },
      { name: "Terraform for AWS Compute", platform: "Udemy", author: "Zeal Vora", reason: "Infrastructure as Code.", priority: "Medium", link: "https://www.udemy.com/course/terraform-beginner-to-advanced/" },
      { name: "GCP Associate Cloud Engineer", platform: "Coursera", author: "Google Cloud", reason: "Multi-cloud foundation.", priority: "Medium", link: "https://www.coursera.org/professional-certificates/google-cloud-engineering" },
      { name: "Linux Mastery", platform: "Udemy", author: "Ziyad Yehia", reason: "Core OS knowledge.", priority: "High Core", link: "https://www.udemy.com/course/linux-mastery-master-the-linux-command-line-in-11-5-hours/" }
    ],
    jobPrepTips: baseTips
};

const cyberSecurityData = {
    category: "similar", icon: Shield, title: "Cyber Sec Roadmap",
    description: "Learn to protect systems.",
    roadmapStages: [
      { level: "Beginner", title: "Networks", description: "TCP/IP, OSI, Linux.", skills: ["TCP/IP", "Linux"], duration: "2 Months", color: "bg-blue-500/10 text-blue-600 border-blue-200", freeCourses: [{ name: "CCNA", channel: "NetworkChuck", link: "https://www.youtube.com/watch?v=S7bLMIZvI4I", platform: "YouTube" }], projects: ["Home Lab"] },
      { level: "Intermediate", title: "Defense", description: "Ethical Hacking.", skills: ["Kali Linux", "BurpSuite"], duration: "4 Months", color: "bg-purple-500/10 text-purple-600 border-purple-200", freeCourses: [{ name: "Ethical Hack", channel: "Cyber Mentor", link: "https://www.youtube.com/watch?v=fNzpcB7ODxQ", platform: "YouTube" }], projects: ["CTF Challenges"] }
    ],
    paidCourses: [
      { name: "CompTIA Security+ Certification", platform: "Udemy", author: "Jason Dion", reason: "Foundational cert.", priority: "High Core", link: "https://www.udemy.com/course/securityplus/" },
      { name: "Practical Ethical Hacking", platform: "TCM Security", author: "Heath Adams", reason: "Real-world penetration testing.", priority: "High", link: "https://academy.tcm-sec.com/p/practical-ethical-hacking-the-complete-course" },
      { name: "Cybersecurity Specialization", platform: "Coursera", author: "University of Maryland", reason: "Academic and theoretical depths.", priority: "Medium", link: "https://www.coursera.org/specializations/cyber-security" },
      { name: "Cisco CCNA 200-301", platform: "Udemy", author: "Neil Anderson", reason: "Network security basics.", priority: "High Core", link: "https://www.udemy.com/course/ccna-complete/" },
      { name: "Web Security and Bug Bounty", platform: "Udemy", author: "Zaid Sabih", reason: "Focused on web vulnerabilities.", priority: "Medium", link: "https://www.udemy.com/course/learn-website-hacking-penetration-testing-from-scratch/" }
    ],
    jobPrepTips: baseTips
};

export const domainsData = {
  "Software Developer": softwareDevData,
  "Frontend Developer": { ...softwareDevData, title: "Frontend Developer Roadmap", description: "Your step-by-step guide to becoming a Frontend Developer." },
  "Backend Developer": { ...softwareDevData, title: "Backend Developer Roadmap", description: "Your step-by-step guide to becoming a Backend Developer." },
  "Full Stack Developer": { ...softwareDevData, title: "Full Stack Developer Roadmap", description: "Your step-by-step guide to becoming a Full Stack Developer." },
  "UI/UX Designer": { ...softwareDevData, title: "UI/UX Designer Roadmap", description: "Your step-by-step guide to becoming a UI/UX Designer." },
  "AI Engineer": aiEngineerData,
  "Data Scientist": dataScientistData,
  "Data Analyst": { ...dataScientistData, title: "Data Analyst Roadmap", description: "Master data analysis." },
  "Cloud Engineer": cloudEngineerData,
  "SAP Consultant": { ...cloudEngineerData, title: "SAP Consultant Roadmap", description: "Master SAP and Enterprise Systems." },
  "Cyber Security": cyberSecurityData,
  "Cybersecurity Analyst": { ...cyberSecurityData, title: "Cybersecurity Analyst Roadmap", description: "Learn to protect IT infrastructure." }
};
export type DomainKey = keyof typeof domainsData;
