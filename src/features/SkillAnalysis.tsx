import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Target, AlertTriangle, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";

interface JobRole {
  id: string;
  roleName: string;
  requiredSkills: string[];
}

interface ProcessedMatch {
  roleName: string;
  matchedSkills: string[];
  missingSkills: string[];
  readinessScore: number;
  level: string;
}

const SkillAnalysis = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [parsedSkills, setParsedSkills] = useState<string[]>([]);
  const [matchedRoles, setMatchedRoles] = useState<ProcessedMatch[]>([]);
  const [targetRoleMatch, setTargetRoleMatch] = useState<ProcessedMatch | null>(null);

  useEffect(() => {
    const fetchAnalysisData = async () => {
      if (!user?.email) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // 1. Fetch User Data
        // The user profile might be in 'users' or 'userProfiles' collection.
        // Based on previous files, it's saved in 'userProfiles'.
        const userDocRef = doc(db, "userProfiles", user.email);
        const userDocSnap = await getDoc(userDocRef);

        let userSkills: string[] = [];
        let careerGoal = "";

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          userSkills = data.parsedSkills || [];
          careerGoal = data.careerGoal || "";
        }

        setParsedSkills(userSkills);

        if (userSkills.length === 0) {
          setIsLoading(false);
          return;
        }

        // 2. Fetch Job Roles
        const rolesCol = collection(db, "jobRoles");
        const rolesSnap = await getDocs(rolesCol);

        const allRoles: JobRole[] = rolesSnap.docs.map(d => ({
          id: d.id,
          roleName: d.data().roleName || d.id,
          requiredSkills: d.data().requiredSkills || []
        }));

        // If jobRoles is empty, maybe create seed data
        if (allRoles.length === 0) {
          console.warn("jobRoles collection is empty. You need to populate it in Firebase.");
          // Create some sample ones just so the page works if they haven't seeded yet.
          const seedRoles = [
            { id: "data_scientist", roleName: "Data Scientist", requiredSkills: ["Python", "Pandas", "NumPy", "Machine Learning", "SQL", "Statistics", "Data Visualization"] },
            { id: "frontend_developer", roleName: "Frontend Developer", requiredSkills: ["HTML", "CSS", "JavaScript", "React", "Git"] },
            { id: "backend_developer", roleName: "Backend Developer", requiredSkills: ["Node.js", "Python", "Java", "SQL", "MongoDB", "Express", "REST API", "Git"] },
            { id: "qa_engineer", roleName: "QA Engineer", requiredSkills: ["Testing", "Selenium", "JIRA", "Automation", "Agile", "SQL", "Python"] },
            { id: "data_analyst", roleName: "Data Analyst", requiredSkills: ["SQL", "Excel", "Data Visualization", "Python", "Statistics", "Power BI", "Tableau"] }
          ];

          for (const role of seedRoles) {
            await setDoc(doc(db, "jobRoles", role.id), {
              roleName: role.roleName,
              requiredSkills: role.requiredSkills
            });
            allRoles.push(role);
          }
        }

        // 3. Match Logic
        const processed: ProcessedMatch[] = [];

        const lowerUserSkills = userSkills.map(s => s.toLowerCase().trim());

        for (const role of allRoles) {
          const matched: string[] = [];
          const missing: string[] = [];

          const requiredSkills = role.requiredSkills || [];

          for (const required of requiredSkills) {
            const isMatch = lowerUserSkills.includes(required.toLowerCase().trim());
            if (isMatch) {
              matched.push(required);
            } else {
              missing.push(required);
            }
          }

          // Rule: Only consider roles where min 2 skills match
          if (matched.length >= 2 || requiredSkills.length === 0) {
            let score = 0;
            if (requiredSkills.length > 0) {
              score = Math.round((matched.length / requiredSkills.length) * 100);
            }

            let level = "Beginner";
            if (score >= 70) level = "Job Ready";
            else if (score >= 40) level = "Intermediate";

            processed.push({
              roleName: role.roleName,
              matchedSkills: matched,
              missingSkills: missing,
              readinessScore: score,
              level,
            });
          }
        }

        // 4. Sort and Top 3
        processed.sort((a, b) => b.readinessScore - a.readinessScore);
        const top3 = processed.slice(0, 3);
        setMatchedRoles(top3);

        // Calculate Target Role Match (For readiness score circle)
        // Set it to the highest match, or the one matching user's careerGoal if available
        if (top3.length > 0) {
          let primaryMatch = top3[0];
          if (careerGoal) {
            // Try to find the mapped career goal in matched roles
            const careerMatch = processed.find(p => p.roleName.toLowerCase().includes(careerGoal.toLowerCase()));
            if (careerMatch) primaryMatch = careerMatch;
          }
          setTargetRoleMatch(primaryMatch);
        } else {
           setTargetRoleMatch(null);
        }

        // 5. Update user profile with all missing skills (without role names)
        if (userDocSnap.exists()) {
          const allMissingSkillsSet = new Set<string>();
          for (const role of top3) {
            for (const skill of role.missingSkills) {
              allMissingSkillsSet.add(skill);
            }
          }
          const allMissingSkillsArray = Array.from(allMissingSkillsSet);
          
          try {
            await updateDoc(userDocRef, {
              missingSkills: allMissingSkillsArray
            });
          } catch (updateErr) {
            console.error("Error updating missing skills:", updateErr);
          }
        }

      } catch (error) {
        console.error("Error fetching analysis data:", error);
        toast.error("Failed to load skill analysis data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysisData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="container py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-medium">Analyzing your skills...</h2>
      </div>
    );
  }

  if (parsedSkills.length === 0) {
    return (
      <div className="container py-16 text-center">
        <Target className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
        <h2 className="mb-2 font-display text-2xl font-bold">{t("skills.title")}</h2>
        <p className="mb-6 text-muted-foreground">Upload your resume first to see skill analysis.</p>
        <Button onClick={() => navigate("/resume")}>Upload Resume</Button>
      </div>
    );
  }

  if (matchedRoles.length === 0) {
    return (
      <div className="container py-16 text-center">
        <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
        <h2 className="mb-2 font-display text-2xl font-bold">No Matches Found</h2>
        <p className="mb-6 text-muted-foreground">
          We couldn't find any job roles where you have at least 2 matching skills.
          Try updating your profile or acquiring more skills.
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => navigate("/resume")}>Update Profile</Button>
          <Button onClick={() => navigate("/courses")}>Explore Courses</Button>
        </div>
      </div>
    );
  }

  // Derive top 5 missing skills from top matched roles
  const topMissingSkills: { skill: string; roleName: string }[] = [];
  const seenSkills = new Set<string>();

  for (const role of matchedRoles) {
    for (const skill of role.missingSkills) {
      if (!seenSkills.has(skill)) {
        seenSkills.add(skill);
        topMissingSkills.push({ skill, roleName: role.roleName });
        if (topMissingSkills.length === 5) break;
      }
    }
    if (topMissingSkills.length === 5) break;
  }

  const colors = ["#1d4ed8", "#10b981", "#8b5cf6"]; // Blue, Green, Purple

  return (
    <div className="container py-8 bg-slate-50/50 min-h-screen">
      <h1 className="mb-8 font-display text-3xl font-bold text-slate-900">{t("skills.title")}</h1>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* Overall Readiness Score Card */}
        {targetRoleMatch && (
          <Card className="border shadow-sm bg-white animate-fade-in flex flex-col items-center justify-center p-6">
            <CardHeader className="w-full text-left p-0 mb-6">
              <CardTitle className="font-display text-lg font-semibold text-slate-800">
                Readiness Score
              </CardTitle>
            </CardHeader>
            <CardContent className="w-full text-center flex flex-col items-center justify-center flex-1 p-0">
              {/* Circular Progress Design */}
              <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-[6px] border-blue-600 mb-6 shadow-sm">
                <div className="flex flex-col items-center">
                  <span className="font-display text-5xl font-bold text-slate-900 leading-none mb-1">
                    {targetRoleMatch.readinessScore}
                  </span>
                  <span className="text-sm font-medium text-slate-400">/100</span>
                </div>
              </div>
              <Badge
                className={`text-sm px-4 py-1.5 rounded-full font-medium shadow-sm 
                        ${targetRoleMatch.level === 'Job Ready' ? 'bg-emerald-500 hover:bg-emerald-600' :
                    targetRoleMatch.level === 'Intermediate' ? 'bg-teal-500 hover:bg-teal-600' :
                      'bg-amber-500 hover:bg-amber-600'}`}
              >
                {targetRoleMatch.level}
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Role Matching Chart Card */}
        <Card className="lg:col-span-2 border shadow-sm bg-white animate-fade-in p-6">
          <CardHeader className="w-full text-left p-0 mb-6">
            <CardTitle className="font-display text-lg font-semibold text-slate-800">Role Matching</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={matchedRoles} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                  <XAxis
                    dataKey="roleName"
                    tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    ticks={[0, 25, 50, 75, 100]}
                  />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="readinessScore" radius={[8, 8, 0, 0]} maxBarSize={120}>
                    {matchedRoles.map((_, i) => (
                      <Cell key={i} fill={colors[i % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Detail Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {matchedRoles.map((role, index) => (
          <Card key={role.roleName} className="border shadow-sm bg-white animate-fade-in h-full flex flex-col">
            <CardHeader className="pb-3 border-b border-slate-50">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-lg font-semibold text-slate-900">
                  {role.roleName}
                </CardTitle>
                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white rounded font-bold px-2.5">
                  {role.readinessScore}%
                </Badge>
              </div>
              <Progress
                value={role.readinessScore}
                className="h-2 bg-slate-100"
                indicatorClassName={index === 0 ? "bg-blue-600" : "bg-emerald-500"}
              />
            </CardHeader>
            <CardContent className="pt-4 flex-1">
              <div className="mb-5 gap-2">
                <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Matched</h4>
                <div className="flex flex-wrap gap-1.5">
                  {role.matchedSkills.length > 0 ? role.matchedSkills.map(skill => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="bg-white border-slate-200 text-slate-700 font-medium py-1 px-2 text-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" /> {skill}
                    </Badge>
                  )) : (
                    <span className="text-sm text-slate-400">None</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Missing</h4>
                <div className="flex flex-wrap gap-1.5">
                  {role.missingSkills.length > 0 ? role.missingSkills.map(skill => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="bg-red-50/50 border-red-100 text-red-600 font-medium py-1 px-2 text-xs flex items-center gap-1.5"
                    >
                      <AlertTriangle className="h-3 w-3 text-red-500" /> {skill}
                    </Badge>
                  )) : (
                    <span className="text-sm text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 font-medium">None! You are fully qualified.</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top 5 Priority Missing Skills */}
      {topMissingSkills.length > 0 && (
        <Card className="mt-8 border-none shadow-none bg-transparent">
          <CardHeader className="px-0 pt-0 pb-4">
            <CardTitle className="font-display text-xl font-bold text-slate-900">
              Missing Skills — Top 5 Priority
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0 flex flex-col gap-3">
            {topMissingSkills.map((item, index) => (
              <div
                key={item.skill}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-100/80 border border-slate-200/60 hover:bg-slate-200/80 transition-colors group cursor-default"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-sm shadow-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-base">{item.skill}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">For: {item.roleName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className="bg-[#e11d48] hover:bg-[#be123c] text-white rounded-full px-4 py-0 text-[11px] font-bold shadow-sm tracking-wide lowercase">
                    high
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-slate-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SkillAnalysis;
