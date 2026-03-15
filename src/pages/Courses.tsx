import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel, SelectSeparator } from "@/components/ui/select";
import { CheckCircle2, Clock, ExternalLink, PlayCircle, Star, Target, Award } from "lucide-react";
import { domainsData, DomainKey } from "@/lib/roadmap-data";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { BookOpen, Code2 } from "lucide-react";const topSkillsData: Record<string, {
  description: string;
  freeCourses: { name: string, platform: string, link: string }[];
  paidCourses: { name: string, platform: string, link: string, reason: string }[];
}> = {
  "Python": {
    description: "Learn Python from scratch, perfect for AI, Data Science, and Web Development.",
    freeCourses: [
      { name: "Python for Beginners", platform: "Programming with Mosh (YouTube)", link: "https://www.youtube.com/watch?v=_uQrJ0TkZlc" }, 
      { name: "Python 100 Days of Code", platform: "FreeCodeCamp", link: "https://www.youtube.com/watch?v=kqtD5dpn9C8" }
    ],
    paidCourses: [
      { name: "Complete Python Bootcamp", platform: "Udemy", link: "/courses", reason: "Best comprehensive python curriculum" },
      { name: "Python for Data Science and Machine Learning", platform: "Udemy", link: "/courses", reason: "Great for AI/ML focus" },
      { name: "100 Days of Code: The Complete Python Pro Bootcamp", platform: "Udemy", link: "/courses", reason: "Project-based learning approach" },
      { name: "Python for Everybody Specialization", platform: "Coursera", link: "/courses", reason: "Excellent beginner specialization" }
    ]
  },
  "JavaScript": {
    description: "The language of the web. Essential for Frontend and Backend (Node.js) development.",
    freeCourses: [{ name: "JavaScript Crash Course", platform: "Traversy Media", link: "https://www.youtube.com/watch?v=hdI2bqOjy3c" }],
    paidCourses: [
      { name: "The Complete JavaScript Course 2024", platform: "Udemy", link: "/courses", reason: "From scratch to expert JavaScript" },
      { name: "Modern JavaScript From The Beginning", platform: "Udemy", link: "/courses", reason: "Project-based pure JS" },
      { name: "JavaScript: Understanding the Weird Parts", platform: "Udemy", link: "/courses", reason: "Deep dive into JS mechanics" },
      { name: "JavaScript Algorithms and Data Structures", platform: "Coursera", link: "/courses", reason: "Best for computer science fundamentals" }
    ]
  },
  "Java": {
    description: "Enterprise level backend and Android app development language.",
    freeCourses: [{ name: "Java Tutorial for Beginners", platform: "Programming with Mosh", link: "https://www.youtube.com/watch?v=eIrMbAQSU34" }],
    paidCourses: [
      { name: "Java Programming Masterclass", platform: "Udemy", link: "/courses", reason: "Industry standard Java course" },
      { name: "Core Java Specialization", platform: "Coursera", link: "/courses", reason: "Comprehensive Java fundamentals" },
      { name: "Object Oriented Programming in Java", platform: "Coursera", link: "/courses", reason: "Great for OOP concepts" },
      { name: "Java In-Depth: Become a Complete Java Engineer", platform: "Udemy", link: "/courses", reason: "Detailed and practical" }
    ]
  },
  "C++": {
    description: "High-performance language for game development, competitive programming and systems.",
    freeCourses: [{ name: "C++ Tutorial for Beginners", platform: "FreeCodeCamp", link: "https://www.youtube.com/watch?v=vLnPwxZdW4Y" }],
    paidCourses: [
      { name: "Beginning C++ Programming", platform: "Udemy", link: "/courses", reason: "Deep dive into C++ fundamentals" },
      { name: "C++ For C Programmers", platform: "Coursera", link: "/courses", reason: "Best for transitioning programmers" },
      { name: "Unreal Engine C++ Developer", platform: "Udemy", link: "/courses", reason: "Best for game development in C++" },
      { name: "Learn Advanced C++ Programming", platform: "Udemy", link: "/courses", reason: "Advanced C++ concepts and STL" }
    ]
  },
  "TypeScript": {
    description: "JavaScript with syntax for types. Catch errors early in your editor.",
    freeCourses: [{ name: "TypeScript Crash Course", platform: "Traversy Media", link: "https://www.youtube.com/watch?v=BCg4U1FzODs" }],
    paidCourses: [
      { name: "Understanding TypeScript", platform: "Udemy", link: "/courses", reason: "Essential for modern frontend development" },
      { name: "Mastering TypeScript", platform: "Udemy", link: "/courses", reason: "Advanced TS patterns" },
      { name: "TypeScript for Professionals", platform: "Frontend Masters", link: "/courses", reason: "Industry-level TypeScript" },
      { name: "React and TypeScript Build a Portfolio Project", platform: "Udemy", link: "/courses", reason: "Practical React + TS" }
    ]
  },
  "React": {
    description: "The most popular frontend library for building user interfaces.",
    freeCourses: [{ name: "React Full Course", platform: "FreeCodeCamp", link: "https://www.youtube.com/watch?v=bMknfKXIFA8" }],
    paidCourses: [
      { name: "React - The Complete Guide", platform: "Udemy", link: "/courses", reason: "Covers hooks, next.js, and more" },
      { name: "Modern React with Redux", platform: "Udemy", link: "/courses", reason: "Great for state management" },
      { name: "Advanced React and GraphQL", platform: "Wes Bos", link: "/courses", reason: "Fullstack React development" },
      { name: "Epic React", platform: "Kent C. Dodds", link: "/courses", reason: "The most comprehensive React course" }
    ]
  },
  "Node.js": {
    description: "JavaScript runtime built on Chrome's V8 engine.",
    freeCourses: [{ name: "Node.js Tutorial", platform: "Programming with Mosh", link: "https://www.youtube.com/watch?v=TlB_eWDSMt4" }],
    paidCourses: [
      { name: "Complete Node.js Developer", platform: "Udemy", link: "/courses", reason: "Best backend JS course" },
      { name: "NodeJS - The Complete Guide", platform: "Udemy", link: "/courses", reason: "Covers Express, REST, and GraphQL" },
      { name: "Server-side Development with NodeJS", platform: "Coursera", link: "/courses", reason: "MERN Stack fundamentals" },
      { name: "Node.js API Masterclass With Express", platform: "Udemy", link: "/courses", reason: "Building production APIs" }
    ]
  },
  "SQL": {
    description: "Standard language for storing, manipulating and retrieving data in databases.",
    freeCourses: [{ name: "SQL Tutorial", platform: "Programming with Mosh", link: "https://www.youtube.com/watch?v=7S_tz1z_5bA" }],
    paidCourses: [
      { name: "The Complete SQL Bootcamp", platform: "Udemy", link: "/courses", reason: "Learn PostgreSQL and data analysis" },
      { name: "SQL for Data Science", platform: "Coursera", link: "/courses", reason: "SQL for data analytics" },
      { name: "Master SQL for Data Science", platform: "Udemy", link: "/courses", reason: "Advanced queries and tuning" },
      { name: "SQL and Relational Databases 101", platform: "Coursera", link: "/courses", reason: "Great beginner foundation" }
    ]
  },
  "Go": {
    description: "Fast, reliable, and efficient software at scale designed by Google.",
    freeCourses: [{ name: "Go Programming Tutorial", platform: "FreeCodeCamp", link: "https://www.youtube.com/watch?v=YS4e4q9oBaU" }],
    paidCourses: [
      { name: "Go: The Complete Developer's Guide", platform: "Udemy", link: "/courses", reason: "Practical Go application building" },
      { name: "Master Go Programming", platform: "Udemy", link: "/courses", reason: "Comprehensive from beginner to advanced" },
      { name: "Web Development w/ Google's Go Language", platform: "Udemy", link: "/courses", reason: "Building web apps in Go" },
      { name: "Programming with Google Go", platform: "Coursera", link: "/courses", reason: "Official Coursera Go specialization" }
    ]
  },
  "Rust": {
    description: "Blazingly fast and memory-efficient with no runtime or garbage collector.",
    freeCourses: [{ name: "Rust Crash Course", platform: "Traversy Media", link: "https://www.youtube.com/watch?v=zF34dRivLOw" }],
    paidCourses: [
      { name: "Ultimate Rust Crash Course", platform: "Udemy", link: "/courses", reason: "Great introduction to system programming in Rust" },
      { name: "Rust Programming: The Complete Developer's Guide", platform: "Udemy", link: "/courses", reason: "In-depth coverage of Rust concepts" },
      { name: "Learn Rust by Building Real Applications", platform: "Udemy", link: "/courses", reason: "Project-based Rust learning" },
      { name: "WebAssembly with Rust", platform: "Frontend Masters", link: "/courses", reason: "Rust for web performance" }
    ]
  },
  "Next.js": {
    description: "The React Framework for the Web. Essential for modern, fast, SEO-friendly React apps.",
    freeCourses: [{ name: "Next.js Full Course", platform: "FreeCodeCamp", link: "https://www.youtube.com/watch?v=ZVnjOPwW4ZA" }],
    paidCourses: [
      { name: "Complete Next.js Developer", platform: "ZeroToMastery", link: "https://zerotomastery.io", reason: "Best comprehensive Next.js course" },
      { name: "Next.js & React - The Complete Guide", platform: "Udemy", link: "/courses", reason: "In-depth SSR and App Router coverage" }
    ]
  },
  "Docker": {
    description: "Build, share, and run applications anywhere using containerization.",
    freeCourses: [{ name: "Docker Tutorial for Beginners", platform: "Programming with Mosh", link: "https://www.youtube.com/watch?v=pTFZFxd4hOI" }],
    paidCourses: [
      { name: "Docker Mastery", platform: "Udemy", link: "/courses", reason: "The only Docker/Kubernetes course you need" },
      { name: "Docker for the Absolute Beginner", platform: "Udemy", link: "/courses", reason: "Great starting point" }
    ]
  },
  "Kubernetes": {
    description: "Automate deploying, scaling, and managing containerized applications.",
    freeCourses: [{ name: "Kubernetes Tutorial for Beginners", platform: "TechWorld with Nana", link: "https://www.youtube.com/watch?v=X48VuDVv0do" }],
    paidCourses: [
      { name: "Kubernetes for the Absolute Beginners", platform: "Udemy", link: "/courses", reason: "Best beginner friendly guide" },
      { name: "Certified Kubernetes Administrator (CKA)", platform: "Udemy", link: "/courses", reason: "For certification prep" }
    ]
  },
  "AWS": {
    description: "Amazon Web Services - The world's most comprehensive and broadly adopted cloud platform.",
    freeCourses: [{ name: "AWS Certified Cloud Practitioner", platform: "FreeCodeCamp", link: "https://www.youtube.com/watch?v=SOTamWNgDKc" }],
    paidCourses: [
      { name: "Ultimate AWS Certified Solutions Architect", platform: "Udemy", link: "/courses", reason: "Must have for Cloud computing" }
    ]
  },
  "MongoDB": {
    description: "A document-based database used to build highly available and scalable internet applications.",
    freeCourses: [{ name: "MongoDB Crash Course", platform: "Traversy Media", link: "https://www.youtube.com/watch?v=-56x56UppqQ" }],
    paidCourses: [
      { name: "MongoDB - The Complete Developer's Guide", platform: "Udemy", link: "/courses", reason: "From beginner to advanced MongoDB" }
    ]
  },
  "Machine Learning": {
    description: "The field of study that gives computers the ability to learn without being explicitly programmed.",
    freeCourses: [{ name: "Machine Learning for Everybody", platform: "FreeCodeCamp", link: "https://www.youtube.com/watch?v=i_LwzRmA_08" }],
    paidCourses: [
      { name: "Machine Learning A-Z", platform: "Udemy", link: "/courses", reason: "Excellent hands-on Python/R course" },
      { name: "Machine Learning Specialization", platform: "Coursera", link: "/courses", reason: "By Andrew Ng - The industry standard" }
    ]
  }
};

