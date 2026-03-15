import { useState, useRef } from "react";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, Loader2, Copy, CheckCircle2, FileDown } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { VideoNote } from "@/lib/types";
import html2pdf from "html2pdf.js";

const VideoNotes = () => {
  const { t } = useLanguage();
  const [url, setUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [notes, setNotes] = useState<VideoNote[]>(() => {
    const saved = localStorage.getItem("skillbridge-video-notes");
    return saved ? JSON.parse(saved) : [];
  });
  const [copiedNoteUrl, setCopiedNoteUrl] = useState<string | null>(null);
  
  // Ref for the specific note being downloaded
  const noteRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const generateNotes = async () => {
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    // Basic YouTube URL validation
    const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    if (!ytRegex.test(url)) {
      toast.error("Please enter a valid YouTube URL");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("video-notes", {
        body: { url },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const newNote: VideoNote = {
        url,
        title: data.title || url,
        overview: data.overview || "",
        mainTopics: data.mainTopics || [],
        sectionNotes: data.sectionNotes || [],
        keyTakeaways: data.keyTakeaways || [],
        finalSummary: data.finalSummary || "",
        createdAt: new Date().toISOString(),
      };

      const updated = [newNote, ...notes];
      setNotes(updated);
      localStorage.setItem("skillbridge-video-notes", JSON.stringify(updated));
      setUrl("");
      toast.success("Notes generated successfully!");
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Failed to generate notes. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateNotesText = (note: VideoNote) => {
    let text = `Video Title: ${note.title}\n\n`;
    text += `Overview:\n${note.overview}\n\n`;
    text += `Key Topics:\n${note.mainTopics.map(t => `• ${t}`).join("\n")}\n\n`;
    
    text += `Detailed Notes:\n`;
    note.sectionNotes.forEach(section => {
      text += `\n${section.title}\n${section.content}\n`;
    });
    
    text += `\nKey Takeaways:\n${note.keyTakeaways.map(t => `• ${t}`).join("\n")}\n\n`;
    text += `Final Summary:\n${note.finalSummary}`;
    return text;
  };

  const copyNotes = (note: VideoNote) => {
    const text = generateNotesText(note);
    navigator.clipboard.writeText(text);
    setCopiedNoteUrl(note.url);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedNoteUrl(null), 2000);
  };

  const downloadPDF = (note: VideoNote) => {
    const generatedNotes = generateNotesText(note);

    const container = document.createElement("div");
    container.style.fontFamily = "sans-serif";
    container.style.lineHeight = "1.5";
    container.style.color = "#333";
    container.style.padding = "20px";
    
    const titleEl = document.createElement("h1");
    titleEl.innerText = "Title: Video Notes";
    titleEl.style.marginBottom = "20px";
    titleEl.style.fontSize = "24px";
    container.appendChild(titleEl);

    const videoTitleEl = document.createElement("h2");
    videoTitleEl.innerText = `Video Title: ${note.title}`;
    videoTitleEl.style.marginBottom = "20px";
    videoTitleEl.style.fontSize = "18px";
    container.appendChild(videoTitleEl);

    const generatedNotesHeader = document.createElement("h3");
    generatedNotesHeader.innerText = "Generated Notes:";
    generatedNotesHeader.style.marginBottom = "10px";
    generatedNotesHeader.style.fontSize = "16px";
    container.appendChild(generatedNotesHeader);

    // Format the text into HTML
    const contentDiv = document.createElement("div");
    const formattedHtml = generatedNotes
      .split('\n')
      .map(line => {
        if (line.trim() === '') return '<br/>';
        if (line.startsWith('Video Title:') || line === 'Overview:' || line === 'Key Topics:' || line === 'Detailed Notes:' || line === 'Key Takeaways:' || line === 'Final Summary:') {
           return `<h3 style="margin-top: 16px; margin-bottom: 8px; font-size: 16px;">${line}</h3>`;
        }
        if (line.startsWith('•')) {
           return `<div style="margin-left: 16px; margin-bottom: 4px;">${line}</div>`;
        }
        // Check if it's a section title (no punctuation at end, short)
        if (line.length < 60 && !line.endsWith('.') && !line.startsWith('•') && !line.includes(':')) {
           return `<h4 style="margin-top: 12px; margin-bottom: 6px; font-size: 14px; font-weight: bold;">${line}</h4>`;
        }
        return `<p style="margin-bottom: 8px; font-size: 14px;">${line}</p>`;
      })
      .join('');
      
    contentDiv.innerHTML = formattedHtml;
    container.appendChild(contentDiv);

    const opt = {
      margin: 15,
      filename: `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    toast.info("Generating PDF...", { id: "pdf-toast" });
    html2pdf().set(opt).from(container).save().then(() => {
      toast.success("PDF downloaded successfully!", { id: "pdf-toast" });
    }).catch((err: unknown) => {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF.", { id: "pdf-toast" });
    });
  };

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <h1 className="mb-8 font-display text-3xl font-bold">{t("video.title")}</h1>

      <Card className="mb-8 border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <Input
              placeholder={t("video.paste")}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generateNotes()}
              className="flex-1"
            />
            <Button onClick={generateNotes} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Video className="mr-2 h-4 w-4" />}
              {isGenerating ? "Analyzing..." : t("video.generate")}
            </Button>
          </div>
          {isGenerating && (
            <p className="text-sm text-muted-foreground mt-3 animate-pulse">
              Fetching full transcript and analyzing deep technical content... this may take a moment for long tutorials.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-8">
        {notes.map((note, i) => (
          <Card key={i} className="border-0 shadow-lg animate-fade-in relative z-0">
            <CardHeader className="bg-muted/30 border-b">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-xl mb-2">{note.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {new Date(note.createdAt).toLocaleDateString()} • <a href={note.url} target="_blank" rel="noreferrer" className="hover:underline">{note.url}</a>
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyNotes(note)}
                    className="gap-2"
                  >
                    {copiedNoteUrl === note.url ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => downloadPDF(note)}
                    className="gap-2"
                  >
                    <FileDown className="h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* HIDDEN / WRAPPED CONTENT ONLY FOR PDF GENERATION */}
              <div 
                ref={el => noteRefs.current[note.url] = el}
                className="p-6 md:p-8 space-y-8 text-foreground prose prose-slate dark:prose-invert max-w-none"
              >
                
                <div className="pdf-only-title hidden">
                  <h1 className="text-3xl font-bold mb-4">{note.title}</h1>
                  <p className="text-sm text-gray-500 mb-8">{note.url}</p>
                </div>

                {note.overview && (
                  <section>
                    <h2 className="text-xl font-semibold mb-3 border-b pb-2">Overview</h2>
                    <p className="leading-relaxed">{note.overview}</p>
                  </section>
                )}

                {note.mainTopics && note.mainTopics.length > 0 && (
                  <section>
                    <h2 className="text-xl font-semibold mb-3 border-b pb-2">Main Topics</h2>
                    <ul className="list-disc pl-5 space-y-1">
                      {note.mainTopics.map((topic, j) => (
                        <li key={j}>{topic}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {note.sectionNotes && note.sectionNotes.length > 0 && (
                  <section>
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2">Detailed Notes</h2>
                    <div className="space-y-6">
                      {note.sectionNotes.map((section, j) => (
                        <div key={j} className="bg-muted/10 p-4 rounded-lg border">
                          <h3 className="text-lg font-medium mb-2 text-primary">{section.title}</h3>
                          {/* Ensure multiline content renders correctly */}
                          <div className="whitespace-pre-line text-sm leading-relaxed">
                            {section.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {note.keyTakeaways && note.keyTakeaways.length > 0 && (
                  <section>
                    <h2 className="text-xl font-semibold mb-3 border-b pb-2">Key Takeaways</h2>
                    <ul className="list-disc pl-5 space-y-2">
                      {note.keyTakeaways.map((takeaway, j) => (
                        <li key={j} className="text-sm font-medium">{takeaway}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {note.finalSummary && (
                  <section className="bg-primary/5 p-4 rounded-lg border-l-4 border-primary">
                    <h2 className="text-lg font-semibold mb-2">Final Summary</h2>
                    <p className="text-sm leading-relaxed italic">{note.finalSummary}</p>
                  </section>
                )}
                
              </div>
            </CardContent>
          </Card>
        ))}

        {notes.length === 0 && (
          <div className="py-16 text-center bg-muted/20 rounded-xl border border-dashed">
            <Video className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
            <h3 className="text-lg font-medium mb-2">No Notes Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Paste a tutorial URL above to generate deep, comprehensive summary notes with multiple sections and insights.
            </p>
          </div>
        )}
      </div>
      
      {/* Global CSS for PDF specific hiding/showing */}
      <style>{`
        @media print {
          .pdf-only-title { display: block !important; }
        }
      `}</style>
    </div>
  );
};

export default VideoNotes;
