import { Question, SubjectType } from "../types";

// Google Sheets / Apps Script entegrasyonu için yardımcı fonksiyon.
// 1) Google Sheets içinde bir Apps Script web uygulaması (Web App) oluşturun.
// 2) Yayınladığınız Web App'in "Anyone with the link" (veya uygun görünürlük) olduğundan emin olun.
// 3) Aşağıdaki URL sabitine kendi Web App URL'nizi yapıştırın.

// TODO: Bu adresi kendi Google Apps Script Web App URL'nizle değiştirin.
const GOOGLE_SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzM30sFOLXrcram5BkduX_gpQuxtoAl2gytNkgFqhzGGlN2thp-JQ2yTY0WHtCex2aIig/exec";

interface QuestionLogContext {
  subject: SubjectType;
  unitName: string;
  topics: string[];
  difficulty: string;
}

export const sendQuestionsToGoogleSheet = async (
  questions: Question[],
  context: QuestionLogContext
) => {
  // URL henüz ayarlanmadıysa, sessizce çık.
  if (!GOOGLE_SHEETS_WEBHOOK_URL || GOOGLE_SHEETS_WEBHOOK_URL.includes("WEB_APP_IDINIZ")) {
    console.warn("[QuestionLogger] GOOGLE_SHEETS_WEBHOOK_URL tanımlı değil. Kayıt gönderilmedi.");
    return;
  }

  try {
    const nowIso = new Date().toISOString();

    // Sheet kolonları: Tarih, Ders, Konu, Soru, Cevap
    const rows = questions.map((q) => ({
      tarih: nowIso,
      ders: context.subject,
      konu: `${context.unitName} - ${context.topics.join(", ")}`,
      soru: q.text,
      cevap: q.options[q.correctAnswer] ?? "",
    }));

    // Hem eski formatı hem de yeni "rows" formatını gönderiyoruz;
    // Apps Script tarafı ihtiyacına göre satırları okuyabilir.
    const payload = {
      createdAt: nowIso,
      ...context,
      questions: questions.map((q) => ({
        id: q.id,
        text: q.text,
        options: q.options,
        correctAnswerIndex: q.correctAnswer,
        correctAnswerText: q.options[q.correctAnswer] ?? "",
        explanation: q.explanation,
      })),
      rows,
    };

    await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("[QuestionLogger] Google Sheets'e gönderilirken hata oluştu:", error);
  }
};

