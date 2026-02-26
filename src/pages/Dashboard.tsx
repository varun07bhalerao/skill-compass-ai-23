import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/i18n";
import { demoActivity, courseRecommendations } from "@/lib/seed-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, LineChart, Line, CartesianGrid } from "recharts";
import { Target, BookOpen, Briefcase, Clock, FileText, Award, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (!user?.resume) {
    return (
      <div className="container py-16 text-center">
        <div className="mx-auto max-w-md animate-fade-in">
          <FileText className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
          <h2 className="mb-2 font-display text-2xl font-bold">{t("dashboard.title")}</h2>
          <p className="mb-6 text-muted-foreground">Upload your resume to see your personalized dashboard.</p>
          <Button onClick={() => navigate("/resume")}>{t("resume.upload")}</Button>
        </div>
      </div>
    );
  }

  const readiness = user.readinessScore || { score: 0, band: "Beginner" as const, breakdown: { skillCoverage: 0, experienceLevel: 0, educationMatch: 0 } };
  const gaugeData = [{ name: "Score", value: readiness.score, fill: readiness.score >= 70 ? "hsl(160,50%,45%)" : readiness.score >= 40 ? "hsl(38,92%,50%)" : "hsl(0,72%,51%)" }];

  const trendingSkills = [
    { skill: "React", demand: 92 },
    { skill: "Python", demand: 88 },
    { skill: "TypeScript", demand: 85 },
    { skill: "SQL", demand: 82 },
    { skill: "AWS", demand: 78 },
    { skill: "Docker", demand: 75 },
  ];

  const progressData = [
    { week: "W1", score: 35 },
    { week: "W2", score: 42 },
    { week: "W3", score: 48 },
    { week: "W4", score: 55 },
    { week: "W5", score: 62 },
  ];

  const statsCards = [
    { icon: Briefcase, label: t("dashboard.matchedRoles"), value: user.roleMatches?.length || 0, color: "text-primary" },
    { icon: Target, label: t("dashboard.skillsAnalyzed"), value: user.resume.skills.length, color: "text-secondary" },
    { icon: BookOpen, label: t("dashboard.coursesRecommended"), value: courseRecommendations.length, color: "text-accent" },
  ];

  const iconMap: Record<string, React.ElementType> = { upload: FileText, course: BookOpen, milestone: Award, analysis: Target };

  return (
    <div className="container py-8">
      <h1 className="mb-8 font-display text-3xl font-bold">{t("dashboard.title")}</h1>

      {/* Quick Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {statsCards.map((stat, i) => (
          <Card key={i} className="animate-fade-in border-0 shadow-md" style={{ animationDelay: `${i * 100}ms` }}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-muted ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="font-display text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Readiness Gauge */}
        <Card className="border-0 shadow-md animate-fade-in" style={{ animationDelay: "100ms" }}>
          <CardHeader>
            <CardTitle className="font-display text-lg">{t("dashboard.readiness")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-48 w-48">
              <ResponsiveContainer>
                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" startAngle={180} endAngle={0} data={gaugeData}>
                  <RadialBar background dataKey="value" cornerRadius={10} max={100} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="-mt-16 text-center">
              <p className="font-display text-4xl font-bold">{readiness.score}</p>
              <Badge variant={readiness.score >= 70 ? "default" : "secondary"} className="mt-1">
                {readiness.band === "Beginner" ? t("skills.beginner") : readiness.band === "Intermediate" ? t("skills.intermediate") : t("skills.jobReady")}
              </Badge>
            </div>
            <div className="mt-6 w-full space-y-3">
              <div>
                <div className="mb-1 flex justify-between text-xs"><span>Skill Coverage</span><span>{readiness.breakdown.skillCoverage}%</span></div>
                <Progress value={readiness.breakdown.skillCoverage} className="h-2" />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs"><span>Experience</span><span>{readiness.breakdown.experienceLevel}%</span></div>
                <Progress value={readiness.breakdown.experienceLevel} className="h-2" />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs"><span>Education</span><span>{readiness.breakdown.educationMatch}%</span></div>
                <Progress value={readiness.breakdown.educationMatch} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="border-0 shadow-md animate-fade-in" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <CardTitle className="font-display text-lg">{t("dashboard.skills")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.resume.skills.slice(0, 8).map((s) => (
              <div key={s.skill}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{s.skill}</span>
                  <span className="text-muted-foreground">{s.proficiency}%</span>
                </div>
                <Progress value={s.proficiency} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Trending Skills */}
        <Card className="border-0 shadow-md animate-fade-in" style={{ animationDelay: "300ms" }}>
          <CardHeader>
            <CardTitle className="font-display text-lg">{t("dashboard.trending")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={trendingSkills} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis type="category" dataKey="skill" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="demand" fill="hsl(215, 85%, 45%)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Progress Over Time */}
        <Card className="border-0 shadow-md animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Progress Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="hsl(215, 85%, 45%)" strokeWidth={2} dot={{ fill: "hsl(215, 85%, 45%)" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-md animate-fade-in">
          <CardHeader>
            <CardTitle className="font-display text-lg">{t("dashboard.recentActivity")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {demoActivity.map((activity) => {
                const Icon = iconMap[activity.type] || Clock;
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
