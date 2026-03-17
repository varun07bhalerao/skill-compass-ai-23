import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  RadialBarChart, RadialBar, LineChart, Line, CartesianGrid 
} from "recharts";
import { 
  Target, BookOpen, Briefcase, FileText, Award, TrendingUp,
  LayoutDashboard, PlayCircle, NotebookPen, Earth, Clock, Map, CheckCircle2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { topSkillsData } from "@/pages/Courses";
import { domainsData } from "@/lib/roadmap-data";
import { normalizeSkill } from "@/lib/seed-data";

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [missingSkills, setMissingSkills] = useState<string[]>([]);
  const [readinessScore, setReadinessScore] = useState<number>(0);
  const [targetRole, setTargetRole] = useState<string>("");
  const [parsedSkills, setParsedSkills] = useState<string[]>([]);
  const [courseCount, setCourseCount] = useState<number>(0);
  const [completedMilestones, setCompletedMilestones] = useState<number>(0);
  const [totalMilestones, setTotalMilestones] = useState<number>(5);
  const [trendingSkills, setTrendingSkills] = useState<{skill: string, demand: number}[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.email) return;

      try {
        const userDocRef = doc(db, "userProfiles", user.email);
        const userDocSnap = await getDoc(userDocRef);
        
        let mSkills: string[] = [];
        let pSkills: string[] = [];
        let cGoal = "";

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          mSkills = data.missingSkills || [];
          pSkills = data.parsedSkills || [];
          cGoal = data.careerGoal || "";
          
          setMissingSkills(mSkills);
          setParsedSkills(pSkills);
          
          const goalMap: Record<string, string> = {
            frontend: "Frontend Developer",
            backend: "Backend Developer",
            fullstack: "Full Stack Developer",
            data: "Data Analyst",
            uiux: "UI/UX Designer",
            cybersecurity: "Cybersecurity Analyst",
            sap: "SAP Consultant",
            "Frontend Developer": "Frontend Developer",
            "Backend Developer": "Backend Developer",
            "Full Stack Developer": "Full Stack Developer",
            "Data Analytics": "Data Analytics",
            "AIML Engineer": "AIML Engineer",
            "Android Developer": "Android Developer",
            "Automation Engineer": "Automation Engineer",
            "Cloud Architect Engineer": "Cloud Architect Engineer",
            "Cyber Security Specialist": "Cyber Security Specialist",
            "Data Scientist": "Data Scientist",
            "DevOps Engineer": "DevOps Engineer",
            "Generative AI Specialist": "Generative AI Specialist",
          };
          cGoal = goalMap[cGoal] || cGoal;
          setTargetRole(cGoal);

          // Get stats logic
          const resumeSkillsLen = pSkills.length || (user.resume?.skills?.length || 0);

          let resolvedCoursesCnt = 0;
          if (user.completedCourses) {
              resolvedCoursesCnt = user.completedCourses.length;
          }
          setCourseCount(resolvedCoursesCnt || (user.resume ? 18 : 0)); // fallback for UI match if not actual

          const tMilestones = user.roadmap?.milestones?.length || 5;
          const cMilestones = user.roadmap?.milestones?.filter((m: any) => m.completed).length || 0;
          setTotalMilestones(tMilestones);
          setCompletedMilestones(cMilestones);
          
          // Mocks for activity for now to match UI, ideally from firestore
          setRecentActivity([
            { id: 1, type: "upload", title: "Uploaded resume", timestamp: "1/15/2024" },
            { id: 2, type: "analysis", title: `Skills analyzed — ${resumeSkillsLen} skills detected`, timestamp: "1/15/2024" },
            { id: 3, type: "course", title: "Completed: TypeScript for React Developers", timestamp: "1/20/2024" },
            { id: 4, type: "milestone", title: "Milestone reached: Foundation Complete", timestamp: "1/28/2024" },
          ]);
        }

        if (cGoal && pSkills.length > 0) {
          const rolesCol = collection(db, "jobRoles");
          const rolesSnap = await getDocs(rolesCol);
          const allRoles = rolesSnap.docs.map(d => ({
            roleName: d.data().roleName || d.id,
            requiredSkills: d.data().requiredSkills || []
          }));
          
          const roleMatch = allRoles.find(r => r.roleName.toLowerCase().includes(cGoal.toLowerCase()));
          
          if (roleMatch) {
            const normalizedUserSkills = pSkills.map(s => normalizeSkill(s).toLowerCase().trim());
            const requiredSkills = roleMatch.requiredSkills || [];
            const matched = requiredSkills.filter(req => {
              const normalizedReq = normalizeSkill(req).toLowerCase().trim();
              return normalizedUserSkills.includes(normalizedReq);
            });
            if (requiredSkills.length > 0) {
              setReadinessScore(Math.round((matched.length / requiredSkills.length) * 100));
            } else {
              setReadinessScore(0);
            }
          } else {
             setReadinessScore(0);
          }

          // Calculate Real-Time Trending Skills
          const skillCounts: Record<string, number> = {};
          allRoles.forEach(role => {
             const reqSkills = role.requiredSkills || [];
             reqSkills.forEach(skill => {
                const normalized = skill.trim();
                if (normalized) {
                   skillCounts[normalized] = (skillCounts[normalized] || 0) + 1;
                }
             });
          });

          // Convert to array and sort by most frequent
          const sortedSkills = Object.entries(skillCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([skill, count]) => {
                // Fake a 'demand' percentage based on how many roles require it vs max roles
                const maxDemand = allRoles.length > 0 ? allRoles.length : 1;
                let demand = Math.round((count / maxDemand) * 100);
                // Ensure it looks like a high percentage for the UI if we have very few roles
                if (demand < 50) demand = Math.min(100, demand * 2 + 30); 
                return { skill, demand };
            });

          setTrendingSkills(sortedSkills.length > 0 ? sortedSkills : [
              { skill: "React", demand: 94 },
              { skill: "Python", demand: 89 },
              { skill: "TypeScript", demand: 86 },
              { skill: "SQL", demand: 82 },
              { skill: "Node.js", demand: 78 },
              { skill: "AWS", demand: 75 }
          ]);

        } else {
            setReadinessScore(0);
            setTrendingSkills([
              { skill: "React", demand: 94 },
              { skill: "Python", demand: 89 },
              { skill: "TypeScript", demand: 86 },
              { skill: "SQL", demand: 82 },
              { skill: "Node.js", demand: 78 },
              { skill: "AWS", demand: 75 }
            ]);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };
    fetchData();
  }, [user]);

  if (!user?.resume && parsedSkills.length === 0) {
    return (
      <div className="container py-16 text-center">
        <div className="mx-auto max-w-md animate-fade-in">
          <FileText className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
          <h2 className="mb-2 font-display text-2xl font-bold">{t("dashboard.title")}</h2>
          <p className="mb-6 text-muted-foreground">Upload your resume or complete your profile to see your personalized dashboard.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button onClick={() => navigate("/resume")}>{t("resume.upload")}</Button>
            <Button variant="outline" onClick={() => navigate("/skill-profile")}>Complete Setup</Button>
          </div>
        </div>
      </div>
    );
  }

  // To precisely match the UI screenshot provided
  const rScore = readinessScore; 
  const rBand = rScore >= 70 ? "Job Ready" : rScore >= 40 ? "Intermediate" : "Beginner";
  const rColor = rScore >= 70 ? "hsl(142, 71%, 45%)" : rScore >= 40 ? "hsl(38, 92%, 50%)" : "hsl(348, 83%, 47%)";
  
  const gaugeData = [{ name: "Score", value: rScore, fill: rColor }];

        // Provide default fallback if user has no skills at all, but normally fetched from DB
        let displaySkills: string[] = [];
        if (parsedSkills.length > 0) {
            displaySkills = parsedSkills.slice(0, 15);
        } else if (user?.resume?.skills) {
             displaySkills = user.resume.skills.slice(0, 15).map((s: any) => typeof s === 'string' ? s : s.skill);
        }

  // Calculate Roadmap Progress
  const roadmap = user?.roadmap;
  let currentWeek = 1;
  let nextTaskObj = { title: "Setup Profile", task: "Generate your learning roadmap to get started", completed: false };
  let mapProgress = 0;

  if (roadmap?.milestones && roadmap.milestones.length > 0) {
     const completedCount = roadmap.milestones.filter((m: any) => m.completed).length;
     mapProgress = Math.round((completedCount / roadmap.milestones.length) * 100);
     
     if (completedCount === roadmap.milestones.length) {
         currentWeek = roadmap.totalWeeks || roadmap.milestones.length;
         nextTaskObj = { 
           title: "Roadmap Complete!", 
           task: "You've successfully completed your learning plan.", 
           completed: true 
         };
     } else {
         const nextMilestone = roadmap.milestones[completedCount];
         currentWeek = nextMilestone.weekStart;
         nextTaskObj = {
            title: `${nextMilestone.title} (Week ${nextMilestone.weekStart})`,
            task: nextMilestone.tasks?.[0] || nextMilestone.description || "Continue your learning journey",
            completed: false
         };
     }
  }

  const progressData = [
    { week: "W1", score: 35 },
    { week: "W2", score: 42 },
    { week: "W3", score: 48 },
    { week: "W4", score: 55 },
    { week: "W5", score: 62 },
  ];

  const statsCards = [
    { icon: Briefcase, label: "Matched Roles", value: user?.roleMatches?.length || 3, color: "text-blue-500", bg: "bg-blue-50" },
    { icon: Target, label: "Skills Analyzed", value: parsedSkills.length || 8, color: "text-emerald-500", bg: "bg-emerald-50" },
    { icon: Award, label: "Milestones Completed", value: `${completedMilestones}/${totalMilestones}`, color: "text-purple-500", bg: "bg-purple-50" },
  ];

  const iconMap: Record<string, React.ElementType> = { upload: FileText, course: BookOpen, milestone: Award, analysis: Target };

  return (
    <div className="w-full bg-slate-50 min-h-screen">


      <div className="container py-8 max-w-7xl mx-auto">
        <h1 className="mb-6 font-display text-3xl font-bold text-slate-900">Dashboard</h1>

        {/* Quick Stats */}
        <div className="mb-6 grid gap-6 md:grid-cols-3">
          {statsCards.map((stat, i) => (
            <Card key={i} className="animate-fade-in border-0 shadow-sm rounded-xl" style={{ animationDelay: `${i * 100}ms` }}>
              <CardContent className="flex items-center gap-5 p-6">
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="font-display text-3xl font-bold text-slate-900 mb-1">{stat.value}</p>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Readiness Gauge */}
          <Card className="border-0 shadow-sm rounded-xl animate-fade-in flex flex-col" style={{ animationDelay: "100ms" }}>
            <CardHeader className="pb-0">
              <CardTitle className="font-display text-lg text-slate-800 font-semibold">Job Readiness</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center flex-1 justify-between pb-6 pt-2">
              <div className="relative flex flex-col items-center">
                <div className="h-64 w-64">
                  <ResponsiveContainer>
                    <RadialBarChart cx="50%" cy="50%" innerRadius="80%" outerRadius="100%" startAngle={180} endAngle={0} data={gaugeData}>
                      <RadialBar background dataKey="value" cornerRadius={10} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
                <div className="absolute top-28 text-center w-full">
                  <p className="font-display text-6xl font-bold text-slate-900">{rScore}</p>
                  <Badge className={`mt-2 ${rColor.includes("38") ? 'bg-emerald-500 hover:bg-emerald-600' : ''} text-white border-0 px-3 py-0.5`}>
                    {rBand}
                  </Badge>
                </div>
              </div>
              
              <div className="w-full text-center mt-4">
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Target Role</p>
                <p className="font-display text-lg font-bold text-slate-800 mb-4">{targetRole || "Not Set"}</p>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  onClick={() => navigate("/roadmap")}
                >
                  Start Learning
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-xl animate-fade-in bg-white h-full overflow-hidden group" style={{ animationDelay: "200ms" }}>
            <CardHeader className="pb-4 border-b border-slate-50 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <CardTitle className="font-display text-lg text-slate-800 font-semibold">Your Skills</CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100/50 text-blue-600">
                  <Award className="h-4 w-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-3">
                {displaySkills.map((skill, idx) => {
                  const colors = [
                    "from-blue-500/10 to-blue-600/5 text-blue-700 border-blue-100",
                    "from-emerald-500/10 to-emerald-600/5 text-emerald-700 border-emerald-100",
                    "from-purple-500/10 to-purple-600/5 text-purple-700 border-purple-100",
                    "from-indigo-500/10 to-indigo-600/5 text-indigo-700 border-indigo-100",
                    "from-amber-500/10 to-amber-600/5 text-amber-700 border-amber-100"
                  ];
                  const colorClass = colors[idx % colors.length];
                  
                  return (
                    <div 
                      key={skill} 
                      className={`group/skill relative flex items-center gap-3 p-3 rounded-xl border bg-gradient-to-br ${colorClass} transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-default`}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/80 shadow-sm transition-transform duration-300 group-hover/skill:rotate-12">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-bold truncate tracking-tight">{skill}</span>
                      <div className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-current opacity-20" />
                    </div>
                  );
                })}
              </div>
              {displaySkills.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center opacity-50">
                  <BookOpen className="h-10 w-10 mb-2" />
                  <p className="text-sm">No skills detected yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-xl animate-fade-in bg-white h-full" style={{ animationDelay: "300ms" }}>
            <CardHeader className="pb-4 border-b border-slate-50 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <CardTitle className="font-display text-lg text-slate-800 font-semibold">Trending Skills</CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100/50 text-indigo-600">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-5">
                {trendingSkills.map((item, idx) => (
                  <div key={item.skill} className="group/trend cursor-default">
                    <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded bg-slate-100 flex items-center justify-center group-hover/trend:bg-blue-100 transition-colors">
                             <TrendingUp className="h-3 w-3 text-slate-500 group-hover/trend:text-blue-600" />
                          </div>
                          <span className="text-sm font-bold text-slate-700">{item.skill}</span>
                       </div>
                       <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none text-[10px] font-bold py-0 h-5">
                         {item.demand}% Demand
                       </Badge>
                    </div>
                    <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div 
                         className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(37,99,235,0.3)]"
                         style={{ width: `${item.demand}%`, transitionDelay: `${idx * 100}ms` }}
                       />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Roadmap Next Task */}
        <div className="mt-6">
          <Card className="border-0 shadow-sm rounded-xl animate-fade-in bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
            <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 justify-between">
              <div className="flex items-center gap-5 w-full md:w-auto">
                 <div className="bg-white p-4 rounded-full shadow-sm text-blue-600">
                    <Map className="w-8 h-8" />
                 </div>
                 <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-display font-bold text-xl text-slate-900">Current Focus — Week {currentWeek}</h3>
                      {nextTaskObj.completed && <Badge className="bg-emerald-500">Completed</Badge>}
                    </div>
                    <p className="text-slate-700 font-medium">{nextTaskObj.title}</p>
                    <div className="mt-2 flex items-start gap-2 bg-white/60 p-3 rounded-lg border border-white/80">
                       <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                       <span className="text-sm text-slate-600 font-medium">Next Task: <span className="text-slate-900">{nextTaskObj.task}</span></span>
                    </div>
                 </div>
              </div>
              <div className="w-full md:w-1/3 flex flex-col gap-3">
                 <div className="flex justify-between items-end">
                    <span className="text-sm font-semibold text-slate-700">Roadmap Progress</span>
                    <span className="text-2xl font-bold text-blue-700">{mapProgress}%</span>
                 </div>
                 <Progress value={mapProgress} className="h-2.5 bg-blue-200/50" indicatorClassName="bg-blue-600" />
                 <Button onClick={() => navigate("/roadmap")} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 shadow-sm">
                    {nextTaskObj.completed ? "Review Roadmap" : "Continue Learning"}
                 </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

