import { GoogleGenAI, Type } from '@google/genai';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

export async function handler(event) {
  // OPTIONS isteğine yanıt ver
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ ok: true })
    };
  }

  const startTime = Date.now();
  console.log('[generate] Handler started');

  try {
    // Check API key first
    if (!process.env.API_KEY) {
      console.error('[generate] CRITICAL: API_KEY is missing from environment!');
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'API_KEY çevre değişkeni ayarlanmamış.' })
      };
    }

    console.log('[generate] API_KEY found, parsing request');
    const { subject, unitName, topics, difficulty, count } = JSON.parse(event.body || '{}');

    // Validate inputs
    if (!subject || !unitName || !topics || !count) {
      console.warn('[generate] Missing required fields');
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Eksik parametreler: subject, unitName, topics, count gerekli.' })
      };
    }

    console.log(`[generate] Request: ${subject}/${unitName}, ${count} questions`);
    
    // Create AI instance
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Simpler, faster prompt
    const prompt = `You are a Turkish 5th grade teacher. Create ${count} multiple choice questions.

Subject: ${subject}
Unit: ${unitName}
Topics: ${Array.isArray(topics) ? topics.join(', ') : topics}
Difficulty: ${difficulty}

Requirements:
- Each question must have 4 options (A, B, C, D)
- Return ONLY valid JSON array with no markdown
- Each question: {text, options: [A,B,C,D], correctAnswer: 0-3, explanation}`;

    console.log('[generate] Calling Gemini API...');
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            },
            required: ['text', 'options', 'correctAnswer', 'explanation']
          }
        }
      }
    });

    console.log('[generate] Gemini response received');
    
    // Parse response
    let jsonStr = response.text || '[]';
    jsonStr = jsonStr.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
    
    const data = JSON.parse(jsonStr);
    
    if (!Array.isArray(data)) {
      throw new Error('Response is not an array');
    }

    const elapsed = Date.now() - startTime;
    console.log(`[generate] Success: ${data.length} questions in ${elapsed}ms`);

    // Return formatted response
    const result = data.map((q) => ({
      id: Math.random().toString(36).substr(2, 9),
      text: q.text || '',
      options: Array.isArray(q.options) ? q.options : [],
      correctAnswer: Number(q.correctAnswer) || 0,
      explanation: q.explanation || '',
      difficulty: difficulty
    }));

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(result)
    };

  } catch (err) {
    const elapsed = Date.now() - startTime;
    console.error(`[generate] Error after ${elapsed}ms:`, err?.message || err);
    
    // More specific error messages
    let errorMsg = 'Gemini API isteği başarısız oldu.';
    if (err?.message?.includes('API key')) {
      errorMsg = 'Google API anahtarı geçersiz veya yetki sorunu.';
    } else if (err?.message?.includes('timeout') || err?.message?.includes('Aborted')) {
      errorMsg = 'İstek zaman aşımına uğradı. Daha sonra tekrar deneyin.';
    } else if (err?.message?.includes('rate')) {
      errorMsg = 'Çok fazla istek yapıldı. Bir dakika bekleyip tekrar deneyin.';
    }

    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: errorMsg })
    };
  }
}
