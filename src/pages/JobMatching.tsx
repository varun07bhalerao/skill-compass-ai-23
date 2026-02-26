import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/i18n";
import { jobDescriptions } from "@/lib/seed-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Briefcase, MapPin, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const JobMatching = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [roleFilter, setRoleFilter] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!user?.resume) {
    return (
      <div className="container py-16 text-center">
        <Briefcase className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
        <h2 className="mb-2 font-display text-2xl font-bold">{t("jobs.title")}</h2>
        <p className="mb-6 text-muted-foreground">Upload your resume to see job matches.</p>
        <Button onClick={() => navigate("/resume")}>Upload Resume</Button>
      </div>
    );
  }

  const userSkills = user.resume.skills.map((s) => s.skill);
  const roles = ["All", "Data Analyst", "Frontend Developer", "QA Engineer"];
  const filtered = roleFilter === "All" ? jobDescriptions : jobDescriptions.filter((j) => j.role === roleFilter);

  const getMatchPct = (job: typeof jobDescriptions[0]) => {
    const matched = job.requiredSkills.filter((s) => userSkills.includes(s));
    return Math.round((matched.length / job.requiredSkills.length) * 100);
  };

  const sorted = [...filtered].sort((a, b) => getMatchPct(b) - getMatchPct(a));

  return (
    <div className="container py-8">
      <h1 className="mb-8 font-display text-3xl font-bold">{t("jobs.title")}</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {roles.map((role) => (
          <Button key={role} variant={roleFilter === role ? "default" : "outline"} size="sm" onClick={() => setRoleFilter(role)} className="rounded-full">
            {role === "All" ? t("common.all") : role}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {sorted.slice(0, 15).map((job, i) => {
          const matchPct = getMatchPct(job);
          const matched = job.requiredSkills.filter((s) => userSkills.includes(s));
          const missing = job.requiredSkills.filter((s) => !userSkills.includes(s));
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
                  <Badge variant={matchPct >= 70 ? "default" : matchPct >= 40 ? "secondary" : "outline"} className="text-sm">
                    {matchPct}% {t("jobs.matchPercentage")}
                  </Badge>
                </div>
                <Progress value={matchPct} className="mt-3 h-1.5" />

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
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default JobMatching;
