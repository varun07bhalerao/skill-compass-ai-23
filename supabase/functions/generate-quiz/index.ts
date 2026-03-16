declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { domain, domainData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (!domain || !domainData) {
      throw new Error("Missing domain or domainData in request");
    }

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
            content: `You are an expert technical interviewer and educator. Generate EXACTLY 10 multiple-choice questions for a quiz based on the provided domain and learning roadmap data. Return structured JSON via the tool.`
          },
          {
            role: "user",
            content: `Create a 10-question multiple-choice quiz for someone preparing for a job in the ${domain} domain.
Here is the roadmap data they have been studying: ${JSON.stringify(domainData)}

The questions should test their knowledge of the skills, projects, and concepts covered in this roadmap.
Make the questions challenging but fair.
Each question should have exactly 4 options.
Provide a clear explanation for the correct answer.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_quiz",
              description: "Return a structured quiz with EXACTLY 10 questions.",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    description: "An array of exactly 10 multiple-choice questions.",
                    minItems: 10,
                    maxItems: 10,
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string", description: "The test question text." },
                        options: { 
                          type: "array", 
                          items: { type: "string" },
                          description: "Exactly 4 possible answers.",
                          minItems: 4,
                          maxItems: 4
                        },
                        correctAnswerIndex: { 
                          type: "number", 
                          description: "The index (0-3) of the correct answer in the options array." 
                        },
                        explanation: { 
                          type: "string", 
                          description: "A brief educational explanation of why the correct answer is right and/or why others are wrong." 
                        }
                      },
                      required: ["question", "options", "correctAnswerIndex", "explanation"]
                    }
                  }
                },
                required: ["questions"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_quiz" } },
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
       throw new Error("No tool call returned from AI.");
    }
    
    const parsed = JSON.parse(toolCall.function.arguments);

    // Ensure we actually got questions
    if (!parsed || !parsed.questions || !Array.isArray(parsed.questions)) {
       throw new Error("Invalid format returned from AI.");
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-quiz error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

export {};
