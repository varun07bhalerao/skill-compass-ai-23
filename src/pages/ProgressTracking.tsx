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

const achievements = [
  { id: "first-upload", icon: "📄", title: "First Upload", desc: "Uploaded your first resume", condition: (u: any) => !!u?.resume },
  { id: "skill-scan", icon: "🔍", title: "Skill Scanner", desc: "Analyzed 5+ skills", condition: (u: any) => (u?.resume?.skills?.length || 0) >= 5 },
  { id: "first-course", icon: "📚", title: "Learner", desc: "Completed your first course", condition: (u: any) => (u?.completedCourses?.length || 0) >= 1 },
  { id: "five-courses", icon: "🎓", title: "Scholar", desc: "Completed 5 courses", condition: (u: any) => (u?.completedCourses?.length || 0) >= 5 },
  { id: "milestone", icon: "🏆", title: "Milestone Master", desc: "Completed a roadmap milestone", condition: (u: any) => (u?.completedMilestones?.length || 0) >= 1 },
  { id: "job-ready", icon: "💼", title: "Job Ready", desc: "Reached Job-Ready score", condition: (u: any) => (u?.readinessScore?.score || 0) >= 70 },
];

const ProgressTracking = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const completedCourses = courseRecommendations.filter((c) => user?.completedCourses.includes(c.id));
  const totalCourses = courseRecommendations.length;
  const coursePct = Math.round((completedCourses.length / totalCourses) * 100);
  const milestonePct = user?.roadmap
    ? Math.round((user.roadmap.milestones.filter((m) => m.completed).length / user.roadmap.milestones.length) * 100)
    : 0;

  const progressData = [
    { week: "Week 1", courses: 0, score: 35 },
    { week: "Week 2", courses: 1, score: 42 },
    { week: "Week 3", courses: 1, score: 48 },
    { week: "Week 4", courses: 2, score: 55 },
    { week: "Week 5", courses: 2, score: 62 },
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
            <p className="font-display text-3xl font-bold">{completedCourses.length}/{totalCourses}</p>
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
              {user?.completedMilestones.length || 0}/{user?.roadmap?.milestones.length || 0}
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
            <p className="font-display text-3xl font-bold">{user?.readinessScore?.score || 0}/100</p>
            <Progress value={user?.readinessScore?.score || 0} className="mt-2 h-2" />
            <Badge variant="secondary" className="mt-2">{user?.readinessScore?.band || "—"}</Badge>
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
                <Line type="monotone" dataKey="score" name="Readiness" stroke="hsl(215, 85%, 45%)" strokeWidth={2} />
                <Line type="monotone" dataKey="courses" name="Courses" stroke="hsl(160, 50%, 45%)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <h2 className="mb-4 font-display text-xl font-bold">{t("progress.achievements")}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((ach, i) => {
          const unlocked = ach.condition(user);
          return (
            <Card
              key={ach.id}
              className={`border-0 shadow-md transition-all animate-fade-in ${unlocked ? "ring-2 ring-secondary" : "opacity-60"}`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <span className="text-3xl">{ach.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{ach.title}</p>
                    {unlocked && <CheckCircle2 className="h-4 w-4 text-secondary" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{ach.desc}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Completed courses list */}
      {completedCourses.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 font-display text-xl font-bold">Completed Courses</h2>
          <div className="space-y-2">
            {completedCourses.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg bg-muted p-3">
                <div>
                  <p className="font-medium">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.provider} • {c.skill}</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-secondary" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracking;
