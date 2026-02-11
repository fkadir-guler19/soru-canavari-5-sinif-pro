
import React, { useState, useEffect } from 'react';
import { 
  SubjectType, 
  ViewState, 
  UserStats, 
  Subject, 
  Unit, 
  Question,
  QuizConfig,
  HistoryItem
} from './types';
import { CURRICULUM, MONSTER_STAGES, LEVEL_THRESHOLD, MASCOT_THINKING, MASCOT_VICTORY } from './constants';
import { generateQuizQuestions } from './services/geminiService';
import { sendQuestionsToGoogleSheet } from './services/questionLogger';

// --- Utility: Image Fallback Component ---
const MascotImage: React.FC<{ src: string; alt: string; className?: string; fallbackIcon?: string }> = ({ src, alt, className, fallbackIcon = '🤖' }) => {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-white/20 rounded-full border-2 border-dashed border-white/50 text-6xl`}>
        {fallbackIcon}
      </div>
    );
  }
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      onError={() => setError(true)}
    />
  );
};

type ToastVariant = 'info' | 'error';

const Toast: React.FC<{ message: string; variant?: ToastVariant; onClose: () => void }> = ({ message, variant = 'info', onClose }) => (
  <div className="fixed left-1/2 top-4 z-[100] w-[min(92vw,40rem)] -translate-x-1/2 px-4">
    <div
      className={`flex items-start justify-between gap-4 rounded-3xl border p-4 shadow-2xl backdrop-blur-md ${
        variant === 'error'
          ? 'border-rose-200 bg-rose-50/95 text-rose-900'
          : 'border-slate-200 bg-white/95 text-slate-900'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="text-sm font-bold leading-relaxed">{message}</div>
      <button
        onClick={onClose}
        className="shrink-0 rounded-2xl bg-slate-900/5 px-3 py-1.5 text-xs font-black uppercase tracking-wider hover:bg-slate-900/10"
        aria-label="Bildirimi kapat"
      >
        Kapat
      </button>
    </div>
  </div>
);

const ConfirmModal: React.FC<{
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ open, title = 'Onay', message, confirmText = 'Evet', cancelText = 'Vazgeç', onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        onClick={onCancel}
        aria-label="Kapat"
      />
      <div className="relative w-[min(92vw,32rem)] rounded-[2.5rem] bg-white p-8 shadow-2xl border border-slate-100">
        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</div>
          <div className="text-lg font-black text-slate-900 leading-snug">{message}</div>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-3xl border-2 border-slate-100 bg-white py-4 text-sm font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 active:scale-[0.99]"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-3xl bg-rose-600 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-rose-100 hover:bg-rose-700 active:scale-[0.99]"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Utility: Timer Formatter ---
const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// --- Utility: Markdown-like bolding renderer ---
const renderFormattedText = (text: string) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold text-slate-900 drop-shadow-sm">{part.slice(2, -2)}</strong>;
    }
    return <span key={index} className="font-medium text-slate-700">{part}</span>;
  });
};

