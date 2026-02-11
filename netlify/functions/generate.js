import { GoogleGenAI, Type } from '@google/genai';

export async function handler(event) {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { subject, unitName, topics, difficulty, count } = body;

    if (!subject || !unitName || !Array.isArray(topics) || !count) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Eksik parametreler.' }) };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `Sen uzman bir 5. Sınıf öğretmenisin.\nDers: ${subject}\nÜnite: ${unitName}\nKonular: [${topics.join(', ')}]\nZorluk: ${difficulty}\nSoru Sayısı: TAM ${count} ADET.\n\nGÖREV: MEB müfredatına %100 uyumlu, yeni nesil beceri temelli sorular hazırla.`;

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
            required: ['text','options','correctAnswer','explanation']
          }
        }
      }
    });

    let jsonStr = response.text?.trim() || '[]';
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/, '').replace(/```$/, '');
    }
    const data = JSON.parse(jsonStr);
    if (!Array.isArray(data)) throw new Error('Geçersiz veri formatı');

    const out = data.map((q, i) => ({
      id: (Math.random().toString(36).substr(2, 9)),
      text: q.text || '',
      options: Array.isArray(q.options) ? q.options : ['A','B','C','D'],
      correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
      explanation: q.explanation || '',
      difficulty: difficulty
    }));

    return { statusCode: 200, body: JSON.stringify(out) };
  } catch (err) {
    console.error('Function error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Gemini isteği başarısız oldu.' }) };
  }
}