const Courses = () => {
  const { user, updateUser } = useAuth();
  const location = useLocation();
  const [activeDomain, setActiveDomain] = useState<DomainKey>("Software Developer");
  const [activeSkill, setActiveSkill] = useState<string>("HTML5");
  const [searchMode, setSearchMode] = useState<"domain" | "skill">("domain");
  const [missingSkills, setMissingSkills] = useState<string[]>([]);

  const toggleComplete = (courseId: string) => {
    if (!user) return;
    const completed = user.completedCourses?.includes(courseId)
      ? user.completedCourses.filter((id) => id !== courseId)
      : [...(user.completedCourses || []), courseId];
    updateUser({ completedCourses: completed });
  };

  useEffect(() => {
    // 1. Process explicit navigation state
    if (location.state?.skill) {
      const skill = location.state.skill;
      setActiveSkill(skill);
      setSearchMode("skill");
    }
    
    if (location.state?.domain) {
      const domain = location.state.domain;
      const validDomains = Object.keys(domainsData);
      const exactMatch = validDomains.find((d) => d.toLowerCase() === domain.toLowerCase());
      
      if (exactMatch) {
        setActiveDomain(exactMatch as DomainKey);
        setSearchMode("domain");
      } else {
        const domainWords = domain.toLowerCase().split(' ');
        const partialMatch = validDomains.find(d => {
          const dWords = d.toLowerCase().split(' ');
          return domainWords.some(w => w.length > 3 && dWords.includes(w));
        });
        if (partialMatch) {
          setActiveDomain(partialMatch as DomainKey);
          setSearchMode("domain");
        }
      }
    }

    // 2. Provide a default based on user's careerGoal if available
    const fetchUserGoal = async () => {
      if (!user?.email) return;
      try {
        const docRef = doc(db, "userProfiles", user.email);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.missingSkills) {
            setMissingSkills(data.missingSkills);
          }
          if (data.careerGoal) {
            const rawGoal = data.careerGoal;
          const legacyGoalMap: Record<string, string> = {
            "frontend": "Frontend Developer",
            "backend": "Backend Developer",
            "fullstack": "Full Stack Developer",
            "data": "Data Analyst",
            "uiux": "UI/UX Designer",
            "cybersecurity": "Cybersecurity Analyst",
            "sap": "SAP Consultant"
          };
          
          const userGoal = legacyGoalMap[rawGoal.toLowerCase()] || rawGoal;
          
          const validDomains = Object.keys(domainsData);
          const exactMatch = validDomains.find((d) => d.toLowerCase() === userGoal.toLowerCase());
          
          let partialMatch: string | undefined = undefined;
          if (!exactMatch) {
            const domainWords = userGoal.toLowerCase().split(' ');
            partialMatch = validDomains.find(d => {
              const dWords = d.toLowerCase().split(' ');
              return domainWords.some(w => w.length > 3 && dWords.includes(w));
            });
          }

          // If we mapped to a domain, select it. If there's NO location state forcing domain mode, also switch mode to domain.
          if (exactMatch) {
            setActiveDomain(exactMatch as DomainKey);
            if (!location.state?.skill) {
              setSearchMode("domain");
              const exactSkills = domainsData[exactMatch as DomainKey]?.roadmapStages?.flatMap(s => s.skills) || [];
              if (exactSkills.length > 0) setActiveSkill(exactSkills[0]);
            }
          } else if (partialMatch) {
            setActiveDomain(partialMatch as DomainKey);
            if (!location.state?.skill) {
              setSearchMode("domain");
              const partialSkills = domainsData[partialMatch as DomainKey]?.roadmapStages?.flatMap(s => s.skills) || [];
              if (partialSkills.length > 0) setActiveSkill(partialSkills[0]);
            }
          }
        }
        }
      } catch (err) {
        console.error("Error fetching user goal:", err);
      }
    };

    fetchUserGoal();
  }, [location.state, user?.email]);

  const currentData = domainsData[activeDomain];
  
  const getSkillData = (skill: string) => {
    if (topSkillsData[skill]) return topSkillsData[skill];
    return {
      description: `Comprehensive resources to help you master ${skill}.`,
      freeCourses: [{ 
        name: `${skill} Complete Tutorial`, 
        platform: "YouTube Search", 
        link: `https://www.youtube.com/results?search_query=${encodeURIComponent(skill)}+tutorial` 
      }],
      paidCourses: [{ 
        name: `Master ${skill} from Scratch`, 
        platform: "Udemy Search", 
        link: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(skill)}`, 
        reason: `Highly rated courses available for ${skill}` 
      }]
    };
  };

  const currentSkillData = getSkillData(activeSkill);
  const baseDomainSkills = Array.from(new Set(currentData?.roadmapStages?.flatMap(stage => stage.skills) || []));
  const domainSkills = activeSkill && !baseDomainSkills.includes(activeSkill) 
    ? [activeSkill, ...baseDomainSkills] 
    : baseDomainSkills;

  const DomainIcon = currentData.icon;

  return (
    <div className="container py-10 max-w-6xl animate-fade-in">
      <div className="mb-8 text-center">
        {searchMode === "domain" ? (
          <>
            <h1 className="mb-4 font-display text-4xl font-extrabold tracking-tight lg:text-5xl text-gray-900 dark:text-white flex items-center justify-center gap-3">
              <DomainIcon className="w-10 h-10 text-primary" />
              {currentData.title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {currentData.description}
            </p>
          </>
        ) : (
          <>
            <h1 className="mb-4 font-display text-4xl font-extrabold tracking-tight lg:text-5xl text-gray-900 dark:text-white flex items-center justify-center gap-3">
              <Code2 className="w-10 h-10 text-primary" />
              {activeSkill} Courses
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {currentSkillData.description}
            </p>
          </>
        )}
      </div>

      <div className="flex flex-col items-center mb-10">
        <div className="w-full max-w-3xl bg-muted/40 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-center gap-6 border border-border/50 shadow-sm transition-all">
          <div className="flex flex-col gap-2 w-full">
            <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">Filter by Domain:</span>
            <Select
              value={activeDomain}
              onValueChange={(val) => {
                const newDomain = val as DomainKey;
                setActiveDomain(newDomain);
                setSearchMode("domain");
                const newSkills = domainsData[newDomain]?.roadmapStages?.flatMap(s => s.skills) || [];
                if (newSkills.length > 0 && !newSkills.includes(activeSkill)) {
                  setActiveSkill(newSkills[0]);
                }
              }}
            >
              <SelectTrigger className={`w-full bg-background transition-colors ${searchMode === 'domain' ? 'border-primary ring-1 ring-primary/20' : 'border-primary/20 hover:border-primary/50'}`}>
                <SelectValue placeholder="Select a domain" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(domainsData).map((domain) => (
                  <SelectItem key={domain} value={domain}>
                    {domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-center">
            <span className="text-xs font-bold text-muted-foreground uppercase bg-muted px-2 py-1 rounded-md">OR</span>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">Filter by Skill:</span>
            <Select
              value={activeSkill}
              onValueChange={(val) => {
                setActiveSkill(val);
                setSearchMode("skill");
              }}
            >
              <SelectTrigger className={`w-full bg-background transition-colors ${searchMode === 'skill' ? 'border-primary ring-1 ring-primary/20' : 'border-primary/20 hover:border-primary/50'}`}>
                <SelectValue placeholder="Select a Skill" />
              </SelectTrigger>
              <SelectContent>
                {missingSkills.length > 0 && (
                  <SelectGroup>
                    <SelectLabel className="text-red-500 font-bold">Your Missing Skills</SelectLabel>
                    {missingSkills.map((skill) => (
                      <SelectItem key={`missing-${skill}`} value={skill}>
                        {skill}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
                {missingSkills.length > 0 && <SelectSeparator />}
                
                <SelectGroup>
                  <SelectLabel className="text-primary font-bold">Domain Skills</SelectLabel>
                  {domainSkills.length > 0 ? domainSkills.filter(skill => !missingSkills.includes(skill)).map((skill) => (
                    <SelectItem key={`domain-${skill}`} value={skill}>
                      {skill}
                    </SelectItem>
                  )) : (
                    !missingSkills.includes(activeSkill) && <SelectItem value={activeSkill}>{activeSkill}</SelectItem>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {searchMode === "domain" ? (
        <Tabs defaultValue="roadmap" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="roadmap">Learning Path</TabsTrigger>
              <TabsTrigger value="paid">Preimum Courses</TabsTrigger>
              <TabsTrigger value="job-prep">Job Prep</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="roadmap" className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {currentData.roadmapStages.map((stage, idx) => (
              <Card key={`${activeDomain}-${idx}`} className="border-0 shadow-lg overflow-hidden animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                <CardHeader className="bg-muted/30 border-b">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <Badge variant="outline" className={`mb-2 ${stage.color}`}>
                        {stage.level} Stage
                      </Badge>
                      <CardTitle className="text-2xl font-bold">{stage.title}</CardTitle>
                      <CardDescription className="mt-1 text-base">{stage.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-background rounded-full px-4 py-2 shadow-sm border">
                      <Clock className="h-4 w-4" />
                      Est. {stage.duration}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
                          <Target className="h-5 w-5 text-primary" /> Skills You Will Learn
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {stage.skills.map(skill => (
                            <Badge key={skill} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
                          <PlayCircle className="h-5 w-5 text-primary" /> Top Free Courses
                        </h4>
                        <ul className="space-y-3">
                          {stage.freeCourses.map((course, cIdx) => {
                            const courseId = `free-${activeDomain}-${idx}-${cIdx}`;
                            const isCompleted = user?.completedCourses?.includes(courseId);
                            return (
                            <li key={cIdx} className={`flex justify-between items-center group bg-muted/20 p-3 rounded-lg border transition-colors ${isCompleted ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'border-border/50 hover:border-primary/50'}`}>
                              <div>
                                <p className="font-medium text-sm group-hover:text-primary transition-colors">{course.name}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{course.channel} • {course.platform}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button 
                                  size="sm" 
                                  variant={isCompleted ? "default" : "outline"} 
                                  className={`gap-1 h-8 rounded-full ${isCompleted ? '' : 'text-muted-foreground hover:text-primary'}`}
                                  onClick={() => toggleComplete(courseId)}
                                  title={isCompleted ? "Completed" : "Mark as completed"}
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span className="hidden sm:inline">{isCompleted ? "Done" : "Mark Done"}</span>
                                </Button>
                                <a href={(course as any).link} target="_blank" rel="noopener noreferrer">
                                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </a>
                              </div>
                            </li>
                          )})}
                        </ul>
                      </div>
                    </div>
                    <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
                      <h4 className="flex items-center gap-2 font-semibold text-lg mb-4 text-primary">
                        <Target className="h-5 w-5" /> Projects to Build
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">Solidify your learning by building these projects.</p>
                      <ul className="space-y-4">
                        {stage.projects.map((project, pIdx) => {
                          const projectId = `proj-${activeDomain}-${idx}-${pIdx}`;
                          const isCompleted = user?.completedCourses?.includes(projectId);
                          return (
                          <li key={pIdx} className="flex items-start gap-3 cursor-pointer group" onClick={() => toggleComplete(projectId)}>
                            <CheckCircle2 className={`h-5 w-5 shrink-0 mt-0.5 transition-colors ${isCompleted ? 'text-primary' : 'text-muted-foreground group-hover:text-primary/70'}`} />
                            <span className={`font-medium text-sm leading-snug transition-colors ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>{project}</span>
                          </li>
                        )})}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="paid" className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-6 mb-8 text-center animate-fade-in">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">Accelerate your {activeDomain} journey</h3>
              <p className="text-blue-700 dark:text-blue-400 text-sm max-w-3xl mx-auto">
                Paid courses offer structured learning, code-alongs, and community support which can significantly <strong>accelerate your job preparation</strong>.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentData.paidCourses.map((course, idx) => {
                const courseId = `paid-${activeDomain}-${idx}`;
                const isCompleted = user?.completedCourses?.includes(courseId);
                return (
                <Card key={`${activeDomain}-${idx}`} className={`border-0 shadow-md hover:shadow-xl transition-all h-full flex flex-col animate-fade-in ${isCompleted ? 'ring-2 ring-primary' : ''}`} style={{ animationDelay: `${idx * 100}ms` }}>
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={course.platform === "Udemy" ? "bg-purple-600 hover:bg-purple-700" : course.platform === "Coursera" ? "bg-blue-600 hover:bg-blue-700" : "bg-neutral-800 hover:bg-neutral-900"}>{course.platform}</Badge>
                      {course.priority.includes("High") && <Badge variant="destructive" className="animate-pulse">Top Pick</Badge>}
                    </div>
                    <CardTitle className="text-xl leading-tight">{course.name}</CardTitle>
                    <CardDescription>by {course.author}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-yellow-500 mb-3">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-4 w-4 fill-current" />)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 font-medium italic">"{course.reason}"</p>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs font-semibold text-primary mb-3">Priority: {course.priority}</p>
                      <div className="flex gap-2 w-full">
                        <Button 
                          size="icon" 
                          variant={isCompleted ? "default" : "outline"}
                          className={isCompleted ? '' : 'text-muted-foreground'}
                          onClick={() => toggleComplete(courseId)}
                          title={isCompleted ? "Completed" : "Mark as completed"}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <a href={(course as any).link || "/courses"} target="_blank" rel="noopener noreferrer" className="flex-1">
                          <Button className="w-full gap-2 transition-transform hover:scale-105"><ExternalLink className="h-4 w-4" /> View Course</Button>
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )})}
            </div>
          </TabsContent>

          <TabsContent value="job-prep" className="animate-in slide-in-from-bottom-4 duration-500">
            <Card className="border-0 shadow-xl overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-950/20 dark:via-background dark:to-purple-950/20">
              <CardHeader className="text-center pb-8 pt-10">
                <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4"><Award className="h-8 w-8 text-primary" /></div>
                <CardTitle className="text-3xl font-bold">Passing the Interview</CardTitle>
                <CardDescription className="text-base max-w-xl mx-auto mt-2">Learning to code is only half the battle. Passing the interview is the remaining 50%.</CardDescription>
              </CardHeader>
              <CardContent className="px-6 md:px-12 pb-12">
                <div className="space-y-6">
                  {currentData.jobPrepTips.map((tip, idx) => (
                    <div key={`${activeDomain}-${idx}`} className="flex gap-4 p-4 rounded-xl bg-white/60 dark:bg-background/60 shadow-sm border backdrop-blur-sm hover:shadow-md transition-all animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                      <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-lg h-fit">{tip.icon}</div>
                      <div>
                        <h4 className="text-lg font-bold mb-1 tracking-tight">{tip.title}</h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">{tip.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-10 text-center"><Button size="lg" className="rounded-full px-8 gap-2 font-semibold hover:shadow-lg transition-all"><CheckCircle2 className="h-5 w-5" /> Start Applying Mocks</Button></div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
          <div>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              Recommended Courses for {activeSkill}
            </h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <h4 className="text-xl font-semibold mb-4 text-emerald-600 dark:text-emerald-400">Free/YouTube Courses</h4>
                {currentSkillData.freeCourses.map((course, idx) => {
                  const courseId = `skill-free-${activeSkill}-${idx}`;
                  const isCompleted = user?.completedCourses?.includes(courseId);
                  return (
                  <Card key={`free-${idx}`} className={`border-0 shadow-md hover:shadow-lg transition-all animate-fade-in group ${isCompleted ? 'ring-2 ring-emerald-500' : ''}`}>
                    <CardHeader className="pb-3 border-b bg-emerald-50/50 dark:bg-emerald-900/10">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300">Free</Badge>
                      </div>
                      <CardTitle className="text-lg mt-2 group-hover:text-primary transition-colors">{course.name}</CardTitle>
                      <CardDescription>{course.platform}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 flex justify-between items-center">
                      <Button 
                        size="sm" 
                        variant={isCompleted ? "default" : "ghost"}
                        className={`gap-1 ${isCompleted ? 'bg-emerald-600 hover:bg-emerald-700' : 'text-emerald-700'}`}
                        onClick={() => toggleComplete(courseId)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="hidden sm:inline">{isCompleted ? "Done" : "Mark Done"}</span>
                      </Button>
                      <a href={course.link} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="gap-2" variant="outline">
                          <ExternalLink className="h-4 w-4" /> Watch Now
                        </Button>
                      </a>
                    </CardContent>
                  </Card>
                )})}
              </div>

              <div className="space-y-6">
                <h4 className="text-xl font-semibold mb-4 text-blue-600 dark:text-blue-400">Premium/Paid Courses</h4>
                {currentSkillData.paidCourses.map((course, idx) => {
                  const courseId = `skill-paid-${activeSkill}-${idx}`;
                  const isCompleted = user?.completedCourses?.includes(courseId);
                  return (
                  <Card key={`paid-${idx}`} className={`border-0 shadow-md hover:shadow-lg transition-all animate-fade-in group ${isCompleted ? 'ring-2 ring-blue-500' : ''}`}>
                    <CardHeader className="pb-3 border-b bg-blue-50/50 dark:bg-blue-900/10">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300">{course.platform}</Badge>
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="h-3 w-3 fill-current" />
                          <Star className="h-3 w-3 fill-current" />
                          <Star className="h-3 w-3 fill-current" />
                          <Star className="h-3 w-3 fill-current" />
                          <Star className="h-3 w-3 fill-current" />
                        </div>
                      </div>
                      <CardTitle className="text-lg mt-2 group-hover:text-primary transition-colors">{course.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 flex flex-col justify-between items-start gap-4">
                      <p className="text-sm text-muted-foreground italic">"{course.reason}"</p>
                      <div className="flex gap-2 w-full">
                        <Button 
                          size="icon" 
                          variant={isCompleted ? "default" : "outline"}
                          className={isCompleted ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'text-blue-700 border-blue-200'}
                          onClick={() => toggleComplete(courseId)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <a href={course.link} className="flex-1">
                          <Button size="sm" className="w-full gap-2">
                            <ExternalLink className="h-4 w-4" /> View Course
                          </Button>
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                )})}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Courses;
