declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { resumeText, fileName } = await req.json();
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
            content: `You are a resume parser. Extract structured data from resume text. Return a JSON object with this exact structure:
{
  "name": "Full Name",
  "email": "email@example.com",
  "skills": [{"skill": "SkillName", "proficiency": 70}],
  "experience": [{"role": "Job Title", "company": "Company", "years": 1.5}],
  "education": [{"degree": "Degree Name", "institution": "University", "year": 2024}]
}

Proficiency should be 0-100 based on context clues (years of experience, project complexity, certifications).
If the text is not a proper resume or is garbled, still try to extract any skills, names, or emails you can find.
Always return valid JSON.`
          },
          {
            role: "user",
            content: `Parse this resume (filename: ${fileName}):\n\n${resumeText.slice(0, 8000)}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "parse_resume",
              description: "Return structured resume data",
              parameters: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  email: { type: "string" },
                  skills: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        skill: { type: "string" },
                        proficiency: { type: "number" }
                      },
                      required: ["skill", "proficiency"]
                    }
                  },
                  experience: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        role: { type: "string" },
                        company: { type: "string" },
                        years: { type: "number" }
                      },
                      required: ["role", "company", "years"]
                    }
                  },
                  education: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        degree: { type: "string" },
                        institution: { type: "string" },
                        year: { type: "number" }
                      },
                      required: ["degree", "institution", "year"]
                    }
                  }
                },
                required: ["name", "email", "skills", "experience", "education"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "parse_resume" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
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
    console.error("parse-resume error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

export {};
