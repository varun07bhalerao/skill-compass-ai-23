import { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, Loader2, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { VideoNote } from "@/lib/types";

const VideoNotes = () => {
  const { t } = useLanguage();
  const [url, setUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [notes, setNotes] = useState<VideoNote[]>(() => {
    const saved = localStorage.getItem("skillbridge-video-notes");
    return saved ? JSON.parse(saved) : [];
  });
  const [copied, setCopied] = useState(false);

  const generateNotes = async () => {
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("video-notes", {
        body: { url },
      });

      if (error) throw error;

      const newNote: VideoNote = {
        url,
        title: data.title || url,
        bulletPoints: data.bulletPoints,
        createdAt: new Date().toISOString(),
      };

      const updated = [newNote, ...notes];
      setNotes(updated);
      localStorage.setItem("skillbridge-video-notes", JSON.stringify(updated));
      setUrl("");
      toast.success("Notes generated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate notes.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyNotes = (note: VideoNote) => {
    const text = `${note.title}\n\n${note.bulletPoints.map((b) => `• ${b}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container py-8">
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
              {t("video.generate")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {notes.map((note, i) => (
          <Card key={i} className="border-0 shadow-md animate-fade-in">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{note.title}</CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyNotes(note)}
                  className="gap-1"
                >
                  {copied ? <CheckCircle2 className="h-4 w-4 text-secondary" /> : <Copy className="h-4 w-4" />}
                  {t("video.copy")}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(note.createdAt).toLocaleDateString()} • {note.url}
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {note.bulletPoints.map((point, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {point}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}

        {notes.length === 0 && (
          <div className="py-12 text-center">
            <Video className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
            <p className="text-muted-foreground">Paste a tutorial URL above to generate summary notes.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoNotes;
