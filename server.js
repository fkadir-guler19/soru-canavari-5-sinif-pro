import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { GoogleGenAI, Type } from '@google/genai';

const app = express();
const port = process.env.PORT || 5174;

app.use(cors());
app.use(bodyParser.json({ limit: '128kb' }));

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

app.post('/api/generate', async (req, res) => {
  const { subject, unitName, topics, difficulty, count } = req.body || {};

  if (!subject || !unitName || !Array.isArray(topics) || !count) {
    return res.status(400).json({ error: 'Eksik parametreler.' });
  }

  const prompt = `Sen uzman bir 5. Sınıf öğretmenisin. \n  Ders: ${subject}\n  Ünite: ${unitName}\n  Konular: [${topics.join(', ')}]\n  Zorluk: ${difficulty}\n  Soru Sayısı: TAM ${count} ADET.\n\n  GÖREV: MEB müfredatına %100 uyumlu, yeni nesil beceri temelli sorular hazırla.\n  FORMAT VE KURALLAR:\n  1. Soru metni (text) içinde GENELDE kalın font kullanma.\n  2. Sadece vurgulanan (değildir, en önemlisi, her zaman vb.) kelimeleri **kalın** yaz.\n  3. Soru kökünü (kalıbını) her zaman **kalın** yaz.\n  4. Numaralı öncüller (I, II, III) varsa her birini yeni satıra yaz.\n  5. 4 Şık (A, B, C, D) hazırla.\n  6. "correctAnswer" index olarak (0=A, 1=B, 2=C, 3=D) belirtilmelidir.`;

  try {
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

    res.json(out);
  } catch (err) {
    console.error('Generation error:', err);
    res.status(500).json({ error: 'Gemini isteği başarısız oldu.' });
  }
});

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
