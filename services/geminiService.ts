import { GoogleGenAI, Type } from "@google/genai";
import { Question, SubjectType } from "../types";

export const generateQuizQuestions = async (
  subject: SubjectType, 
  unitName: string, 
  topics: string[], 
  difficulty: string,
  count: number
): Promise<Question[]> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  console.log('[generateQuizQuestions] API Key status:', apiKey ? `✓ Set (${apiKey.substring(0, 20)}...)` : '✗ Missing');
  console.log('[generateQuizQuestions] All env vars:', import.meta.env);
  
  if (!apiKey) {
    throw new Error("Gemini API anahtarı çevre değişkeninde yapılandırılmamış. .env.local dosyasında VITE_GEMINI_API_KEY ayarlanmalıdır.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `You are an expert Turkish 5th grade teacher. Create ${count} multiple choice questions.

Subject: ${subject}
Unit: ${unitName}
Topics: ${Array.isArray(topics) ? topics.join(', ') : topics}
Difficulty: ${difficulty}

Requirements:
- Each question MUST have exactly 4 options (A, B, C, D)
- Return ONLY valid JSON array, no markdown or explanation outside JSON
- Each item: {text, options: [A,B,C,D string array], correctAnswer: 0-3 integer, explanation}`;

  try {
    console.log(`[generateQuizQuestions] Starting request for ${count} questions`);
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              correctAnswer: {
                type: Type.INTEGER,
              },
              explanation: {
                type: Type.STRING,
              },
            },
            required: ["text", "options", "correctAnswer", "explanation"],
          },
        },
      },
    });

    console.log(`[generateQuizQuestions] Got response from Gemini`);
    
    let jsonStr = response.text?.trim() || "[]";
    
    // Safety: remove markdown fences if present
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.replace(/```json\n?/, "").replace(/```$/, "");
    }
    
    const data = JSON.parse(jsonStr);
    
    if (!Array.isArray(data)) {
      throw new Error("Geçersiz veri formatı: Dizi bekleniyor.");
    }

    console.log(`[generateQuizQuestions] Parsed ${data.length} questions`);

    return data.map((q: any) => ({
      id: Math.random().toString(36).substr(2, 9),
      text: q.text || "",
      options: Array.isArray(q.options) ? q.options : ["A", "B", "C", "D"],
      correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
      explanation: q.explanation || "Açıklama bulunamadı.",
      difficulty: difficulty as any
    }));
  } catch (err) {
    console.error("[generateQuizQuestions] Error:", err);
    throw err;
  }
};
