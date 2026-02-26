import React, { createContext, useContext, useState, ReactNode } from "react";

export type Language = "en" | "hi";

type Translations = Record<string, Record<Language, string>>;

const translations: Translations = {
  // Nav
  "nav.home": { en: "Home", hi: "होम" },
  "nav.dashboard": { en: "Dashboard", hi: "डैशबोर्ड" },
  "nav.resume": { en: "Resume Analysis", hi: "रिज्यूमे विश्लेषण" },
  "nav.skills": { en: "Skill Analysis", hi: "कौशल विश्लेषण" },
  "nav.roadmap": { en: "Learning Roadmap", hi: "लर्निंग रोडमैप" },
  "nav.courses": { en: "Courses", hi: "कोर्सेज" },
  "nav.jobs": { en: "Job Matching", hi: "जॉब मैचिंग" },
  "nav.video": { en: "Video Notes", hi: "वीडियो नोट्स" },
  "nav.progress": { en: "Progress", hi: "प्रगति" },
  "nav.login": { en: "Login", hi: "लॉगिन" },
  "nav.logout": { en: "Logout", hi: "लॉगआउट" },

  // Landing
  "landing.tagline": { en: "Bridge the gap between your skills and your dream career", hi: "अपने कौशल और अपने सपनों की नौकरी के बीच की खाई को पाटें" },
  "landing.subtitle": { en: "AI-powered career guidance for students and fresh graduates. Upload your resume, discover your strengths, and get a personalized roadmap to success.", hi: "छात्रों और नए स्नातकों के लिए AI-संचालित करियर मार्गदर्शन। अपना रिज्यूमे अपलोड करें, अपनी ताकत खोजें, और सफलता का व्यक्तिगत रोडमैप पाएं।" },
  "landing.getStarted": { en: "Get Started", hi: "शुरू करें" },
  "landing.tryDemo": { en: "Try Demo", hi: "डेमो आज़माएं" },
  "landing.feature1.title": { en: "Resume Analysis", hi: "रिज्यूमे विश्लेषण" },
  "landing.feature1.desc": { en: "AI extracts and analyzes your skills, experience, and education from your resume.", hi: "AI आपके रिज्यूमे से आपके कौशल, अनुभव और शिक्षा का विश्लेषण करता है।" },
  "landing.feature2.title": { en: "Skill Matching", hi: "कौशल मिलान" },
  "landing.feature2.desc": { en: "See how your skills match against top job roles and identify gaps.", hi: "देखें कि आपके कौशल शीर्ष नौकरी भूमिकाओं से कैसे मेल खाते हैं।" },
  "landing.feature3.title": { en: "Learning Roadmap", hi: "लर्निंग रोडमैप" },
  "landing.feature3.desc": { en: "Get a personalized 8-12 week plan with courses, projects, and milestones.", hi: "कोर्स, प्रोजेक्ट और मील के पत्थर के साथ एक व्यक्तिगत 8-12 सप्ताह की योजना प्राप्त करें।" },

  // Auth
  "auth.login": { en: "Login", hi: "लॉगिन" },
  "auth.signup": { en: "Sign Up", hi: "साइन अप" },
  "auth.email": { en: "Email", hi: "ईमेल" },
  "auth.password": { en: "Password", hi: "पासवर्ड" },
  "auth.name": { en: "Full Name", hi: "पूरा नाम" },
  "auth.demoCredentials": { en: "Demo Credentials", hi: "डेमो क्रेडेंशियल्स" },
  "auth.googleLogin": { en: "Continue with Google", hi: "Google से जारी रखें" },
  "auth.noAccount": { en: "Don't have an account?", hi: "खाता नहीं है?" },
  "auth.hasAccount": { en: "Already have an account?", hi: "पहले से खाता है?" },

  // Dashboard
  "dashboard.title": { en: "Dashboard", hi: "डैशबोर्ड" },
  "dashboard.readiness": { en: "Job Readiness", hi: "नौकरी की तैयारी" },
  "dashboard.skills": { en: "Your Skills", hi: "आपके कौशल" },
  "dashboard.trending": { en: "Trending Skills", hi: "ट्रेंडिंग कौशल" },
  "dashboard.quickStats": { en: "Quick Stats", hi: "त्वरित आंकड़े" },
  "dashboard.recentActivity": { en: "Recent Activity", hi: "हाल की गतिविधि" },
  "dashboard.matchedRoles": { en: "Matched Roles", hi: "मिलान भूमिकाएं" },
  "dashboard.skillsAnalyzed": { en: "Skills Analyzed", hi: "विश्लेषित कौशल" },
  "dashboard.coursesRecommended": { en: "Courses Recommended", hi: "अनुशंसित कोर्स" },

  // Resume
  "resume.title": { en: "Resume Upload & Analysis", hi: "रिज्यूमे अपलोड और विश्लेषण" },
  "resume.upload": { en: "Upload Resume", hi: "रिज्यूमे अपलोड करें" },
  "resume.dragDrop": { en: "Drag and drop your resume here, or click to browse", hi: "अपना रिज्यूमे यहां खींचें और छोड़ें, या ब्राउज़ करने के लिए क्लिक करें" },
  "resume.formats": { en: "Supports PDF and DOCX formats", hi: "PDF और DOCX प्रारूप समर्थित" },
  "resume.analyzing": { en: "Analyzing your resume...", hi: "आपके रिज्यूमे का विश्लेषण हो रहा है..." },
  "resume.results": { en: "Analysis Results", hi: "विश्लेषण परिणाम" },
  "resume.parsedSkills": { en: "Parsed Skills", hi: "पार्स किए गए कौशल" },
  "resume.experience": { en: "Experience", hi: "अनुभव" },
  "resume.education": { en: "Education", hi: "शिक्षा" },

  // Skills
  "skills.title": { en: "Skill Analysis & Matching", hi: "कौशल विश्लेषण और मिलान" },
  "skills.roleMatching": { en: "Role Matching", hi: "भूमिका मिलान" },
  "skills.missingSkills": { en: "Missing Skills", hi: "लापता कौशल" },
  "skills.readinessScore": { en: "Readiness Score", hi: "तैयारी स्कोर" },
  "skills.beginner": { en: "Beginner", hi: "शुरुआती" },
  "skills.intermediate": { en: "Intermediate", hi: "मध्यवर्ती" },
  "skills.jobReady": { en: "Job Ready", hi: "नौकरी के लिए तैयार" },

  // Roadmap
  "roadmap.title": { en: "Learning Roadmap", hi: "लर्निंग रोडमैप" },
  "roadmap.generate": { en: "Generate Roadmap", hi: "रोडमैप बनाएं" },
  "roadmap.week": { en: "Week", hi: "सप्ताह" },
  "roadmap.milestone": { en: "Milestone", hi: "मील का पत्थर" },
  "roadmap.projects": { en: "Suggested Projects", hi: "सुझाए गए प्रोजेक्ट" },

  // Courses
  "courses.title": { en: "Course Recommendations", hi: "कोर्स अनुशंसाएं" },
  "courses.filterBySkill": { en: "Filter by Skill", hi: "कौशल द्वारा फ़िल्टर करें" },
  "courses.viewCourse": { en: "View Course", hi: "कोर्स देखें" },
  "courses.duration": { en: "Duration", hi: "अवधि" },
  "courses.provider": { en: "Provider", hi: "प्रदाता" },

  // Jobs
  "jobs.title": { en: "Job Matching", hi: "जॉब मैचिंग" },
  "jobs.matchPercentage": { en: "Match", hi: "मिलान" },
  "jobs.required": { en: "Required Skills", hi: "आवश्यक कौशल" },
  "jobs.possessed": { en: "Your Skills", hi: "आपके कौशल" },

  // Video Notes
  "video.title": { en: "Video to Notes", hi: "वीडियो से नोट्स" },
  "video.paste": { en: "Paste tutorial URL", hi: "ट्यूटोरियल URL पेस्ट करें" },
  "video.generate": { en: "Generate Notes", hi: "नोट्स बनाएं" },
  "video.copy": { en: "Copy Notes", hi: "नोट्स कॉपी करें" },

  // Progress
  "progress.title": { en: "Progress Tracking", hi: "प्रगति ट्रैकिंग" },
  "progress.completed": { en: "Completed", hi: "पूरा हुआ" },
  "progress.inProgress": { en: "In Progress", hi: "चल रहा है" },
  "progress.achievements": { en: "Achievements", hi: "उपलब्धियां" },

  // Common
  "common.loading": { en: "Loading...", hi: "लोड हो रहा है..." },
  "common.save": { en: "Save", hi: "सहेजें" },
  "common.cancel": { en: "Cancel", hi: "रद्द करें" },
  "common.back": { en: "Back", hi: "वापस" },
  "common.next": { en: "Next", hi: "अगला" },
  "common.all": { en: "All", hi: "सभी" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem("skillbridge-lang") as Language) || "en"
  );

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("skillbridge-lang", lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
