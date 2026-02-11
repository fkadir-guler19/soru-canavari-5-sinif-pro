import { Question, SubjectType } from "../types";

export const generateQuizQuestions = async (
  subject: SubjectType,
  unitName: string,
  topics: string[],
  difficulty: string,
  count: number
): Promise<Question[]> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000); // 45 saniye timeout

  try {
    const apiBase = (import.meta.env.VITE_API_BASE) || (import.meta.env.PROD ? '/.netlify/functions/generate' : '/api/generate');
    console.log(`[generateQuizQuestions] API URL: ${apiBase}, Mode: ${import.meta.env.PROD ? 'production' : 'dev'}`);

    const res = await fetch(apiBase, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, unitName, topics, difficulty, count }),
      signal: controller.signal
    });

    clearTimeout(timeout);
    console.log(`[generateQuizQuestions] Response status: ${res.status}`);

    if (!res.ok) {
      let errMsg = `HTTP ${res.status}`;
      try {
        const errBody = await res.json();
        errMsg = errBody?.error || errMsg;
      } catch {}
      throw new Error(errMsg);
    }

    const data = await res.json();
    console.log(`[generateQuizQuestions] Got ${Array.isArray(data) ? data.length : 0} questions`);

    if (!Array.isArray(data)) throw new Error('Geçersiz veri formatı: Dizi bekleniyor');

    return data.map((q: any) => ({
      id: q.id || Math.random().toString(36).substr(2, 9),
      text: q.text || '',
      options: Array.isArray(q.options) ? q.options : ['A','B','C','D'],
      correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
      explanation: q.explanation || '',
      difficulty: difficulty as any
    }));
  } catch (err) {
    const errMsg = (err as any)?.message || String(err);
    console.error(`[generateQuizQuestions] Error:`, errMsg);

    if ((err as any).name === 'AbortError') {
      throw new Error('Gemini isteği zaman aşımına uğradı (45+ saniye). Ağ bağlantınızı kontrol edin veya daha sonra tekrar deneyin.');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
};
