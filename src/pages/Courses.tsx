import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/i18n";
import { courseRecommendations } from "@/lib/seed-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ExternalLink, Clock, CheckCircle2 } from "lucide-react";

const Courses = () => {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const [filter, setFilter] = useState("All");

  const skills = ["All", ...Array.from(new Set(courseRecommendations.map((c) => c.skill)))];

  const filtered = filter === "All"
    ? courseRecommendations
    : courseRecommendations.filter((c) => c.skill === filter);

  const toggleComplete = (courseId: string) => {
    if (!user) return;
    const completed = user.completedCourses.includes(courseId)
      ? user.completedCourses.filter((id) => id !== courseId)
      : [...user.completedCourses, courseId];
    updateUser({ completedCourses: completed });
  };

  return (
    <div className="container py-8">
      <h1 className="mb-8 font-display text-3xl font-bold">{t("courses.title")}</h1>

      {/* Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {skills.map((skill) => (
          <Button
            key={skill}
            variant={filter === skill ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(skill)}
            className="rounded-full"
          >
            {skill === "All" ? t("common.all") : skill}
          </Button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((course, i) => {
          const isCompleted = user?.completedCourses.includes(course.id);
          return (
            <Card
              key={course.id}
              className={`border-0 shadow-md transition-all hover:shadow-lg animate-fade-in ${isCompleted ? "ring-2 ring-secondary" : ""}`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <CardContent className="p-6">
                <div className="mb-3 flex items-center justify-between">
                  <Badge variant="outline">{course.skill}</Badge>
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <Clock className="h-3 w-3" /> {course.duration}
                  </Badge>
                </div>
                <h3 className="mb-1 font-semibold">{course.title}</h3>
                <p className="mb-2 text-sm text-muted-foreground">{course.provider}</p>
                <p className="mb-4 text-xs text-muted-foreground">{course.description}</p>
                <div className="flex items-center gap-2">
                  <a href={course.link} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="gap-1">
                      <ExternalLink className="h-3 w-3" /> {t("courses.viewCourse")}
                    </Button>
                  </a>
                  <Button
                    size="sm"
                    variant={isCompleted ? "default" : "ghost"}
                    onClick={() => toggleComplete(course.id)}
                    className="gap-1"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {isCompleted ? "Done" : "Mark Done"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Courses;
