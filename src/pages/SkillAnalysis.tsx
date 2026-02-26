import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Target, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const SkillAnalysis = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (!user?.resume) {
    return (
      <div className="container py-16 text-center">
        <Target className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
        <h2 className="mb-2 font-display text-2xl font-bold">{t("skills.title")}</h2>
        <p className="mb-6 text-muted-foreground">Upload your resume first to see skill analysis.</p>
        <Button onClick={() => navigate("/resume")}>Upload Resume</Button>
      </div>
    );
  }

  const roleMatches = user.roleMatches || [];
  const missingSkills = user.missingSkills || [];
  const readiness = user.readinessScore;
  const colors = ["hsl(215, 85%, 45%)", "hsl(160, 50%, 45%)", "hsl(270, 60%, 55%)"];

  return (
    <div className="container py-8">
      <h1 className="mb-8 font-display text-3xl font-bold">{t("skills.title")}</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Readiness Score */}
        {readiness && (
          <Card className="border-0 shadow-md animate-fade-in">
            <CardHeader>
              <CardTitle className="font-display text-lg">{t("skills.readinessScore")}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-full border-4 border-primary">
                <div>
                  <p className="font-display text-4xl font-bold">{readiness.score}</p>
                  <p className="text-xs text-muted-foreground">/100</p>
                </div>
              </div>
              <Badge
                className="text-sm"
                variant={readiness.score >= 70 ? "default" : "secondary"}
              >
                {readiness.band === "Beginner" ? t("skills.beginner") : readiness.band === "Intermediate" ? t("skills.intermediate") : t("skills.jobReady")}
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Role Matching Chart */}
        <Card className="lg:col-span-2 border-0 shadow-md animate-fade-in">
          <CardHeader>
            <CardTitle className="font-display text-lg">{t("skills.roleMatching")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={roleMatches}>
                  <XAxis dataKey="role" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="matchPercentage" radius={[6, 6, 0, 0]}>
                    {roleMatches.map((_, i) => (
                      <Cell key={i} fill={colors[i % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Details */}
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {roleMatches.map((rm, i) => (
          <Card key={rm.role} className="border-0 shadow-md animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                {rm.role}
                <Badge variant={rm.matchPercentage >= 70 ? "default" : "secondary"}>
                  {rm.matchPercentage}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={rm.matchPercentage} className="mb-4 h-2" />
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">MATCHED</p>
                <div className="flex flex-wrap gap-1">
                  {rm.matchedSkills.map((s) => (
                    <Badge key={s} variant="outline" className="gap-1 text-xs">
                      <CheckCircle2 className="h-3 w-3 text-secondary" />{s}
                    </Badge>
                  ))}
                </div>
                <p className="mt-3 text-xs font-medium text-muted-foreground">MISSING</p>
                <div className="flex flex-wrap gap-1">
                  {rm.missingSkills.map((s) => (
                    <Badge key={s} variant="outline" className="gap-1 text-xs text-destructive">
                      <AlertTriangle className="h-3 w-3" />{s}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Missing Skills Priority */}
      {missingSkills.length > 0 && (
        <Card className="mt-6 border-0 shadow-md animate-fade-in">
          <CardHeader>
            <CardTitle className="font-display text-lg">{t("skills.missingSkills")} — Top 5 Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {missingSkills.map((ms, i) => (
                <div key={ms.skill} className="flex items-center justify-between rounded-lg bg-muted p-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                    <div>
                      <p className="font-medium">{ms.skill}</p>
                      <p className="text-xs text-muted-foreground">For: {ms.forRoles.join(", ")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={ms.importance === "high" ? "destructive" : "secondary"} className="text-xs">
                      {ms.importance}
                    </Badge>
                    <Button size="sm" variant="ghost" onClick={() => navigate("/courses")}>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SkillAnalysis;
