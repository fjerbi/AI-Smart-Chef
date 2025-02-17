import { OpenAI } from 'openai';


const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_TOKEN,
  baseURL: "https://openrouter.ai/api/v1/",
});

export const runtime = "edge";

export async function POST(req: Request): Promise<Response> {
  const { prompt } = await req.json();

  const response = await openai.chat.completions.create({
    model: "deepseek/deepseek-r1-distill-llama-70b:free",
    
    messages: [
      {
        role: "system",
        content: "You are an AI Healthy Chef that generates meals based on selected ingredients and cooking instructions.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    n: 1,
  });

  const script = response.choices[0]?.message?.content!.trim() || 'No script generated';

  return new Response(JSON.stringify({ script }), {
    headers: { 'Content-Type': 'application/json' },
  });
}