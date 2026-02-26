import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Map, BookOpen, Code, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Roadmap } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const LearningRoadmap = () => {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);

  const roadmap = user?.roadmap;

  const generateRoadmap = async () => {
    if (!user?.resume) {
      toast.error("Please upload your resume first.");
      navigate("/resume");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-roadmap", {
        body: {
          skills: user.resume.skills,
          missingSkills: user.missingSkills || [],
          targetRole: user.roleMatches?.[0]?.role || "Frontend Developer",
        },
      });

      if (error) throw error;
      updateUser({ roadmap: data as Roadmap });
      toast.success("Roadmap generated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate roadmap.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleMilestone = (milestoneId: string) => {
    if (!roadmap) return;
    const updated = {
      ...roadmap,
      milestones: roadmap.milestones.map((m) =>
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      ),
    };
    const completedIds = updated.milestones.filter((m) => m.completed).map((m) => m.id);
    updateUser({ roadmap: updated, completedMilestones: completedIds });
  };

  if (!user?.resume) {
    return (
      <div className="container py-16 text-center">
        <Map className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
        <h2 className="mb-2 font-display text-2xl font-bold">{t("roadmap.title")}</h2>
        <p className="mb-6 text-muted-foreground">Upload your resume first.</p>
        <Button onClick={() => navigate("/resume")}>Upload Resume</Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">{t("roadmap.title")}</h1>
        <Button onClick={generateRoadmap} disabled={isGenerating}>
          {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Map className="mr-2 h-4 w-4" />}
          {t("roadmap.generate")}
        </Button>
      </div>

      {!roadmap ? (
        <Card className="border-0 shadow-md">
          <CardContent className="flex flex-col items-center py-16">
            <Map className="mb-4 h-16 w-16 text-muted-foreground/30" />
            <p className="text-muted-foreground">Click "Generate Roadmap" to create your personalized learning plan.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm">{roadmap.totalWeeks} weeks</Badge>
            <Badge variant="outline" className="text-sm">
              {roadmap.milestones.filter((m) => m.completed).length}/{roadmap.milestones.length} milestones
            </Badge>
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
            {roadmap.milestones.map((milestone, i) => (
              <div key={milestone.id} className="relative mb-8 ml-12 animate-fade-in" style={{ animationDelay: `${i * 150}ms` }}>
                <div className={`absolute -left-[2.05rem] flex h-5 w-5 items-center justify-center rounded-full ${
                  milestone.completed ? "bg-secondary" : "bg-muted border-2 border-primary"
                }`}>
                  {milestone.completed && <CheckCircle2 className="h-3 w-3 text-secondary-foreground" />}
                </div>
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Checkbox
                          checked={milestone.completed}
                          onCheckedChange={() => toggleMilestone(milestone.id)}
                        />
                        {milestone.title}
                      </CardTitle>
                      <Badge variant="secondary">
                        {t("roadmap.week")} {milestone.weekStart}-{milestone.weekEnd}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-3 text-sm text-muted-foreground">{milestone.description}</p>
                    <div className="space-y-1">
                      {milestone.tasks.map((task, j) => (
                        <p key={j} className="text-sm">• {task}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Projects */}
          {roadmap.projects.length > 0 && (
            <>
              <h2 className="font-display text-xl font-bold">{t("roadmap.projects")}</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {roadmap.projects.map((project, i) => (
                  <Card key={i} className="border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="mb-2 flex items-center gap-2">
                        <Code className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">{project.title}</h3>
                      </div>
                      <p className="mb-3 text-sm text-muted-foreground">{project.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {project.skills.map((s) => (
                          <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                      <Badge className="mt-2" variant="secondary">{project.difficulty}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Courses */}
          {roadmap.courses.length > 0 && (
            <>
              <h2 className="flex items-center gap-2 font-display text-xl font-bold">
                <BookOpen className="h-5 w-5" /> Recommended Courses
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                {roadmap.courses.map((course) => (
                  <Card key={course.id} className="border-0 shadow-md">
                    <CardContent className="p-6">
                      <Badge variant="outline" className="mb-2 text-xs">{course.skill}</Badge>
                      <h3 className="mb-1 font-semibold">{course.title}</h3>
                      <p className="mb-3 text-xs text-muted-foreground">{course.provider} • {course.duration}</p>
                      <a href={course.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                        View Course →
                      </a>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default LearningRoadmap;
