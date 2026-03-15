declare const Deno: any;

import { YoutubeTranscript } from "youtube-transcript";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let transcriptText = "";
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(url);
      transcriptText = transcript.map(t => t.text).join(" ");
    } catch (error) {
       console.error("Transcript fetch error:", error);
       return new Response(JSON.stringify({ error: "Transcript not available for this video." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-pro",
        messages: [
          {
            role: "system",
            content: `You are an expert technical writer and educator. Your task is to analyze a full video transcript and generate highly detailed, structured study notes. 
Do not provide a short summary. Generate comprehensive notes that thoroughly cover the video's content, especially for longer tutorials.

Structure the response exactly as follows:
- **title**: A descriptive title for the video.
- **overview**: A short explanation of the video's main topic and purpose.
- **mainTopics**: An array of 3-7 core topics covered in the video.
- **sectionNotes**: Highly detailed notes divided into logical sections. Each section must have a \`title\` (e.g., 'Introduction', 'Core Concepts', 'Code Examples', 'Advanced Concepts', 'Use Cases') and detailed \`content\` with multiple paragraphs or bullet points explaining the topic in depth.
- **keyTakeaways**: An array of the most important concepts or critical ideas to remember.
- **finalSummary**: A concise recap of the entire video.`
          },
          {
            role: "user",
            content: `Generate detailed study notes for this video transcript:\n\n${transcriptText.substring(0, 30000)}` 
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_notes",
              description: "Return highly detailed, structured video summary notes.",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  overview: { type: "string" },
                  mainTopics: { type: "array", items: { type: "string" } },
                  sectionNotes: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        content: { type: "string" }
                      },
                      required: ["title", "content"]
                    }
                  },
                  keyTakeaways: { type: "array", items: { type: "string" } },
                  finalSummary: { type: "string" }
                },
                required: ["title", "overview", "mainTopics", "sectionNotes", "keyTakeaways", "finalSummary"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_notes" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
       throw new Error("AI did not return the expected notes format.");
    }

    const parsed = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("video-notes error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

export {};
