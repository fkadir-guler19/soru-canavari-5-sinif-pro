import { GoogleGenAI, Type } from '@google/genai';

export async function handler(event) {
  try {
    if (!process.env.API_KEY) {
      console.error('API_KEY not set in environment');
      return { statusCode: 500, body: JSON.stringify({ error: 'Sunucu yapılandırma hatası: API anahtarı eksik.' }) };
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const { subject, unitName, topics, difficulty, count } = body;

    if (!subject || !unitName || !Array.isArray(topics) || !count) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Eksik parametreler.' }) };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `Sen uzman bir 5. Sınıf öğretmenisin.
  Ders: ${subject}
  Ünite: ${unitName}
  Konular: [${topics.join(', ')}]
  Zorluk: ${difficulty}
  Soru Sayısı: TAM ${count} ADET.

  GÖREV: MEB müfredatına %100 uyumlu, yeni nesil beceri temelli sorular hazırla.
  
  FORMAT VE KURALLAR:
  1. Soru metni (text) içinde GENELDE kalın font kullanma.
  2. Sadece vurgulanan (değildir, en önemlisi, her zaman vb.) kelimeleri **kalın** yaz.
  3. Soru kökünü (kalıbını) her zaman **kalın** yaz.
  4. Numaralı öncüller (I, II, III) varsa her birini yeni satıra yaz.
  5. 4 Şık (A, B, C, D) hazırla.
  6. "correctAnswer" index olarak (0=A, 1=B, 2=C, 3=D) belirtilmelidir.`;

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
              text: { type: Type.STRING, description: 'Soru metni.' },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Dört seçenek içeren dizi.',
              },
              correctAnswer: {
                type: Type.INTEGER,
                description: 'Doğru seçeneğin dizindeki indeksi (0-3).',
              },
              explanation: {
                type: Type.STRING,
                description: 'Sorunun pedagojik açıklaması.',
              },
            },
            required: ["text", "options", "correctAnswer", "explanation"],
          },
        },
      }
    });

    let jsonStr = response.text?.trim() || '[]';
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/, '').replace(/```$/, '');
    }
    const data = JSON.parse(jsonStr);
    if (!Array.isArray(data)) throw new Error('Geçersiz veri formatı: Dizi bekleniyor.');

    const out = data.map((q) => ({
      id: Math.random().toString(36).substr(2, 9),
      text: q.text || '',
      options: Array.isArray(q.options) ? q.options : ['A','B','C','D'],
      correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
      explanation: q.explanation || 'Açıklama bulunamadı.',
      difficulty: difficulty
    }));

    return { statusCode: 200, body: JSON.stringify(out) };
  } catch (err) {
    console.error('Netlify Function Error:', err);
    const msg = err?.message || 'Bilinmeyen hata';
    return { statusCode: 500, body: JSON.stringify({ error: `Gemini isteği başarısız: ${msg}` }) };
  }
}