// --- Sub-components ---
const Header: React.FC<{ stats: UserStats; onHome: () => void }> = ({ stats, onHome }) => (
  <header className="bg-white/95 backdrop-blur-md shadow-sm p-4 sticky top-0 z-50 border-b-2 border-indigo-50">
    <div className="max-w-6xl mx-auto flex justify-between items-center">
      <button onClick={onHome} className="flex items-center gap-3 group">
        <div className="bg-white p-1 rounded-full shadow-md group-hover:scale-110 transition-transform border-2 border-cyan-500 overflow-hidden">
        <img src="./logo.png" alt="Logo" className="w-12 h-12 object-contain" />
        </div>
        <div className="hidden sm:block text-left">
          <h1 className="text-xl font-black text-indigo-900 leading-none tracking-tight">SORU CANAVARI</h1>
          <span className="text-[10px] font-bold text-cyan-500 tracking-widest uppercase">Bilim Robotu Pro</span>
        </div>
      </button>
      
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Level {stats.level}</span>
          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-700 progress-bar-transition" 
              style={{ width: `${(stats.points % LEVEL_THRESHOLD) / LEVEL_THRESHOLD * 100}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-2xl border border-amber-100">
          <span className="text-amber-500 font-black">⭐ {stats.points}</span>
        </div>
      </div>
    </div>
  </header>
);

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [homeTab, setHomeTab] = useState<'adventure' | 'history'>('adventure');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);
  const [quizConfig, setQuizConfig] = useState<QuizConfig>({
    questionCount: 5,
    difficulty: 'medium',
    selectedTopics: []
  });
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<{[key: string]: number}>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null);
  const [confirmState, setConfirmState] = useState<{ message: string; onConfirm: () => void } | null>(null);

  const [stats, setStats] = useState<UserStats>(() => {
    const fallback: UserStats = {
      points: 0,
      level: 1,
      streak: 0,
      correctAnswers: 0,
      totalQuestions: 0,
      monsterEvolution: 0,
      history: []
    };
    try {
      const saved = localStorage.getItem('soru_canavari_stats_v5');
      if (!saved) return fallback;
      const parsed = JSON.parse(saved) as Partial<UserStats> | null;
      if (!parsed || typeof parsed !== 'object') return fallback;
      return {
        ...fallback,
        ...parsed,
        history: Array.isArray(parsed.history) ? parsed.history : []
      };
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    localStorage.setItem('soru_canavari_stats_v5', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(t);
  }, [toast]);

  const loadAllQuestions = async () => {
    if (!selectedSubject || !selectedUnit) return;
    setLoading(true);
    setUserAnswers({});
    setQuizSubmitted(false);
    setQuestions([]);
    
    try {
      const topicsToQuery = quizConfig.selectedTopics.length > 0 ? quizConfig.selectedTopics : selectedUnit.topics;
      const qs = await generateQuizQuestions(
        selectedSubject.type, 
        selectedUnit.name, 
        topicsToQuery, 
        quizConfig.difficulty,
        quizConfig.questionCount
      );
      if (qs && qs.length > 0) {
        setQuestions(qs);

        // Soru seti üretildiği anda Google Sheets'e arka planda gönder.
        sendQuestionsToGoogleSheet(qs, {
          subject: selectedSubject.type,
          unitName: selectedUnit.name,
          topics: topicsToQuery,
          difficulty: quizConfig.difficulty,
        });

        setTimer(selectedSubject.timePerQuestion * quizConfig.questionCount);
      } else {
        throw new Error("Soru bulunamadı.");
      }
    } catch (err) {
      console.error("Sorular yüklenirken hata:", err);
      const errMsg = (err as any)?.message || String(err) || "Bilinmeyen hata";
      const fullMsg = `Soru hazırlama hatası: ${errMsg}. Ağ bağlantınızı kontrol edin ve tekrar deneyin.`;
      setToast({ message: fullMsg, variant: 'error' });
      setView('quiz-config');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval: any;
    if (view === 'quiz' && timer > 0 && !quizSubmitted && !loading) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && view === 'quiz' && !quizSubmitted && !loading && questions.length > 0) {
      handleSubmitQuiz();
    }
    return () => clearInterval(interval);
  }, [timer, view, quizSubmitted, loading, questions.length]);

  const handleSelectAnswer = (questionId: string, index: number) => {
    if (quizSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [questionId]: index }));
  };

  const toggleTopic = (topic: string) => {
    setQuizConfig(prev => {
      const isSelected = prev.selectedTopics.includes(topic);
      if (isSelected) {
        return { ...prev, selectedTopics: prev.selectedTopics.filter(t => t !== topic) };
      } else {
        return { ...prev, selectedTopics: [...prev.selectedTopics, topic] };
      }
    });
  };

  const handleSubmitQuiz = () => {
    if (quizSubmitted || questions.length === 0) return;
    setQuizSubmitted(true);
    
    let correct = 0;
    questions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) correct++;
    });

    const pointsEarned = correct * 25;

    setStats(prev => {
      const newPoints = prev.points + pointsEarned;
      const newTotal = prev.totalQuestions + questions.length;
      const newCorrect = prev.correctAnswers + correct;
      const newLevel = Math.floor(newPoints / LEVEL_THRESHOLD) + 1;
      const newEvo = Math.min(3, Math.floor(newLevel / 4));

      const historyItem: HistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toLocaleString('tr-TR'),
        subject: selectedSubject!.type,
        unit: selectedUnit!.name,
        topics: quizConfig.selectedTopics,
        score: correct,
        total: questions.length,
        difficulty: quizConfig.difficulty,
        quizData: [...questions],
        userAnswers: {...userAnswers}
      };

      return {
        ...prev,
        points: newPoints,
        level: newLevel,
        totalQuestions: newTotal,
        correctAnswers: newCorrect,
        monsterEvolution: newEvo,
        history: [historyItem, ...prev.history].slice(0, 50)
      };
    });
    setView('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startQuizFlow = () => {
    setView('quiz');
    loadAllQuestions();
  };

  const resetFlow = () => {
    setQuestions([]);
    setUserAnswers({});
    setQuizSubmitted(false);
    setView('home');
  };

  const getPerformanceData = (score: number, total: number) => {
    const ratio = score / total;
    if (ratio >= 0.9) return { emoji: '🏆', color: 'text-cyan-600', quote: 'VERİLER MÜKEMMEL!', sub: 'Robotun enerji seviyesi maksimuma ulaştı!' };
    if (ratio >= 0.7) return { emoji: '⚡', color: 'text-amber-500', quote: 'HARİKA ANALİZ!', sub: 'Geleceğin bilim insanı olma yolundasın.' };
    if (ratio >= 0.4) return { emoji: '🔋', color: 'text-emerald-500', quote: 'HA GAYRET! ASLINDA OLACAKTI!', sub: 'Daha fazla soru çözerek sistemi güçlendirebilirsin.' };
    return { emoji: '🛠️', color: 'text-rose-500', quote: 'KONULARI DAHA FAZLA ÇALIŞMALISIN!', sub: 'Biraz daha çalışıp sistemi yeniden başlatmalıyız!' };
  };

  return (
    <div className="min-h-screen flex flex-col font-['Quicksand'] bg-[#f8faff] text-slate-800">
      {toast && <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />}
      <ConfirmModal
        open={!!confirmState}
        title="Görevi bitir"
        message={confirmState?.message || ''}
        confirmText="Bitir"
        cancelText="Devam et"
        onCancel={() => setConfirmState(null)}
        onConfirm={() => {
          const fn = confirmState?.onConfirm;
          setConfirmState(null);
          fn?.();
        }}
      />
      <Header stats={stats} onHome={resetFlow} />

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8">
        
        {/* HOME VIEW */}
        {view === 'home' && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex flex-col items-center text-center mt-6 space-y-6">
              <div className="monster-bounce relative group cursor-pointer active:scale-95 transition-transform">
                <div className="absolute inset-0 bg-cyan-100 blur-3xl opacity-30 group-hover:opacity-50 transition-opacity" />
                <div className="relative z-10 p-4 bg-white/40 rounded-full backdrop-blur-md border border-white/60 shadow-2xl shadow-cyan-100/50">
                  <MascotImage 
                    src={MONSTER_STAGES[stats.monsterEvolution]} 
                    alt="Bilim Robotu" 
                    className="w-48 h-48 md:w-64 md:h-64 drop-shadow-lg"
                    fallbackIcon="🤖"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-none brand-font">Merhaba Kaşif! 👋</h2>
                <p className="text-slate-500 font-medium text-lg max-w-lg mx-auto leading-relaxed">Bilim robotunu güçlendirmek için Yapay Zeka ile hazırlanmış soruları çöz, seviye atla!</p>
              </div>
            </div>

            <div className="max-w-md mx-auto bg-slate-100 p-1.5 rounded-3xl flex border border-slate-200 shadow-inner">
              <button onClick={() => setHomeTab('adventure')} className={`flex-1 py-3 px-6 rounded-[1.25rem] font-black transition-all ${homeTab === 'adventure' ? 'bg-white shadow-md text-cyan-600' : 'text-slate-400 hover:text-slate-600'}`}>KEŞİFE ÇIK</button>
              <button onClick={() => setHomeTab('history')} className={`flex-1 py-3 px-6 rounded-[1.25rem] font-black transition-all ${homeTab === 'history' ? 'bg-white shadow-md text-cyan-600' : 'text-slate-400 hover:text-slate-600'}`}>GÖREV GEÇMİŞİ</button>
            </div>

            {homeTab === 'adventure' ? (
              <div className="text-center animate-in slide-in-from-bottom-4 duration-300">
                <button onClick={() => setView('subject-selection')} className="px-12 py-5 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-black text-xl rounded-3xl shadow-xl hover:scale-105 active:scale-95 transition-all shadow-cyan-200 uppercase tracking-widest">Maceraya Başla 🚀</button>
              </div>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300 pb-10">
                {stats.history.length === 0 ? (
                  <div className="bg-white p-12 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center text-slate-400 font-bold">Henüz tamamlanan bir görev yok.</div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {stats.history.map((item) => (
                      <button 
                        key={item.id} 
                        onClick={() => { setSelectedHistoryItem(item); setView('history-detail'); }}
                        className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md hover:translate-x-1 transition-all text-left group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-slate-50 p-3 rounded-2xl text-2xl group-hover:scale-110 transition-transform">{CURRICULUM.find(s => s.type === item.subject)?.icon || '📚'}</div>
                          <div>
                            <div className="text-[10px] font-black text-cyan-600 uppercase tracking-widest leading-none mb-1">{item.subject}</div>
                            <h4 className="text-lg font-black text-slate-800 leading-tight">{item.unit}</h4>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">{item.date}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                          <div className="flex flex-col items-center bg-slate-50 px-6 py-2 rounded-2xl flex-1 md:flex-none border border-slate-100">
                            <div className="text-xl font-black text-indigo-600">{item.score}/{item.total}</div>
                            <div className="text-[10px] font-black uppercase text-slate-400">Veri Puanı</div>
                          </div>
                          <div className="text-cyan-300 font-black hidden md:block">➔</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* HISTORY DETAIL VIEW */}
        {view === 'history-detail' && selectedHistoryItem && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 pb-20">
            <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-lg border border-indigo-50 sticky top-[72px] z-40 backdrop-blur-md">
              <div className="text-left">
                <button onClick={() => { setView('home'); setHomeTab('history'); }} className="text-cyan-600 font-black text-xs uppercase tracking-widest mb-1 flex items-center gap-1 group">
                  <span className="group-hover:-translate-x-1 transition-transform">←</span> GÖREV LİSTESİNE DÖN
                </button>
                <h2 className="text-xl font-black text-slate-900 leading-tight brand-font">{selectedHistoryItem.unit} Analizi</h2>
              </div>
              <div className="bg-cyan-600 text-white px-6 py-3 rounded-2xl font-black text-xl shadow-lg shadow-cyan-100">
                {selectedHistoryItem.score} / {selectedHistoryItem.total}
              </div>
            </div>
            
            <div className="space-y-12">
              {selectedHistoryItem.quizData.map((q, idx) => {
                const userAnswer = selectedHistoryItem.userAnswers[q.id];
                const isCorrect = userAnswer === q.correctAnswer;
                return (
                  <div key={q.id} className="space-y-6">
                    <div className={`bg-white p-10 md:p-12 rounded-[2.5rem] shadow-xl border-l-[10px] ${isCorrect ? 'border-emerald-500' : 'border-rose-500'} text-left relative overflow-hidden group`}>
                      <div className="absolute top-0 right-0 p-8 opacity-10 font-black text-9xl text-slate-300 pointer-events-none group-hover:scale-110 transition-transform">?</div>
                      <span className={`inline-block text-[10px] font-black px-4 py-1.5 rounded-full uppercase mb-4 tracking-widest relative z-10 ${isCorrect ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {isCorrect ? 'DOĞRU ANALİZ' : 'HATALI VERİ'} - SORU {idx + 1}
                      </span>
                      <div className="text-xl md:text-2xl font-medium leading-relaxed whitespace-pre-wrap relative z-10">{renderFormattedText(q.text)}</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {q.options.map((option, oIdx) => {
                        const isCorrectOption = oIdx === q.correctAnswer;
                        const isSelected = userAnswer === oIdx;
                        let style = "bg-white border-2 border-slate-100 opacity-60 text-slate-600";
                        if (isCorrectOption) style = "bg-emerald-500 border-emerald-600 text-white opacity-100 scale-[1.02] shadow-lg shadow-emerald-100";
                        else if (isSelected) style = "bg-rose-500 border-rose-600 text-white opacity-100 shadow-lg shadow-rose-100";
                        return (
                          <div key={oIdx} className={`p-6 rounded-[2rem] text-left shadow-md flex gap-4 items-center transition-all ${style}`}>
                            <div className={`w-10 h-10 min-w-[2.5rem] flex items-center justify-center rounded-xl text-lg font-black ${isCorrectOption || isSelected ? 'bg-white/20' : 'bg-slate-50'}`}>
                              {['A', 'B', 'C', 'D'][oIdx]}
                            </div>
                            <span className="text-lg font-bold leading-snug">{option}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="p-8 rounded-[2rem] bg-cyan-50 border border-cyan-100 text-left relative overflow-hidden">
                      <div className="absolute -right-4 -bottom-4 opacity-10 text-6xl">?</div>
                      <div className="font-black text-[10px] text-cyan-600 uppercase tracking-widest mb-2">Robot Çözüm Analizi</div>
                      <div className="text-lg text-cyan-900 leading-relaxed font-medium">{q.explanation}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <button 
              onClick={() => { setView('home'); setHomeTab('adventure'); }}
              className="w-full bg-cyan-600 text-white font-black py-7 rounded-[2.5rem] shadow-2xl hover:bg-cyan-700 transition-all text-xl active:scale-95 shadow-cyan-100"
            >
              YENİ BİR GÖREVE BAŞLA 🚀
            </button>
          </div>
        )}

        {/* QUIZ VIEW (LOADING) */}
        {loading && view === 'quiz' && (
          <div className="flex flex-col items-center justify-center py-40 space-y-8 animate-in fade-in zoom-in-95 duration-700">
            <div className="relative">
              <div className="w-32 h-32 border-[8px] border-slate-100 border-t-cyan-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <MascotImage src={MASCOT_THINKING} alt="Düşünen Robot" className="w-20 h-20" fallbackIcon="🤔" />
              </div>
            </div>
            <div className="text-center space-y-3">
              <p className="text-indigo-900 font-black text-3xl brand-font uppercase tracking-tight">Robot Verileri İşliyor...</p>
              <p className="text-slate-400 font-bold max-w-sm mx-auto leading-relaxed px-4">Robotun Yapay Zeka ağına bağlandı, senin için en güncel soruları kurguluyor.</p>
            </div>
          </div>
        )}

        {/* QUIZ VIEW (QUESTIONS) */}
        {view === 'quiz' && !loading && questions.length > 0 && (
           <div className="max-w-4xl mx-auto pb-32">
             <div className="sticky top-[72px] z-40 bg-[#f8faff]/90 backdrop-blur-md pb-4 pt-2">
               <div className="flex justify-between items-center bg-white p-5 rounded-[2rem] shadow-xl border border-slate-100">
                 <div className="flex items-center gap-4">
                   <div className={`w-24 h-16 flex flex-col items-center justify-center rounded-2xl font-black text-2xl border-2 ${timer < 30 ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse' : 'bg-cyan-50 border-cyan-100 text-cyan-600'}`}>
                     <span className="text-[10px] uppercase opacity-60 tracking-widest leading-none mb-1 font-black">SÜRE</span>
                     {formatTime(timer)}
                   </div>
                   <div className="hidden sm:block text-left">
                     <div className="text-[10px] font-black text-cyan-600 uppercase tracking-widest leading-none mb-1">{selectedSubject?.type}</div>
                     <div className="text-sm font-bold text-slate-700">{questions.length} Veri Girişi</div>
                   </div>
                 </div>
                 <div className="flex items-center gap-2">
                   <button onClick={resetFlow} className="bg-slate-50 text-slate-500 px-4 py-2 rounded-xl text-xs font-black hover:bg-slate-100 transition-colors uppercase">Vazgeç</button>
                   <button
                     onClick={() => setConfirmState({ message: 'Görevden ayrılmak istediğine emin misin?', onConfirm: handleSubmitQuiz })}
                     className="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-xs font-black border border-rose-100 hover:bg-rose-100 transition-colors uppercase"
                   >
                     Bitir
                   </button>
                 </div>
               </div>
             </div>

             <div className="space-y-12 mt-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                {questions.map((q, qIdx) => (
                  <div key={q.id} className="space-y-6">
                    <div className="bg-white p-10 md:p-12 rounded-[2.5rem] shadow-xl border-l-[10px] border-cyan-500 text-left relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-10 font-black text-9xl text-slate-300 pointer-events-none group-hover:scale-110 transition-transform">?</div>
                      <span className="relative z-10 inline-block bg-cyan-50 text-cyan-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase mb-4 tracking-widest">VERİ SETİ {qIdx + 1}</span>
                      <div className="relative z-10 text-xl md:text-2xl leading-relaxed whitespace-pre-wrap">
                        {renderFormattedText(q.text)}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {q.options.map((option, oIdx) => {
                        const isSelected = userAnswers[q.id] === oIdx;
                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleSelectAnswer(q.id, oIdx)}
                            className={`p-7 rounded-[2rem] text-left transition-all shadow-lg active:scale-95 group relative border-2 ${isSelected ? 'bg-cyan-600 border-cyan-700 text-white shadow-cyan-100' : 'bg-white border-slate-100 hover:border-cyan-200'}`}
                          >
                            <div className="flex gap-5 items-center">
                              <div className={`w-12 h-12 min-w-[3rem] flex items-center justify-center rounded-2xl text-xl font-black transition-colors ${isSelected ? 'bg-white/20 text-white' : 'bg-cyan-50 text-cyan-600'}`}>
                                {['A', 'B', 'C', 'D'][oIdx]}
                              </div>
                              <span className={`text-lg leading-snug font-bold ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                                {option}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <button 
                  onClick={handleSubmitQuiz}
                  className="w-full bg-gradient-to-r from-cyan-600 to-indigo-700 text-white font-black py-8 rounded-[2.5rem] shadow-2xl hover:scale-[1.02] transition-all text-2xl active:scale-95 mt-10 shadow-cyan-200 uppercase tracking-widest"
                >
                  Görev Analizini Bitir 🏁
                </button>
             </div>
           </div>
        )}

        {/* RESULT SCREEN */}
        {view === 'result' && (
          <div className="max-w-3xl mx-auto text-center space-y-12 animate-in zoom-in-95 duration-700 py-10">
             {(() => {
               const correctCount = questions.reduce((acc, q) => userAnswers[q.id] === q.correctAnswer ? acc + 1 : acc, 0);
               const perf = getPerformanceData(correctCount, questions.length);
               const successRatio = Math.round((correctCount / (questions.length || 1)) * 100);
               return (
                 <>
                   <div className="space-y-6">
                      <div className="relative inline-block">
                        <div className="absolute inset-0 bg-cyan-200 blur-3xl opacity-30 animate-pulse" />
                        <MascotImage src={MASCOT_VICTORY} alt="Zafer Robotu" className="w-56 h-56 mx-auto relative z-10 drop-shadow-2xl animate-bounce" fallbackIcon="🏆" />
                      </div>
                      <div className="space-y-3 px-4">
                        <h2 className={`text-5xl md:text-6xl font-black brand-font ${perf.color}`}>{perf.quote}</h2>
                        <p className="text-xl text-slate-500 font-medium">{perf.sub}</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
                      <div className="bg-white p-8 rounded-[3.5rem] shadow-xl border-4 border-emerald-50">
                        <div className="text-4xl font-black text-emerald-600">{correctCount}</div>
                        <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-1">HATASIZ VERİ</div>
                      </div>
                      <div className="bg-white p-8 rounded-[3.5rem] shadow-xl border-4 border-rose-50">
                        <div className="text-4xl font-black text-rose-600">{questions.length - correctCount}</div>
                        <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-1">HATALI VERİ</div>
                      </div>
                      <div className="bg-white p-8 rounded-[3.5rem] shadow-xl border-4 border-cyan-50">
                        <div className="text-4xl font-black text-cyan-600">%{successRatio}</div>
                        <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mt-1">SİSTEM VERİMİ</div>
                      </div>
                   </div>

                   <div className="flex flex-col sm:flex-row gap-5 px-4 pt-6">
                      <button 
                        onClick={() => { setView('home'); setHomeTab('history'); }}
                        className="flex-1 bg-white border-4 border-slate-100 text-cyan-600 font-black py-6 rounded-[2.5rem] hover:bg-slate-50 transition-all shadow-lg text-xl active:scale-95 uppercase tracking-wide"
                      >
                        Analiz Et 📊
                      </button>
                      <button 
                        onClick={resetFlow}
                        className="flex-[2] bg-cyan-600 text-white font-black py-6 rounded-[2.5rem] shadow-2xl hover:bg-cyan-700 transition-all text-2xl active:scale-95 shadow-cyan-200 uppercase tracking-widest"
                      >
                        Ana Üsse Dön 🏠
                      </button>
                   </div>
                 </>
               );
             })()}
          </div>
        )}

        {/* SELECTION SCREENS */}
        {view === 'subject-selection' && (
           <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
             <div className="flex flex-col gap-2 text-left">
               <button onClick={resetFlow} className="text-cyan-600 font-black text-sm uppercase tracking-widest flex items-center gap-2"><span>←</span> Ana Üs</button>
               <h2 className="text-4xl font-black text-slate-900 brand-font">Veri Bankası</h2>
               <p className="text-slate-500 font-medium font-bold">Uzmanlaşmak istediğin bilim alanını seç.</p>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {CURRICULUM.map((subj) => (
                 <button key={subj.type} onClick={() => { setSelectedSubject(subj); setView('unit-selection'); }} className={`p-10 rounded-[2.5rem] text-left transition-all hover:translate-y-[-8px] shadow-xl relative overflow-hidden group ${subj.color}`}>
                   <div className="absolute -right-6 -bottom-6 text-[10rem] opacity-10 transition-transform group-hover:rotate-12 group-hover:scale-110">{subj.icon}</div>
                   <div className="relative z-10 text-white">
                     <div className="text-5xl mb-6 drop-shadow-md">{subj.icon}</div>
                     <div className="text-2xl font-black mb-2 leading-none brand-font">{subj.type}</div>
                     <div className="text-sm opacity-80 font-bold uppercase tracking-wider">{subj.units.length} Bölüm Hazır</div>
                   </div>
                 </button>
               ))}
             </div>
           </div>
        )}

        {view === 'unit-selection' && selectedSubject && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
            <div className="flex flex-col gap-2 text-left">
              <button onClick={() => setView('subject-selection')} className="text-cyan-600 font-black text-sm uppercase tracking-widest">← Alan Seçimine Dön</button>
              <h2 className="text-4xl font-black text-slate-900 brand-font">{selectedSubject.type} Bölümleri</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {selectedSubject.units.map((unit, idx) => (
                <div key={unit.id} className="bg-white p-7 rounded-3xl border-2 border-transparent hover:border-cyan-500 transition-all flex justify-between items-center group cursor-pointer shadow-md hover:shadow-lg" onClick={() => { setSelectedUnit(unit); setView('topic-selection'); }}>
                  <div className="flex items-center gap-6 text-left">
                    <div className="bg-cyan-50 text-cyan-600 font-black w-12 h-12 flex items-center justify-center rounded-2xl text-xl brand-font">{idx + 1}</div>
                    <h3 className="text-xl font-black text-slate-800">{unit.name}</h3>
                  </div>
                  <div className="text-cyan-400 font-black group-hover:translate-x-2 transition-transform">➔</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'topic-selection' && selectedUnit && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
            <div className="flex flex-col gap-2 text-left">
              <button onClick={() => setView('unit-selection')} className="text-cyan-600 font-black text-sm uppercase tracking-widest">← Bölümlere Dön</button>
              <h2 className="text-4xl font-black text-slate-900 brand-font">Konu Filtreleri</h2>
              <p className="text-slate-500 font-medium font-bold">Hedeflediğin konuları aktifleştir veya hepsini bırak.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedUnit.topics.map((topic) => (
                <button key={topic} onClick={() => toggleTopic(topic)} className={`p-6 rounded-3xl border-2 text-left transition-all flex items-center justify-between shadow-sm ${quizConfig.selectedTopics.includes(topic) ? 'border-cyan-500 bg-cyan-50 text-cyan-900' : 'border-slate-100 bg-white text-slate-700 hover:border-cyan-200'}`}>
                  <span className="font-bold">{topic}</span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${quizConfig.selectedTopics.includes(topic) ? 'bg-cyan-600 border-cyan-600 text-white' : 'border-slate-200'}`}>{quizConfig.selectedTopics.includes(topic) && '✓'}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setView('quiz-config')} className="w-full bg-cyan-600 text-white py-6 rounded-3xl font-black text-xl shadow-xl hover:bg-cyan-700 transition-all active:scale-95 shadow-cyan-200 uppercase tracking-widest">Yapılandırmayı Tamamla ➔</button>
          </div>
        )}

        {view === 'quiz-config' && selectedUnit && (
          <div className="max-w-2xl mx-auto space-y-10 animate-in zoom-in-95 duration-500 pb-20">
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-black text-slate-900 leading-tight brand-font">İşlem Kapasitesi</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Zorluk ve Soru Miktarını Belirle</p>
            </div>
            <div className="space-y-10 bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
              <div className="space-y-6 text-left">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest">Soru Sayısı</label>
                  <span className="text-4xl font-black text-cyan-600 brand-font">{quizConfig.questionCount}</span>
                </div>
                <input type="range" min="1" max="10" value={quizConfig.questionCount} onChange={(e) => setQuizConfig({...quizConfig, questionCount: parseInt(e.target.value)})} className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-cyan-600" />
              </div>
              <div className="space-y-4 text-left">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest">Zorluk Seviyesi</label>
                <div className="grid grid-cols-3 gap-4">
                  {['easy', 'medium', 'hard'].map((d) => (
                    <button key={d} onClick={() => setQuizConfig({...quizConfig, difficulty: d as any})} className={`py-5 rounded-2xl font-black border-2 transition-all brand-font uppercase tracking-wide ${quizConfig.difficulty === d ? 'bg-cyan-600 border-cyan-600 text-white shadow-lg shadow-cyan-100' : 'border-slate-100 text-slate-400 hover:border-cyan-200'}`}>
                      {d === 'easy' ? 'Kolay' : d === 'medium' ? 'Orta' : 'Zor'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={startQuizFlow} className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-black py-6 rounded-3xl shadow-2xl hover:scale-[1.03] transition-all text-xl active:scale-95 shadow-cyan-200 uppercase tracking-widest">Sistemi Başlat 🚀</button>
          </div>
        )}
      </main>

      {/* FOOTER NAV */}
      {view !== 'quiz' && (
        <footer className="bg-white/95 backdrop-blur-md border-t border-slate-100 p-4 sticky bottom-0 z-50 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="max-w-6xl mx-auto flex gap-2">
            <button onClick={resetFlow} className={`flex-1 flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all ${view === 'home' && homeTab === 'adventure' ? 'bg-cyan-50 text-cyan-600' : 'text-slate-400 hover:text-cyan-400'}`}>
              <span className="text-2xl">🏠</span><span className="text-[10px] font-black uppercase tracking-tighter">Ana Üsse Dön</span>
            </button>
            <button onClick={() => { setView('home'); setHomeTab('history'); }} className={`flex-1 flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all ${(view === 'home' && homeTab === 'history') || view === 'history-detail' ? 'bg-cyan-50 text-cyan-600' : 'text-slate-400 hover:text-cyan-400'}`}>
              <span className="text-2xl">📜</span><span className="text-[10px] font-black uppercase tracking-tighter">Arşiv</span>
            </button>
            <button onClick={() => setView('subject-selection')} className={`flex-1 flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all ${view.includes('selection') || view.includes('config') ? 'bg-cyan-50 text-cyan-600' : 'text-slate-400 hover:text-cyan-400'}`}>
              <span className="text-2xl">📚</span><span className="text-[10px] font-black uppercase tracking-tighter">Bölümler</span>
            </button>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
