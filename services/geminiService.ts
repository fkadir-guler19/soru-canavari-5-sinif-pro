
import { Question, SubjectType } from "../types";

export const generateQuizQuestions = async (
  subject: SubjectType,
  unitName: string,
  topics: string[],
  difficulty: string,
  count: number
): Promise<Question[]> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const apiBase = (import.meta.env.VITE_API_BASE) || (import.meta.env.PROD ? '/.netlify/functions/generate' : '/api/generate');
    const res = await fetch(apiBase, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, unitName, topics, difficulty, count }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody?.error || 'Sunucu hatası');
    }

    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Geçersiz veri formatı');

    return data.map((q: any) => ({
      id: q.id || Math.random().toString(36).substr(2, 9),
      text: q.text || '',
      options: Array.isArray(q.options) ? q.options : ['A','B','C','D'],
      correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
      explanation: q.explanation || '',
      difficulty: difficulty as any
    }));
  } catch (err) {
    if ((err as any).name === 'AbortError') {
      throw new Error('Gemini isteği zaman aşımına uğradı.');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
};
