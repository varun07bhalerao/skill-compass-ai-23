import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Briefcase, MapPin, Clock, CheckCircle2, XCircle, ExternalLink, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import axios from "axios";

// To use JSearch API from RapidAPI, you need an API key. 
// If this isn't provided, the app will gracefully fallback to Remotive API.
const RAPID_API_KEY = import.meta.env.VITE_RAPID_API_KEY || ""; 

interface Job {
  id: string | number;
  title: string;
  company: string;
  role: string;
  description: string;
  requiredSkills: string[];
  experienceLevel: string;
  location: string;
  url: string;
}

const roleRequirements: Record<string, string[]> = {
  "Data Analyst": ["SQL", "Excel", "Python", "Statistics", "Data Visualization"],
  "Frontend Developer": ["JavaScript", "HTML", "CSS", "React", "TypeScript", "Node.js"],
  "QA Engineer": ["Testing", "SQL", "JIRA", "Selenium", "Agile", "Python"],
  "Backend Developer": ["Node.js", "Python", "Java", "SQL", "MongoDB", "REST API", "Docker"],
  "Full Stack Developer": ["JavaScript", "React", "Node.js", "SQL", "MongoDB", "Docker", "AWS"],
};

const JobMatching = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [roleFilter, setRoleFilter] = useState("All");
  const [expanded, setExpanded] = useState<string | number | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userParsedSkills, setUserParsedSkills] = useState<string[]>([]);

  // Use empty array if no skills exist to accurately reflect 0% match
  const resumeSkills = user?.resume?.skills 
    ? user.resume.skills.map(s => s.skill.toLowerCase()) 
    : [];

  useEffect(() => {
    const fetchUserSkills = async () => {
      if (user?.email) {
        try {
          const docRef = doc(db, "userProfiles", user.email);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().parsedSkills) {
            setUserParsedSkills(docSnap.data().parsedSkills.map((s: string) => s.toLowerCase()));
          }
        } catch (e) {
          console.error("Failed to fetch user profiles", e);
        }
      }
    };
    fetchUserSkills();
  }, [user?.email]);

  const allUserSkills = Array.from(new Set([...resumeSkills, ...userParsedSkills]));

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const queries = [
          { q: "frontend", role: "Frontend Developer" },
          { q: "data%20analyst", role: "Data Analyst" },
          { q: "qa%20engineer", role: "QA Engineer" },
          { q: "backend", role: "Backend Developer" },
          { q: "full%20stack", role: "Full Stack Developer" }
        ];
        
        const allJobs: Job[] = [];
        
        for (const query of queries) {
          try {
            if (RAPID_API_KEY) {
              // 1. Fetch from JSearch (RapidAPI)
              const options = {
                method: 'GET',
                url: 'https://jsearch.p.rapidapi.com/search',
                params: {
                  query: `${query.role} remote`,
                  page: '1',
                  num_pages: '1'
                },
                headers: {
                  'X-RapidAPI-Key': RAPID_API_KEY,
                  'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
                }
              };
              
              const response = await axios.request(options);
              let fetchedJobs = response.data.data;
              if (query.role !== "Full Stack Developer") {
                fetchedJobs = fetchedJobs.filter((j: any) => {
                  const t = (j.job_title || "").toLowerCase();
                  if (t.includes("full stack") || t.includes("full-stack") || t.includes("fullstack")) return false;
                  if (query.role === "Data Analyst") return t.includes("data") || t.includes("analyst");
                  if (query.role === "Backend Developer") return t.includes("backend") || t.includes("back-end");
                  if (query.role === "Frontend Developer") return t.includes("frontend") || t.includes("front-end");
                  return true;
                });
              }
              fetchedJobs = fetchedJobs.slice(0, 5); // Take exactly top 5
              
              const mapped = fetchedJobs.map((j: any) => {
                const title = j.job_title || "";
                const lowerTitle = title.toLowerCase();
                const experienceLevel = j.job_required_experience?.required_experience_in_months
                  ? j.job_required_experience.required_experience_in_months > 36 ? "Senior Level" : "Mid Level"
                  : lowerTitle.includes("senior") ? "Senior Level" : lowerTitle.includes("junior") ? "Junior Level" : "Mid Level";
                  
                // Fallback to role requirements if API doesn't specificially parse out small arrays for skills
                const skillTags = roleRequirements[query.role] || [];
                
                return {
                  id: j.job_id || Math.random().toString(),
                  title: title,
                  company: j.employer_name || "Unknown Company",
                  role: query.role,
                  description: j.job_description ? j.job_description.slice(0, 180).trim() + "..." : "No description available.",
                  requiredSkills: skillTags,
                  experienceLevel,
                  location: j.job_country || j.job_city || "Remote",
                  url: j.job_apply_link || j.employer_website || "#"
                };
              });
              allJobs.push(...mapped);
              
            } else {
              // 2. Fallback to Remotive if no RapidAPI key
              const res = await fetch(`https://remotive.com/api/remote-jobs?search=${query.q}&limit=10`);
              const data = await res.json();
              
              if (data.jobs) {
                let validJobs = data.jobs;
                if (query.role !== "Full Stack Developer") {
                  validJobs = validJobs.filter((j: any) => {
                    const t = (j.title || "").toLowerCase();
                    if (t.includes("full stack") || t.includes("full-stack") || t.includes("fullstack")) return false;
                    if (query.role === "Data Analyst") return t.includes("data") || t.includes("analyst");
                    if (query.role === "Backend Developer") return t.includes("backend") || t.includes("back-end");
                    if (query.role === "Frontend Developer") return t.includes("frontend") || t.includes("front-end");
                    return true;
                  });
                }
                
                const mapped = validJobs.slice(0, 5).map((j: any) => {
                  let skillTags = j.tags && j.tags.length > 0 ? j.tags : roleRequirements[query.role] || [];
                  if (skillTags.length > 8) skillTags = skillTags.slice(0, 8);
                  
                  const lowerTitle = j.title.toLowerCase();
                  const experience = lowerTitle.includes("senior") ? "Senior Level" : 
                                     lowerTitle.includes("junior") ? "Junior Level" : "Mid Level";
                  
                  return {
                    id: j.id,
                    title: j.title,
                    company: j.company_name,
                    role: query.role,
                    description: j.description?.replace(/<[^>]+>/g, '').slice(0, 180).trim() + "...",
                    requiredSkills: skillTags.map((t: string) => t.trim() || "JavaScript"),
                    experienceLevel: experience,
                    location: j.candidate_required_location || "Remote",
                    url: j.url
                  };
                });
                allJobs.push(...mapped);
              }
            }
          } catch(err) {
            console.error(`Error fetching jobs for ${query.role}`, err);
          }

          if (query.role === "Data Analyst") {
            const addedCount = allJobs.filter(j => j.role === "Data Analyst").length;
            if (addedCount < 5) {
              const fallbackDAJobs: Job[] = [
                { id: "da_hm_1", title: "Data Analyst", company: "Amazon", role: "Data Analyst", description: "Analyze huge amounts of data in a fast-paced environment.", requiredSkills: roleRequirements["Data Analyst"] || [], experienceLevel: "Mid Level", location: "Mumbai, India", url: "https://www.amazon.jobs/en/search?base_query=data+analyst" },
                { id: "da_hm_2", title: "Data Analyst", company: "Accenture", role: "Data Analyst", description: "Leverage data tools to bring insights to enterprise clients.", requiredSkills: roleRequirements["Data Analyst"] || [], experienceLevel: "Mid Level", location: "Bangalore, India", url: "https://www.accenture.com/in-en/careers/jobsearch" },
                { id: "da_hm_3", title: "Data Analyst", company: "Deloitte", role: "Data Analyst", description: "Consulting role involving heavy data pipeline analysis.", requiredSkills: roleRequirements["Data Analyst"] || [], experienceLevel: "Mid Level", location: "Hyderabad, India", url: "https://apply.deloitte.com/careers" },
                { id: "da_hm_4", title: "Junior Data Analyst", company: "Tata Consultancy Services (TCS)", role: "Data Analyst", description: "Entry-level data analyst to assist in business intelligence.", requiredSkills: roleRequirements["Data Analyst"] || [], experienceLevel: "Junior Level", location: "Pune, India", url: "https://www.tcs.com/careers" },
                { id: "da_hm_5", title: "Data Analyst", company: "Flipkart", role: "Data Analyst", description: "E-commerce data analytics for supply chain optimization.", requiredSkills: roleRequirements["Data Analyst"] || [], experienceLevel: "Mid Level", location: "Bangalore, India", url: "https://www.flipkartcareers.com" }
              ];
              const needed = 5 - addedCount;
              allJobs.push(...fallbackDAJobs.slice(0, needed));
            }
          }

          if (query.role === "QA Engineer") {
            const addedQaCount = allJobs.filter(j => j.role === "QA Engineer").length;
            if (addedQaCount < 5) {
              const fallbackQAJobs: Job[] = [
                { id: "qa_hm_1", title: "QA Engineer", company: "Amazon", role: "QA Engineer", description: "Develop and execute automated tests using Selenium and Java.", requiredSkills: ["Selenium", "Java", "Automation Testing", "TestNG"], experienceLevel: "Mid Level", location: "Bangalore, India", url: "https://www.amazon.jobs/en/search?base_query=qa+engineer" },
                { id: "qa_hm_2", title: "Software QA Engineer", company: "Microsoft", role: "QA Engineer", description: "Lead quality assurance efforts across Azure deployment environments.", requiredSkills: ["Manual Testing", "Automation Testing", "C#", "Azure"], experienceLevel: "Mid Level", location: "Hyderabad, India", url: "https://careers.microsoft.com" },
                { id: "qa_hm_3", title: "QA Automation Engineer", company: "Infosys", role: "QA Engineer", description: "Design rigorous automated API and unit testing suites.", requiredSkills: ["Selenium", "Java", "API Testing", "JUnit"], experienceLevel: "Mid Level", location: "Pune, India", url: "https://www.infosys.com/careers" },
                { id: "qa_hm_4", title: "Quality Assurance Engineer", company: "Capgemini", role: "QA Engineer", description: "Provide critical manual testing and selenium automation workflows.", requiredSkills: ["Manual Testing", "Selenium", "Test Automation"], experienceLevel: "Mid Level", location: "Mumbai, India", url: "https://www.capgemini.com/careers" },
                { id: "qa_hm_5", title: "QA Engineer", company: "IBM", role: "QA Engineer", description: "Ensure stable releases via CI/CD and rigorous python automation scripts.", requiredSkills: ["Automation Testing", "Python", "Selenium", "CI/CD"], experienceLevel: "Mid Level", location: "Bangalore, India", url: "https://www.ibm.com/careers" },
                { id: "qa_hm_6", title: "Senior QA Engineer", company: "Oracle", role: "QA Engineer", description: "Architect QA automation frameworks leveraging SQL and Java integration.", requiredSkills: ["Selenium", "Java", "Automation Framework", "SQL"], experienceLevel: "Senior Level", location: "Hyderabad, India", url: "https://www.oracle.com/careers" }
              ];
              const needed = 5 - addedQaCount;
              allJobs.push(...fallbackQAJobs.slice(0, needed));
            }
          }

          if (query.role === "Backend Developer") {
            const addedBackendCount = allJobs.filter(j => j.role === "Backend Developer").length;
            if (addedBackendCount < 5) {
              const fallbackBackendJobs: Job[] = [
                { id: "be_hm_1", title: "Backend Developer", company: "Amazon", role: "Backend Developer", description: "Build highly scalable web services using Java and Spring Boot.", requiredSkills: ["Java", "Spring Boot", "AWS", "REST API"], experienceLevel: "Mid Level", location: "Bangalore, India", url: "https://www.amazon.jobs/en/search?base_query=backend+developer" },
                { id: "be_hm_2", title: "Software Engineer – Backend", company: "Microsoft", role: "Backend Developer", description: "Enhance microservices architecture hosted natively on Azure cloud.", requiredSkills: ["C#", ".NET", "Azure", "Microservices"], experienceLevel: "Mid Level", location: "Hyderabad, India", url: "https://careers.microsoft.com" },
                { id: "be_hm_3", title: "Backend Engineer", company: "Infosys", role: "Backend Developer", description: "Architect and deliver fast, resilient API endpoints.", requiredSkills: ["Java", "Spring Boot", "SQL", "API Development"], experienceLevel: "Mid Level", location: "Pune, India", url: "https://www.infosys.com/careers" },
                { id: "be_hm_4", title: "Backend Developer", company: "Capgemini", role: "Backend Developer", description: "Node.js development for global scale modern web applications.", requiredSkills: ["Node.js", "Express.js", "MongoDB", "REST API"], experienceLevel: "Mid Level", location: "Mumbai, India", url: "https://www.capgemini.com/careers" },
                { id: "be_hm_5", title: "Backend Software Engineer", company: "IBM", role: "Backend Developer", description: "Collaborate in an agile team on complex enterprise cloud solutions.", requiredSkills: ["Python", "Django", "SQL", "Cloud"], experienceLevel: "Mid Level", location: "Bangalore, India", url: "https://www.ibm.com/careers" },
                { id: "be_hm_6", title: "Senior Backend Developer", company: "Oracle", role: "Backend Developer", description: "Develop business-critical applications alongside highly capable data teams.", requiredSkills: ["Java", "Spring", "Microservices", "Oracle DB"], experienceLevel: "Senior Level", location: "Hyderabad, India", url: "https://www.oracle.com/careers" }
              ];
              const needed = 5 - addedBackendCount;
              allJobs.push(...fallbackBackendJobs.slice(0, needed));
            }
          }

          if (query.role === "Frontend Developer") {
            const addedFrontendCount = allJobs.filter(j => j.role === "Frontend Developer").length;
            if (addedFrontendCount < 5) {
              const fallbackFrontendJobs: Job[] = [
                { id: "fe_hm_1", title: "Frontend Developer", company: "Amazon", role: "Frontend Developer", description: "Design fast and responsive client-side experiences for scalable applications.", requiredSkills: ["JavaScript", "React", "HTML", "CSS"], experienceLevel: "Mid Level", location: "Bangalore, India", url: "https://www.amazon.jobs/en/search?base_query=frontend+developer" },
                { id: "fe_hm_2", title: "Software Engineer – Frontend", company: "Microsoft", role: "Frontend Developer", description: "Develop modern intuitive user interfaces using cutting-edge web technologies.", requiredSkills: ["TypeScript", "React", "HTML", "CSS"], experienceLevel: "Mid Level", location: "Hyderabad, India", url: "https://careers.microsoft.com" },
                { id: "fe_hm_3", title: "Frontend Engineer", company: "Flipkart", role: "Frontend Developer", description: "Enhance core e-commerce rendering patterns for massive user bases.", requiredSkills: ["JavaScript", "React", "Redux", "HTML"], experienceLevel: "Mid Level", location: "Bangalore, India", url: "https://www.flipkartcareers.com" },
                { id: "fe_hm_4", title: "UI Developer", company: "Infosys", role: "Frontend Developer", description: "Build scalable and performant UI components for global consumers.", requiredSkills: ["Angular", "JavaScript", "HTML", "CSS"], experienceLevel: "Mid Level", location: "Pune, India", url: "https://www.infosys.com/careers" },
                { id: "fe_hm_5", title: "Frontend Developer", company: "Capgemini", role: "Frontend Developer", description: "Architect UI/UX for enterprise dashboard solutions.", requiredSkills: ["React", "JavaScript", "CSS", "Bootstrap"], experienceLevel: "Mid Level", location: "Mumbai, India", url: "https://www.capgemini.com/careers" },
                { id: "fe_hm_6", title: "Frontend Software Engineer", company: "IBM", role: "Frontend Developer", description: "Optimize performance and accessibility on cutting-edge internal tools.", requiredSkills: ["JavaScript", "React", "Node.js", "UI Development"], experienceLevel: "Mid Level", location: "Bangalore, India", url: "https://www.ibm.com/careers" }
              ];
              const needed = 5 - addedFrontendCount;
              allJobs.push(...fallbackFrontendJobs.slice(0, needed));
            }
          }

          if (query.role === "Full Stack Developer") {
            const addedFsCount = allJobs.filter(j => j.role === "Full Stack Developer").length;
            if (addedFsCount < 5) {
              const fallbackFSJobs: Job[] = [
                { id: "fs_hm_1", title: "Full Stack Developer", company: "Amazon", role: "Full Stack Developer", description: "Deliver end-to-end features bridging complex backend logic with smooth UIs.", requiredSkills: ["Java", "React", "Spring Boot", "AWS"], experienceLevel: "Mid Level", location: "Bangalore, India", url: "https://www.amazon.jobs/en/search?base_query=full+stack+developer" },
                { id: "fs_hm_2", title: "Full Stack Software Engineer", company: "Microsoft", role: "Full Stack Developer", description: "Engineer scalable products from database to presentation layer.", requiredSkills: ["C#", ".NET", "React", "Azure"], experienceLevel: "Mid Level", location: "Hyderabad, India", url: "https://careers.microsoft.com" },
                { id: "fs_hm_3", title: "Full Stack Developer", company: "Google", role: "Full Stack Developer", description: "Develop innovative user-facing features on massive cloud-powered backends.", requiredSkills: ["JavaScript", "Angular", "Node.js", "Cloud"], experienceLevel: "Mid Level", location: "Bangalore, India", url: "https://careers.google.com" },
                { id: "fs_hm_4", title: "Full Stack Engineer", company: "Infosys", role: "Full Stack Developer", description: "Maintain and extend microservice architecture using highly scalable frontends.", requiredSkills: ["Java", "Spring Boot", "React", "SQL"], experienceLevel: "Mid Level", location: "Pune, India", url: "https://www.infosys.com/careers" },
                { id: "fs_hm_5", title: "Full Stack Developer", company: "Capgemini", role: "Full Stack Developer", description: "Provide comprehensive solutions from API creation to DOM manipulation.", requiredSkills: ["Node.js", "React", "MongoDB", "REST API"], experienceLevel: "Mid Level", location: "Mumbai, India", url: "https://www.capgemini.com/careers" },
                { id: "fs_hm_6", title: "Senior Full Stack Developer", company: "Oracle", role: "Full Stack Developer", description: "Architect distributed systems coupled with performant front-end frameworks.", requiredSkills: ["Java", "React", "Microservices", "Oracle DB"], experienceLevel: "Senior Level", location: "Hyderabad, India", url: "https://www.oracle.com/careers" }
              ];
              const needed = 5 - addedFsCount;
              allJobs.push(...fallbackFSJobs.slice(0, needed));
            }
          }
        }
        
        setJobs(allJobs);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
        setError("Unable to load jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, []);

  const checkSkillMatch = (skill: string) => {
    const sLow = skill.toLowerCase();
    return allUserSkills.some(uSkill => sLow.includes(uSkill) || uSkill.includes(sLow));
  };

  const getMatchBreakdown = (job: Job) => {
    let required = job.requiredSkills || [];
    if (required.length === 0) return { pct: 0, matched: [], missing: [] };
    
    let matched = required.filter(checkSkillMatch);
    let missing = required.filter(s => !checkSkillMatch(s));

    let pct = Math.round((matched.length / required.length) * 100);
    return { pct, matched, missing };
  };

  // No longer blocking users without resumes

  const roles = ["All", "Data Analyst", "Frontend Developer", "QA Engineer", "Backend Developer", "Full Stack Developer"];
  const filtered = roleFilter === "All" ? jobs : jobs.filter((j) => j.role === roleFilter);
  const sorted = [...filtered].sort((a, b) => getMatchBreakdown(b).pct - getMatchBreakdown(a).pct);

  return (
    <div className="container py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-display text-3xl font-bold">{t("jobs.title")}</h1>
        {loading && <div className="flex items-center text-muted-foreground text-sm"><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Fetching real jobs...</div>}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {roles.map((role) => (
          <Button key={role} variant={roleFilter === role ? "default" : "outline"} size="sm" onClick={() => setRoleFilter(role)} className="rounded-full">
            {role === "All" ? t("common.all") : role}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {error && (
          <div className="text-center py-10 text-destructive bg-destructive/10 rounded-lg font-medium">
            {error}
          </div>
        )}
        {!loading && !error && sorted.length === 0 && (
          <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-lg">No jobs found for this filter. Please try another.</div>
        )}
        
        {loading ? (
          // Loading skeletons
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="border-0 shadow-md h-32 animate-pulse bg-muted/40" />
          ))
        ) : (
          sorted.slice(0, 25).map((job, i) => {
            const { pct, matched, missing } = getMatchBreakdown(job);
            const isExpanded = expanded === job.id;

            return (
              <Card
                key={job.id}
                className="border-0 shadow-md cursor-pointer transition-all hover:shadow-lg animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
                onClick={() => setExpanded(isExpanded ? null : job.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{job.title}</h3>
                      <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{job.company}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{job.experienceLevel}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Button size="sm" asChild>
                        <a href={job.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                          Apply Now
                        </a>
                      </Button>
                      <Badge 
                        className={`text-sm text-white ${
                          pct >= 70 ? "bg-emerald-500 hover:bg-emerald-600" : 
                          pct >= 40 ? "bg-amber-500 hover:bg-amber-600" : 
                          "bg-red-500 hover:bg-red-600"
                        }`}
                      >
                        {pct}% Match
                      </Badge>
                    </div>
                  </div>
                  
                  <Progress 
                    value={pct} 
                    className="mt-3 h-1.5" 
                    indicatorClassName={
                      pct >= 70 ? "bg-emerald-500" : 
                      pct >= 40 ? "bg-amber-500" : 
                      "bg-red-500"
                    }
                  />

                  {isExpanded && (
                    <div className="mt-4 animate-fade-in">
                      <p className="mb-3 text-sm text-muted-foreground">{job.description}</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="mb-2 text-xs font-medium">✅ {t("jobs.possessed")}</p>
                          <div className="flex flex-wrap gap-1">
                            {matched.map((s) => (
                              <Badge key={s} variant="outline" className="gap-1 text-xs">
                                <CheckCircle2 className="h-3 w-3 text-secondary" />{s}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="mb-2 text-xs font-medium">❌ Missing</p>
                          <div className="flex flex-wrap gap-1">
                            {missing.map((s) => (
                              <Badge key={s} variant="outline" className="gap-1 text-xs text-destructive">
                                <XCircle className="h-3 w-3" />{s}
                              </Badge>
                            ))}
                            {missing.length === 0 && <span className="text-xs text-secondary">All skills matched!</span>}
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 border-t pt-6">
                        <p className="mb-4 text-sm font-semibold text-foreground/80 text-center sm:text-left">Choose Platform to Apply</p>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                          <Button 
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm"
                            onClick={(e) => { e.stopPropagation(); window.open(job.url, '_blank', 'noopener,noreferrer'); }}
                          >
                            Direct Apply
                          </Button>
                          <Button 
                            variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold shadow-sm"
                            onClick={(e) => { e.stopPropagation(); window.open(`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.company + ' ' + job.title)}`, '_blank'); }}
                          >
                            LinkedIn
                          </Button>
                          <Button 
                            variant="outline" className="border-sky-600 text-sky-600 hover:bg-sky-50 font-semibold shadow-sm"
                            onClick={(e) => { e.stopPropagation(); window.open(`https://www.indeed.com/jobs?q=${encodeURIComponent(job.company + ' ' + job.title)}`, '_blank'); }}
                          >
                            Indeed
                          </Button>
                          <Button 
                            variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 font-semibold shadow-sm"
                            onClick={(e) => { e.stopPropagation(); window.open(`https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(job.company + ' ' + job.title)}`, '_blank'); }}
                          >
                            Glassdoor
                          </Button>
                          <Button 
                            variant="outline" className="border-red-500 text-red-500 hover:bg-red-50 font-semibold shadow-sm"
                            onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/search?q=${encodeURIComponent(job.company + ' ' + job.title + ' job')}&ibp=htl;jobs`, '_blank'); }}
                          >
                            Google Jobs
                          </Button>
                          <Button 
                            variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold shadow-sm"
                            onClick={(e) => { e.stopPropagation(); window.open(`https://www.naukri.com/job-listings?keyword=${encodeURIComponent(job.company + ' ' + job.title)}`, '_blank'); }}
                          >
                            Naukri
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default JobMatching;
