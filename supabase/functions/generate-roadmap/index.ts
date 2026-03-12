declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { skills, missingSkills, targetRole, weeks = 8 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a career mentor. Generate a STRICT AND EXACT ${weeks}-week learning roadmap. Return structured JSON via the tool. IT IS ABSOLUTELY CRITICAL that the 'totalWeeks' property is exactly ${weeks}, and the milestones collectively span exactly ${weeks} weeks.`
          },
          {
            role: "user",
            content: `Create a rigid ${weeks}-week learning roadmap for someone targeting the role: ${targetRole}.
Current skills: ${JSON.stringify(skills)}
Missing skills to learn: ${JSON.stringify(missingSkills)}
Make it practical with specific tasks and real course recommendations. The final milestone MUST end on week ${weeks}.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_roadmap",
              description: "Return a structured learning roadmap",
              parameters: {
                type: "object",
                properties: {
                  totalWeeks: { type: "number", description: `MUST BE EXACTLY ${weeks}` },
                  milestones: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        title: { type: "string" },
                        description: { type: "string" },
                        weekStart: { type: "number" },
                        weekEnd: { type: "number" },
                        completed: { type: "boolean" },
                        tasks: { type: "array", items: { type: "string" } }
                      },
                      required: ["id", "title", "description", "weekStart", "weekEnd", "completed", "tasks"]
                    }
                  },
                  projects: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        skills: { type: "array", items: { type: "string" } },
                        difficulty: { type: "string", enum: ["beginner", "intermediate", "advanced"] }
                      },
                      required: ["title", "description", "skills", "difficulty"]
                    }
                  },
                  courses: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        title: { type: "string" },
                        provider: { type: "string" },
                        link: { type: "string" },
                        duration: { type: "string" },
                        skill: { type: "string" },
                        description: { type: "string" }
                      },
                      required: ["id", "title", "provider", "link", "duration", "skill", "description"]
                    }
                  }
                },
                required: ["totalWeeks", "milestones", "projects", "courses"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_roadmap" } },
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
    const parsed = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-roadmap error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

export {};
