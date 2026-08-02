import { Router } from "express";
import { GoogleGenAI } from "@google/genai";

export const aiRouter = Router();

// Lazy-initialize the Gemini SDK so a missing key doesn't crash the server
// at startup — only the first actual request to this route fails.
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

aiRouter.post("/", async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const systemInstruction = `You are an expert AI Academic Assistant for the "Academic Calculator" app.
Your task is to help university, college, and high school students with their academic planning, calculations, and performance improvement.

You can answer questions like:
- "What mark do I need to pass?"
- "Can I still get a distinction?"
- "How can I improve?"
- "Explain GPA / CGPA."
- "Help me plan my study schedule."

Guidelines:
1. Provide encouraging, supportive, and highly actionable student-friendly advice.
2. Be precise with calculations if grade context is provided.
3. Keep formatting clean with bullet points and bold headers.
4. If asked about grade predictions, refer to the formulas: Weighted Mark = (Obtained / Max) * Weight.
5. Emphasize standard terms like distinction (usually 75% or 80% depending on region), pass marks (usually 50%), and GPA scales.
6. Speak in a helpful and mentor-like tone. Use the current student context to give custom answers.`;

    // Construct the context string for the AI
    let contextPrompt = "";
    if (context) {
      contextPrompt = `
[Student Context]
- Student Name: ${context.studentName || "Student"}
- Institution: ${context.institution || "Not specified"}
- Course: ${context.course || "Not specified"}
- Target GPA: ${context.targetGpa || "Not specified"}
- Subjects List: ${JSON.stringify(context.subjects || [])}
- Active Study Streak: ${context.streak || 0} days
`;
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [{ text: contextPrompt }, { text: `User request: ${message}` }],
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      error: error.message || "An error occurred while contacting the AI Assistant.",
      isConfigMissing: !process.env.GEMINI_API_KEY,
    });
  }
});
