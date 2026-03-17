import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, Briefcase, GraduationCap, Loader2, Target } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { supabase } from "@/integrations/supabase/client";
import { ParsedResume } from "@/lib/types";
import { normalizeSkill } from "@/lib/seed-data";
import { toast } from "sonner";
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set up pdf.js worker - matching the exact import style from skills_inputs_data
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const extractTextFromUrl = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        let extractedText = "";
        
        // Cloudinary URLs usually have extensions, but we can also check the blob type
        if (blob.type === "application/pdf" || url.toLowerCase().includes(".pdf")) {
            const arrayBuffer = await blob.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                // @ts-ignore - textContent.items type definition implies .str exists in this context
                const pageText = textContent.items.map((item) => item.str).join(" ");
                extractedText += pageText + " ";
            }
        } else if (
            blob.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
            url.toLowerCase().includes(".docx")
        ) {
            const arrayBuffer = await blob.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            extractedText = result.value;
        } else {
            throw new Error("Unsupported file type");
        }
        
        return extractedText;
    } catch (error) {
        console.error("Error extracting text:", error);
        throw error;
    }
};

const ResumeUpload = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [parsedData, setParsedData] = useState<ParsedResume | null>(null);

  useEffect(() => {
    const fetchAndParseResume = async () => {
      if (!user?.email) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // 1. Fetch user profile from Firestore to get the resumeURL
        const docRef = doc(db, "userProfiles", user?.email);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists() || !docSnap.data().resumeURL) {
          setIsLoading(false);
          return;
        }

        const resumeURL = docSnap.data().resumeURL;

        // 2. Extract text from the resumeURL
        const text = await extractTextFromUrl(resumeURL);

        // 3. Send text to Supabase Edge Function to parse
        const { data, error } = await supabase.functions.invoke("parse-resume", {
          body: { resumeText: text, fileName: "Resume" },
        });

        if (error) throw error;

        const parsed: ParsedResume = data;
        
        // Ensure name and email are pulled from the database form if the parser failed to grab them
        parsed.name = parsed.name || docSnap.data().fullName || user.name;
        parsed.email = parsed.email || user.email;
        parsed.jobRole = docSnap.data().careerGoal;

        // Normalize skills format
        parsed.skills = parsed.skills.map((s) => ({
          ...s,
          skill: normalizeSkill(s.skill),
        }));

        // Save parsed data to Firestore
        import("firebase/firestore").then(({ updateDoc }) => {
          updateDoc(docRef, {
            parsedEducation: parsed.education,
            parsedSkills: parsed.skills.map(s => s.skill), // Only store the skill names
            parsedExperience: parsed.experience,
            lastParsedAt: new Date().toISOString()
          }).catch(err => console.error("Error saving parsed data:", err));
        });

        setParsedData(parsed);
      } catch (err) {
        console.error("Error fetching or parsing resume:", err);
        toast.error("Failed to load and parse your resume. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndParseResume();
  }, [user]);

  if (isLoading) {
    return (
      <div className="container py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-medium text-slate-800">Analyzing your resume...</h2>
        <p className="text-muted-foreground mt-2 text-center max-w-md">
          We are extracting your skills, experience, and education from the database. This magic might take a few seconds.
        </p>
      </div>
    );
  }

  if (!parsedData) {
    return (
      <div className="container py-8">
        <h1 className="mb-8 font-display text-3xl font-bold">{t("resume.title")}</h1>
        <Card className="border-dashed bg-slate-50 border-2 shadow-sm p-12 text-center">
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Resume Found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
              We couldn't find a resume attached to your profile. Please complete your Skill Profile Setup first.
            </p>
            <Button onClick={() => navigate("/skill-profile")} className="gap-2">
              <Target className="h-4 w-4" /> Go to Profile Setup
            </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="mb-8 font-display text-3xl font-bold">{t("resume.title")}</h1>

      <div className="space-y-6 animate-fade-in">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Info */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3 border-b border-muted">
              <CardTitle className="flex items-center gap-2 text-lg text-primary">
                <User className="h-5 w-5" /> Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">{parsedData.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">{parsedData.email}</span>
              </div>
              {parsedData.jobRole && (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">{parsedData.jobRole}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Education */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3 border-b border-muted">
              <CardTitle className="flex items-center gap-2 text-lg text-primary">
                <GraduationCap className="h-5 w-5" /> {t("resume.education")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {parsedData.education.map((edu, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <p className="font-medium text-[15px]">{edu.degree}</p>
                  <p className="text-sm text-muted-foreground">
                    {edu.institution} &bull; {edu.year}
                  </p>
                </div>
              ))}
              {parsedData.education.length === 0 && (
                <p className="text-sm text-muted-foreground">No education listed</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Skills */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3 border-b border-muted">
            <CardTitle className="text-lg text-primary">Parsed Skills</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {parsedData.skills.map((s) => (
                <Badge
                  key={s.skill}
                  variant="outline"
                  className="px-3 py-1.5 text-sm font-medium border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary transition-colors cursor-default"
                >
                  {s.skill}
                </Badge>
              ))}
              {parsedData.skills.length === 0 && (
                <p className="text-sm text-muted-foreground">No skills listed</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Experience */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3 border-b border-muted">
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <Briefcase className="h-5 w-5" /> {t("resume.experience")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {parsedData.experience.map((exp, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-100 p-4 transition-all hover:shadow-sm">
                <div>
                  <p className="font-medium text-slate-900">{exp.role}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{exp.company}</p>
                </div>
                <Badge className="bg-emerald-500 hover:bg-emerald-600 font-medium">
                  {exp.years} yr{exp.years !== 1 ? "s" : ""}
                </Badge>
              </div>
            ))}
            {parsedData.experience.length === 0 && (
              <p className="text-sm text-muted-foreground">No experience listed</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResumeUpload;
