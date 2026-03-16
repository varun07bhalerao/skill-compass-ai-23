import { useState, useEffect } from "react";
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
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FeedbackModal } from "./FeedbackModal";

const LearningRoadmap = () => {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [weeks, setWeeks] = useState(8);
  const [targetRole, setTargetRole] = useState<string>("");

  // Feedback Modal State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const roadmap = user?.roadmap;

  // Fetch career goal on mount
  useEffect(() => {
    let isMounted = true;
    const fetchGoal = async () => {
      if (!user?.email) return;
      try {
        const docRef = doc(db, "userProfiles", user.email);
        const docSnap = await getDoc(docRef);
        
        let role = user.roleMatches?.[0]?.role || "Frontend Developer";
        if (docSnap.exists() && docSnap.data().careerGoal) {
          const goalMap: Record<string, string> = {
            frontend: "Frontend Developer",
            backend: "Backend Developer",
            fullstack: "Full Stack Developer",
            data: "Data Analyst",
            uiux: "UI/UX Designer",
            cybersecurity: "Cybersecurity Analyst",
            sap: "SAP Consultant",
          };
          const goal = docSnap.data().careerGoal;
          role = goalMap[goal] || goal;
        }
        if (isMounted) setTargetRole(role);
      } catch (err) {
        console.error("Error fetching career goal:", err);
      }
    };
    fetchGoal();
    return () => { isMounted = false; };
  });

  // Auto-generate roadmap if none exists and we have a target role
  // Need to define generateRoadmap upfront so the useEffect can see it
  const generateRoadmap = async () => {
    if (!targetRole) {
      toast.error("Still loading your career goal, please try again in a moment.");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-roadmap", {
        body: {
          skills: user?.resume?.skills || [],
          missingSkills: user?.missingSkills || [],
          targetRole,
          weeks,
        },
      });

      if (error) throw error;

      // Force the generated roadmap to obey the requested weeks
      let processedRoadmap: Roadmap = data as Roadmap;
      
      const expandedMilestones: any[] = [];
      processedRoadmap.milestones.forEach((m) => {
        if (m.weekStart < m.weekEnd) {
          const duration = m.weekEnd - m.weekStart + 1;
          const tasksPerWeek = Math.ceil((m.tasks?.length || 0) / duration);
          
          for (let w = m.weekStart; w <= m.weekEnd; w++) {
            const partIdx = w - m.weekStart;
            const taskStart = partIdx * tasksPerWeek;
            const taskEnd = taskStart + tasksPerWeek;
            const slicedTasks = m.tasks?.slice(taskStart, taskEnd) || [];
            const weekTasks = slicedTasks.length > 0 ? slicedTasks : (m.tasks || []);
                
            expandedMilestones.push({
              ...m,
              id: `${m.id}-w${w}`,
              title: `${m.title} (Part ${partIdx + 1})`,
              weekStart: w,
              weekEnd: w,
              tasks: weekTasks
            });
          }
        } else {
          expandedMilestones.push({
            ...m,
            weekEnd: m.weekStart // ensure they are strictly single weeks
          });
        }
      });
      
      // Filter out milestones that start after our requested duration
      const validMilestones = expandedMilestones.filter(m => m.weekStart <= weeks);

      processedRoadmap = {
        ...processedRoadmap,
        totalWeeks: weeks,
        milestones: validMilestones
      };

      updateUser({ roadmap: processedRoadmap });
      toast.success("Roadmap generated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate roadmap.");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (targetRole && !roadmap && !isGenerating) {
      generateRoadmap();
    }
  }, [targetRole, roadmap, isGenerating]);

  // Sync the input initially and when a new roadmap finishes generating
  useEffect(() => {
    if (roadmap?.totalWeeks) {
      setWeeks(roadmap.totalWeeks);
    }
  }, [roadmap?.totalWeeks]);

  const toggleMilestone = async (milestoneId: string) => {
    if (!roadmap) return;
    
    const currentIndex = roadmap.milestones.findIndex(m => m.id === milestoneId);
    if (currentIndex === -1) return;
    
    const targetMilestone = roadmap.milestones[currentIndex];
    const isCompleting = !targetMilestone.completed;

    // If trying to complete this milestone, check if previous ones are completed
    if (isCompleting && currentIndex > 0) {
      const prevMilestone = roadmap.milestones[currentIndex - 1];
      if (!prevMilestone.completed) {
        toast.error(`Please complete "${prevMilestone.title}" first!`);
        return; // Prevent completion
      }
    }

    const updated = {
      ...roadmap,
      milestones: roadmap.milestones.map((m) =>
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      ),
    };
    
    const completedIds = updated.milestones.filter((m) => m.completed).map((m) => m.id);
    
    if (isCompleting) {
      const percentage = Math.round((completedIds.length / roadmap.milestones.length) * 100);
      
      let nextStep = "You've completed your entire roadmap! Outstanding!";
      if (currentIndex + 1 < roadmap.milestones.length) {
        // Since we force sequential completion, the next milestone is exactly currentIndex + 1
        const nextMilestone = roadmap.milestones[currentIndex + 1];
        nextStep = `Next step: ${nextMilestone.title}.`;
        toast.success(`You've closed ${percentage}% of your gaps. ${nextStep}`);
      } else {
        // Entire roadmap completed!
        toast.success(`You've closed ${percentage}% of your gaps. ${nextStep}`);
        
        // Before showing modal, check if feedback is already submitted
        if (user?.email && targetRole) {
          const feedbackRef = collection(db, "roadmapFeedback");
          const q = query(
            feedbackRef, 
            where("userEmail", "==", user?.email),
            where("targetRole", "==", targetRole)
          );
          try {
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              toast.info("You've already provided feedback for this roadmap. Thanks again!");
            } else {
              setTimeout(() => setShowFeedbackModal(true), 1500); // Show modal after a brief delay
            }
          } catch (err) {
            console.error(err);
            // On error, degrade gracefully by showing modal
            setTimeout(() => setShowFeedbackModal(true), 1500); 
          }
        } else {
          setTimeout(() => setShowFeedbackModal(true), 1500);
        }
      }
    } else {
      const percentage = Math.round((completedIds.length / roadmap.milestones.length) * 100);
      toast.info(`Taking a step back on "${targetMilestone.title}"? No problem. You're currently at ${percentage}% completion. Keep going!`);
    }

    updateUser({ roadmap: updated, completedMilestones: completedIds });
  };

  if (!targetRole) {
    return (
      <div className="container py-16 text-center">
        <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-primary" />
        <h2 className="mb-2 font-display text-2xl font-bold">{t("roadmap.title")}</h2>
        <p className="mb-6 text-muted-foreground">Loading your career profile...</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">{t("roadmap.title")}</h1>
          <p className="text-muted-foreground mt-1">Get a personalized learning plan for your career goal: {targetRole ? <strong className="text-foreground">{targetRole}</strong> : <span className="animate-pulse">Loading...</span>}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="weeks" className="whitespace-nowrap">Duration (Weeks)</Label>
            <Input 
              id="weeks" 
              type="number" 
              min={4} 
              max={12} 
              value={weeks || ""} 
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val > 12) {
                  import("sonner").then(({ toast }) => toast.error("Maximum duration allowed is 12 weeks"));
                  setWeeks(12);
                } else {
                  setWeeks(val);
                }
              }} 
              className="w-20"
            />
          </div>
          <Button onClick={generateRoadmap} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Map className="mr-2 h-4 w-4" />}
            {t("roadmap.generate")}
          </Button>
        </div>
      </div>

      {!roadmap ? (
        <Card className="border-0 shadow-md">
          <CardContent className="flex flex-col items-center py-16">
            <Loader2 className="mb-4 h-16 w-16 text-primary animate-spin" />
            <p className="text-muted-foreground">{isGenerating ? "Generating your personalized 8-week learning plan..." : "Click 'Generate Roadmap' to create your personalized learning plan."}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm">{roadmap.totalWeeks} weeks</Badge>
            <Badge variant="outline" className="text-sm">
              {roadmap.milestones.filter((m) => m.completed).length}/{roadmap.milestones.length} weeks completed
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
                        {milestone.weekStart === milestone.weekEnd
                          ? `${t("roadmap.week")} ${milestone.weekStart}`
                          : `${t("roadmap.week")} ${milestone.weekStart}-${milestone.weekEnd}`
                        }
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

      {/* Feedback Modal */}
      <FeedbackModal 
        open={showFeedbackModal} 
        onOpenChange={setShowFeedbackModal} 
        userEmail={user?.email || undefined}
        targetRole={targetRole}
      />
    </div>
  );
};

export default LearningRoadmap;
