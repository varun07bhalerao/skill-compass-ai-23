export interface Skill {
  skill: string;
  proficiency: number; // 0-100
}

export interface Experience {
  role: string;
  company: string;
  years: number;
}

export interface Education {
  degree: string;
  institution: string;
  year: number;
}

export interface ParsedResume {
  name: string;
  email: string;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
}

export interface RoleMatch {
  role: string;
  matchPercentage: number;
  requiredSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
}

export interface MissingSkill {
  skill: string;
  importance: "high" | "medium" | "low";
  forRoles: string[];
}

export interface ReadinessScore {
  score: number; // 0-100
  band: "Beginner" | "Intermediate" | "Job-Ready";
  breakdown: {
    skillCoverage: number;
    experienceLevel: number;
    educationMatch: number;
  };
}

export interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  weekStart: number;
  weekEnd: number;
  completed: boolean;
  tasks: string[];
}

export interface ProjectSuggestion {
  title: string;
  description: string;
  skills: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  link: string;
  duration: string;
  skill: string;
  description: string;
}

export interface Roadmap {
  totalWeeks: number;
  milestones: RoadmapMilestone[];
  projects: ProjectSuggestion[];
  courses: Course[];
}

export interface JobDescription {
  id: string;
  title: string;
  company: string;
  role: string;
  description: string;
  requiredSkills: string[];
  experienceLevel: string;
  location: string;
}

export interface UserProfile {
  name: string;
  email: string;
  resume?: ParsedResume;
  readinessScore?: ReadinessScore;
  roleMatches?: RoleMatch[];
  missingSkills?: MissingSkill[];
  roadmap?: Roadmap;
  completedCourses: string[];
  completedMilestones: string[];
}

export interface SectionNote {
  title: string;
  content: string;
}

export interface VideoNote {
  url: string;
  title: string;
  overview: string;
  mainTopics: string[];
  sectionNotes: SectionNote[];
  keyTakeaways: string[];
  finalSummary: string;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  type: "upload" | "course" | "milestone" | "analysis";
  title: string;
  timestamp: string;
}
