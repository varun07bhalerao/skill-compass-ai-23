import { useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle2, Loader2, User, Mail, Briefcase, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { ParsedResume } from "@/lib/types";
import { normalizeSkill, roleRequirements } from "@/lib/seed-data";
import { supabase } from "@/integrations/supabase/client";

const ResumeUpload = () => {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fileName, setFileName] = useState("");

  const processFile = useCallback(async (file: File) => {
    if (!file.name.match(/\.(pdf|docx)$/i)) {
      toast.error("Please upload a PDF or DOCX file");
      return;
    }

    setFileName(file.name);
    setIsAnalyzing(true);

    try {
      // Read file as text (simplified — in production would use proper parsers)
      const text = await file.text();

      const { data, error } = await supabase.functions.invoke("parse-resume", {
        body: { resumeText: text, fileName: file.name },
      });

      if (error) throw error;

      const parsed: ParsedResume = data;
      // Normalize skills
      parsed.skills = parsed.skills.map((s) => ({
        ...s,
        skill: normalizeSkill(s.skill),
      }));

      // Compute role matches and readiness
      const roleMatches = Object.entries(roleRequirements).map(([role, reqs]) => {
        const userSkillNames = parsed.skills.map((s) => s.skill);
        const matched = reqs.required.filter((r) => userSkillNames.includes(r));
        const allRequired = [...reqs.required, ...reqs.preferred];
        const allMatched = allRequired.filter((r) => userSkillNames.includes(r));
        const matchPct = Math.round((allMatched.length / allRequired.length) * 100);
        return {
          role,
          matchPercentage: matchPct,
          requiredSkills: reqs.required,
          matchedSkills: matched,
          missingSkills: reqs.required.filter((r) => !userSkillNames.includes(r)),
        };
      }).sort((a, b) => b.matchPercentage - a.matchPercentage);

      const topMatch = roleMatches[0];
      const avgProf = parsed.skills.reduce((sum, s) => sum + s.proficiency, 0) / parsed.skills.length;
      const score = Math.round(topMatch.matchPercentage * 0.5 + avgProf * 0.3 + (parsed.experience.length > 0 ? 20 : 5));
      const band = score >= 70 ? "Job-Ready" as const : score >= 40 ? "Intermediate" as const : "Beginner" as const;

      const missingSkills = roleMatches.flatMap((rm) =>
        rm.missingSkills.map((skill) => ({
          skill,
          importance: (roleRequirements[rm.role]?.required.includes(skill) ? "high" : "medium") as "high" | "medium",
          forRoles: [rm.role],
        }))
      ).filter((s, i, arr) => arr.findIndex((x) => x.skill === s.skill) === i).slice(0, 5);

      updateUser({
        resume: parsed,
        roleMatches,
        readinessScore: {
          score,
          band,
          breakdown: {
            skillCoverage: topMatch.matchPercentage,
            experienceLevel: parsed.experience.length > 0 ? 60 : 30,
            educationMatch: parsed.education.length > 0 ? 75 : 40,
          },
        },
        missingSkills,
      });

      toast.success("Resume analyzed successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to analyze resume. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [updateUser]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const resume = user?.resume;

  return (
    <div className="container py-8">
      <h1 className="mb-8 font-display text-3xl font-bold">{t("resume.title")}</h1>

      {/* Upload Area */}
      <Card className="mb-8 border-0 shadow-md">
        <CardContent className="p-8">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors ${
              isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
          >
            {isAnalyzing ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="font-medium">{t("resume.analyzing")}</p>
                <p className="text-sm text-muted-foreground">{fileName}</p>
              </div>
            ) : (
              <>
                <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-2 text-lg font-medium">{t("resume.dragDrop")}</p>
                <p className="mb-4 text-sm text-muted-foreground">{t("resume.formats")}</p>
                <label>
                  <Button asChild variant="outline" className="cursor-pointer">
                    <span>
                      <FileText className="mr-2 h-4 w-4" />
                      Browse Files
                    </span>
                  </Button>
                  <input type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileInput} />
                </label>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {resume && (
        <div className="space-y-6 animate-fade-in">
          <h2 className="font-display text-2xl font-bold">{t("resume.results")}</h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Personal Info */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-primary" /> Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{resume.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{resume.email}</span>
                </div>
              </CardContent>
            </Card>

            {/* Education */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <GraduationCap className="h-5 w-5 text-primary" /> {t("resume.education")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {resume.education.map((edu, i) => (
                  <div key={i}>
                    <p className="font-medium">{edu.degree}</p>
                    <p className="text-sm text-muted-foreground">{edu.institution} • {edu.year}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Skills */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">{t("resume.parsedSkills")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {resume.skills.map((s) => (
                  <div key={s.skill}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{s.skill}</span>
                      <span className="text-muted-foreground">{s.proficiency}%</span>
                    </div>
                    <Progress value={s.proficiency} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Briefcase className="h-5 w-5 text-primary" /> {t("resume.experience")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {resume.experience.map((exp, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-muted p-3">
                  <div>
                    <p className="font-medium">{exp.role}</p>
                    <p className="text-sm text-muted-foreground">{exp.company}</p>
                  </div>
                  <Badge variant="secondary">{exp.years} yr{exp.years !== 1 ? "s" : ""}</Badge>
                </div>
              ))}
              {resume.experience.length === 0 && (
                <p className="text-sm text-muted-foreground">No experience listed</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
