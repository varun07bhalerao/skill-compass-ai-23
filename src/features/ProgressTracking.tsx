import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/i18n";
import { courseRecommendations } from "@/lib/seed-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { TrendingUp, BookOpen, Award, CheckCircle2, Star } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { topSkillsData } from "@/pages/Courses";

const ProgressTracking = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [missingSkills, setMissingSkills] = useState<string[]>([]);
  const [readinessScore, setReadinessScore] = useState<number>(0);
  const [targetRole, setTargetRole] = useState<string>("");

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
          
          const goalMap: Record<string, string> = {
            frontend: "Frontend Developer",
            backend: "Backend Developer",
            fullstack: "Full Stack Developer",
            data: "Data Analyst",
            uiux: "UI/UX Designer",
            cybersecurity: "Cybersecurity Analyst",
            sap: "SAP Consultant",
          };
          cGoal = goalMap[cGoal] || cGoal;
          setTargetRole(cGoal);
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
            const lowerUserSkills = pSkills.map(s => s.toLowerCase().trim());
            const requiredSkills = roleMatch.requiredSkills || [];
            const matched = requiredSkills.filter(req => lowerUserSkills.includes(req.toLowerCase().trim()));
            if (requiredSkills.length > 0) {
              setReadinessScore(Math.round((matched.length / requiredSkills.length) * 100));
            }
          }
        }
      } catch (err) {
        console.error("Error fetching progress data:", err);
      }
    };
    fetchData();
  }, [user]);

  const numMissingSkills = missingSkills.length;
  const numCompletedCourses = missingSkills.filter(skill => 
    user?.completedCourses?.some(id => id.startsWith(`skill-free-${skill}-`) || id.startsWith(`skill-paid-${skill}-`))
  ).length;
  const coursePct = numMissingSkills > 0 ? Math.round((numCompletedCourses / numMissingSkills) * 100) : 0;
  
  // Resolve actual course details for UI list
  const getResolvedCourses = () => {
    if (!user?.completedCourses || missingSkills.length === 0) return [];
    
    const resolved: { id: string, title: string, provider: string, skill: string }[] = [];
    
    missingSkills.forEach(skill => {
      const skillData = topSkillsData[skill];
      if (!skillData) return;
      
      skillData.freeCourses.forEach((c, idx) => {
        const id = `skill-free-${skill}-${idx}`;
        if (user.completedCourses.includes(id)) {
          resolved.push({ id, title: c.name, provider: c.platform, skill });
        }
      });
      
      skillData.paidCourses.forEach((c, idx) => {
        const id = `skill-paid-${skill}-${idx}`;
        if (user.completedCourses.includes(id)) {
          resolved.push({ id, title: c.name, provider: c.platform, skill });
        }
      });
    });
    
    return resolved;
  };
  
  const completedCoursesList = getResolvedCourses();

  const totalMilestones = user?.roadmap?.milestones.length || 0;
  const numCompletedMilestones = user?.roadmap?.milestones.filter(m => m.completed).length || 0;
  const milestonePct = totalMilestones > 0 ? Math.round((numCompletedMilestones / totalMilestones) * 100) : 0;

  const totalWeeks = totalMilestones > 0 ? totalMilestones : 5;
  const currentWeek = Math.max(1, numCompletedMilestones);
  
  const progressData = Array.from({ length: totalWeeks }).map((_, idx) => {
    const weekNum = idx + 1;
    let rScore = null;
    let cPct = null;
    let mPct = null;

    if (weekNum <= currentWeek) {
      const ratio = weekNum / currentWeek;
      const startScore = readinessScore > 0 ? Math.max(20, readinessScore * 0.4) : 0;
      rScore = Math.round(startScore + (readinessScore - startScore) * ratio);
      cPct = Math.round(coursePct * ratio);
      mPct = Math.round(milestonePct * ratio);
    }

    return {
      week: `Week ${weekNum}`,
      Readiness: rScore,
      Courses: cPct,
      Milestones: mPct
    };
  });

  const achievements = [
    { id: "first-upload", icon: "📄", title: "First Upload", desc: "Uploaded your first resume", condition: (u: any) => !!u?.resume },
    { id: "skill-scan", icon: "🔍", title: "Skill Scanner", desc: "Analyzed 5+ skills", condition: (u: any) => (u?.resume?.skills?.length || 0) >= 5 },
    { id: "first-course", icon: "📚", title: "Learner", desc: "Completed your first course", condition: (u: any) => (u?.completedCourses?.length || 0) >= 1 },
    { id: "five-courses", icon: "🎓", title: "Scholar", desc: "Completed 5 courses", condition: (u: any) => (u?.completedCourses?.length || 0) >= 5 },
    { id: "milestone", icon: "🏆", title: "Milestone Master", desc: "Completed a roadmap milestone", condition: (u: any) => (u?.completedMilestones?.length || 0) >= 1 },
    { id: "job-ready", icon: "💼", title: "Job Ready", desc: "Reached Job-Ready score", condition: (u: any) => readinessScore >= 70 },
  ];

  return (
    <div className="container py-8">
      <h1 className="mb-8 font-display text-3xl font-bold">{t("progress.title")}</h1>

      {/* Summary Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-md animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-medium">Courses</span>
            </div>
            <p className="font-display text-3xl font-bold">{numCompletedCourses}/{numMissingSkills}</p>
            <Progress value={coursePct} className="mt-2 h-2" />
            <p className="mt-1 text-xs text-muted-foreground">{coursePct}% {t("progress.completed")}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md animate-fade-in" style={{ animationDelay: "100ms" }}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Award className="h-5 w-5 text-accent" />
              <span className="font-medium">Milestones</span>
            </div>
            <p className="font-display text-3xl font-bold">
              {numCompletedMilestones}/{totalMilestones}
            </p>
            <Progress value={milestonePct} className="mt-2 h-2" />
            <p className="mt-1 text-xs text-muted-foreground">{milestonePct}% {t("progress.completed")}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md animate-fade-in" style={{ animationDelay: "200ms" }}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Star className="h-5 w-5 text-warning" />
              <span className="font-medium">Readiness Score</span>
            </div>
            <p className="font-display text-3xl font-bold">{readinessScore}/100</p>
            <Progress value={readinessScore} className="mt-2 h-2" />
            {targetRole && <Badge variant="secondary" className="mt-2 text-xs">{targetRole}</Badge>}
          </CardContent>
        </Card>
      </div>

      {/* Progress Chart */}
      <Card className="mb-8 border-0 shadow-md animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <TrendingUp className="h-5 w-5 text-primary" /> Progress Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="Readiness" name="Readiness Score" stroke="#3b82f6" strokeWidth={2} dot={{ stroke: '#3b82f6', strokeWidth: 2, fill: 'white', r: 4 }} activeDot={{ r: 6 }} connectNulls={false} />
                <Line type="monotone" dataKey="Courses" name="Courses Completed" stroke="#10b981" strokeWidth={2} dot={{ stroke: '#10b981', strokeWidth: 2, fill: 'white', r: 4 }} activeDot={{ r: 6 }} connectNulls={false} />
                <Line type="monotone" dataKey="Milestones" name="Milestones Completed" stroke="#8b5cf6" strokeWidth={2} dot={{ stroke: '#8b5cf6', strokeWidth: 2, fill: 'white', r: 4 }} activeDot={{ r: 6 }} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Completed courses list */}
      {completedCoursesList.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 font-display text-xl font-bold">Completed Courses</h2>
          <div className="space-y-3">
            {completedCoursesList.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-900/50 px-4 py-3">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{c.title}</p>
                  <p className="text-xs text-slate-500">{c.provider} • {c.skill}</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracking;
