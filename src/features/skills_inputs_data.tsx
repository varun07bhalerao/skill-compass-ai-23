import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Upload, FileType, CheckCircle2 } from "lucide-react";
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import mammoth from 'mammoth';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const RESUME_KEYWORDS = [
    "skills", "experience", "education", "projects", "certifications", "summary"
];

const validateResumeContent = async (file: File): Promise<boolean> => {
    try {
        let extractedText = "";
        
        if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(" ");
                extractedText += pageText + " ";
            }
        } else if (
            file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
            file.name.toLowerCase().endsWith(".docx")
        ) {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            extractedText = result.value;
        } else {
            return false; // Unsupported type
        }
        
        const textLower = extractedText.toLowerCase();
        const matchedKeywords = RESUME_KEYWORDS.filter(keyword => 
            textLower.includes(keyword.toLowerCase())
        );
        return matchedKeywords.length >= 2;
    } catch (error) {
        console.error("Error validating resume:", error);
        return false;
    }
};

export default function SkillsInputsData() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Use authenticated user email or fallback
    const userEmail = user?.email || "";

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            const validTypes = [
                "application/pdf",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ];

            if (!validTypes.includes(selectedFile.type)) {
                toast({
                    title: "Invalid file type",
                    description: "Please upload a valid resume file (PDF or DOCX).",
                    variant: "destructive",
                });
                return;
            }

            if (selectedFile.size > 5 * 1024 * 1024) {
                toast({
                    title: "File too large",
                    description: "Maximum file size is 5MB.",
                    variant: "destructive",
                });
                return;
            }

            setFile(selectedFile);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        let resumeURL = null;

        try {
            // 1. Upload file to Cloudinary first if one is selected
            if (file) {
                // Validate resume content first
                const isValidResume = await validateResumeContent(file);
                
                if (!isValidResume) {
                    toast({
                        title: "Validation Failed",
                        description: "This file does not appear to contain a resume. Please upload a valid resume.",
                        variant: "destructive",
                    });
                    setIsSubmitting(false);
                    return;
                }
                
                toast({
                    title: "Resume Detected",
                    description: "File successfully uploaded. Resume detected.",
                });

                const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
                const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

                if (!cloudName || !uploadPreset) {
                    throw new Error("Cloudinary credentials not configured");
                }

                const cloudFormData = new FormData();
                cloudFormData.append("file", file);
                cloudFormData.append("upload_preset", uploadPreset);

                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
                    {
                        method: "POST",
                        body: cloudFormData,
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to upload file to Cloudinary");
                }

                const cloudData = await response.json();
                resumeURL = cloudData.secure_url; // This is the public URL
            }

            // 2. Prepare user data 
            const data = {
                fullName: formData.get("fullName"),
                email: userEmail,
                educationLevel: formData.get("educationLevel"),
                branch: formData.get("branch"),
                yearOfStudy: formData.get("yearOfStudy"),
                careerGoal: formData.get("careerGoal"),
                resumeURL: resumeURL,
                updatedAt: new Date().toISOString(),
            };

            // 3. Save data to Firebase Firestore
            const docRef = userEmail
                ? doc(db, "userProfiles", userEmail)
                : doc(db, "userProfiles", Date.now().toString());

            await setDoc(docRef, data, { merge: true });

            setShowSuccessModal(true);
        } catch (error) {
            console.error("Error saving profile to Firebase: ", error);

            // Show more specific error message if it's a Cloudinary issue
            const errorMessage = error instanceof Error ? error.message : "There was a problem saving your data. Please try again.";

            toast({
                title: "Error saving profile",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 md:px-6 max-w-3xl animate-fade-in">
            <Card className="border-border/50 shadow-sm backdrop-blur-sm bg-card/95">
                <CardHeader className="space-y-1 pb-6">
                    <CardTitle className="text-2xl font-bold tracking-tight">Skill Profile Setup</CardTitle>
                    <CardDescription className="text-muted-foreground text-base">
                        Complete your profile to analyze your skills and career readiness.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Section 1: Basic Information */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-6 w-1 rounded bg-primary"></div>
                                <h3 className="text-lg font-medium">Basic Information</h3>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName" className="text-sm font-medium">
                                        Full Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="fullName"
                                        name="fullName"
                                        placeholder="Enter your full name"
                                        required
                                        className="bg-background/50 transition-colors focus:bg-background"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={userEmail}
                                        readOnly
                                        className="bg-muted text-muted-foreground cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Education Details */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-6 w-1 rounded bg-primary"></div>
                                <h3 className="text-lg font-medium">Education Details</h3>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="educationLevel" className="text-sm font-medium">
                                        Education Level <span className="text-destructive">*</span>
                                    </Label>
                                    <Select name="educationLevel" required>
                                        <SelectTrigger id="educationLevel" className="bg-background/50">
                                            <SelectValue placeholder="Select level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="diploma">Diploma</SelectItem>
                                            <SelectItem value="be_btech">B.E / B.Tech</SelectItem>
                                            <SelectItem value="bsc">B.Sc</SelectItem>
                                            <SelectItem value="bca">BCA</SelectItem>
                                            <SelectItem value="mca">MCA</SelectItem>
                                            <SelectItem value="mtech">M.Tech</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="branch" className="text-sm font-medium">
                                        Branch / Field of Study <span className="text-destructive">*</span>
                                    </Label>
                                    <Select name="branch" required>
                                        <SelectTrigger id="branch" className="bg-background/50">
                                            <SelectValue placeholder="Select branch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="computer">Computer Engineering</SelectItem>
                                            <SelectItem value="it">Information Technology</SelectItem>
                                            <SelectItem value="electronics">Electronics</SelectItem>
                                            <SelectItem value="mechanical">Mechanical</SelectItem>
                                            <SelectItem value="civil">Civil</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="yearOfStudy" className="text-sm font-medium">
                                        Year of Study <span className="text-destructive">*</span>
                                    </Label>
                                    <Select name="yearOfStudy" required>
                                        <SelectTrigger id="yearOfStudy" className="bg-background/50">
                                            <SelectValue placeholder="Select year/status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1st">1st Year</SelectItem>
                                            <SelectItem value="2nd">2nd Year</SelectItem>
                                            <SelectItem value="3rd">3rd Year</SelectItem>
                                            <SelectItem value="4th">4th Year</SelectItem>
                                            <SelectItem value="passed_out">Passed Out</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Career Goal */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-6 w-1 rounded bg-primary"></div>
                                <h3 className="text-lg font-medium">Career Goal</h3>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="careerGoal" className="text-sm font-medium">
                                    Select the career role you are interested in <span className="text-destructive">*</span>
                                </Label>
                                <Select name="careerGoal" required>
                                    <SelectTrigger id="careerGoal" className="bg-background/50 w-full md:w-2/3">
                                        <SelectValue placeholder="Select your target role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="frontend">Frontend Developer</SelectItem>
                                        <SelectItem value="backend">Backend Developer</SelectItem>
                                        <SelectItem value="fullstack">Full Stack Developer</SelectItem>
                                        <SelectItem value="data">Data Analyst</SelectItem>
                                        <SelectItem value="uiux">UI/UX Designer</SelectItem>
                                        <SelectItem value="cybersecurity">Cybersecurity Analyst</SelectItem>
                                        <SelectItem value="sap">SAP Consultant</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Section 4: Resume Upload */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-6 w-1 rounded bg-primary"></div>
                                <h3 className="text-lg font-medium">Upload Resume</h3>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">
                                    Upload your resume so the system can analyze your skills automatically.
                                </Label>

                                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 px-6 py-8 hover:bg-muted/40 transition-colors">
                                    <div className="text-center">
                                        {file ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <CheckCircle2 className="mx-auto h-10 w-10 text-primary mb-2" />
                                                <div className="flex items-center text-sm font-medium">
                                                    <FileType className="mr-2 h-4 w-4" />
                                                    {file.name}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setFile(null)}
                                                    className="mt-2 text-xs"
                                                    type="button"
                                                >
                                                    Remove file
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                                                <div className="mt-4 flex text-sm leading-6 text-muted-foreground">
                                                    <label
                                                        htmlFor="resume-upload"
                                                        className="relative cursor-pointer rounded-md bg-transparent font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/80"
                                                    >
                                                        <span>Upload a file</span>
                                                        <input
                                                            id="resume-upload"
                                                            name="resume-upload"
                                                            type="file"
                                                            accept=".pdf,.doc,.docx"
                                                            className="sr-only"
                                                            onChange={handleFileChange}
                                                            required={!file} // Make required if no file is selected yet
                                                        />
                                                    </label>
                                                    <p className="pl-1">or drag and drop</p>
                                                </div>
                                                <p className="text-xs leading-5 text-muted-foreground">
                                                    PDF or DOCX up to 5MB
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 5: Submit Button */}
                        <div className="pt-4 border-t border-border/50 flex justify-end">
                            <Button
                                type="submit"
                                size="lg"
                                disabled={isSubmitting}
                                className="w-full sm:w-auto min-w-[200px]"
                            >
                                {isSubmitting ? "Submitting..." : "Submit Profile"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <AlertDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <AlertDialogContent className="sm:max-w-md flex flex-col items-center text-center">
                    <AlertDialogHeader className="flex flex-col items-center w-full">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 mb-2">
                            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-500" />
                        </div>
                        <AlertDialogTitle className="text-2xl font-bold">Profile created successfully!</AlertDialogTitle>
                        <AlertDialogDescription className="text-base text-muted-foreground mt-2">
                            Your data is successfully stored.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:justify-center w-full mt-6">
                        <AlertDialogAction
                            onClick={() => navigate("/dashboard")}
                            className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto min-w-[120px]"
                        >
                            OK
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
