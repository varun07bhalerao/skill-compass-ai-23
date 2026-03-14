import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth-context";
import Layout from "@/components/Layout";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import ResumeUpload from "@/features/ResumeUpload";
import SkillAnalysis from "@/features/SkillAnalysis";
import LearningRoadmap from "@/features/LearningRoadmap";
import Courses from "@/pages/Courses";
import JobMatching from "@/features/JobMatching";
import VideoNotes from "@/pages/VideoNotes";
import ProgressTracking from "@/pages/ProgressTracking";
import NotFound from "@/pages/NotFound";
import SkillsInputsData from "@/features/skills_inputs_data";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/resume" element={<ResumeUpload />} />
                <Route path="/skills" element={<SkillAnalysis />} />
                <Route path="/roadmap" element={<LearningRoadmap />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/jobs" element={<JobMatching />} />
                <Route path="/video-notes" element={<VideoNotes />} />
                <Route path="/progress" element={<ProgressTracking />} />
                <Route path="/skill-profile" element={<SkillsInputsData />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
