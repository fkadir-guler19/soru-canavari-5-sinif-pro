
export enum Grade {
  GRADE_5 = '5. Sınıf',
}

export enum SubjectType {
  TURKISH = 'Türkçe',
  SCIENCE = 'Fen Bilimleri',
  SOCIAL = 'Sosyal Bilgiler',
  RELIGION = 'Din Kültürü ve Ahlak Bilgisi',
  MATH = 'Matematik',
  ENGLISH = 'İngilizce',
}

export interface Unit {
  id: string;
  name: string;
  topics: string[];
}

export interface Subject {
  type: SubjectType;
  icon: string;
  color: string;
  units: Unit[];
  timePerQuestion: number; // in seconds
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface HistoryItem {
  id: string;
  date: string;
  subject: SubjectType;
  unit: string;
  topics: string[];
  score: number;
  total: number;
  difficulty: string;
  quizData: Question[];
  userAnswers: {[key: string]: number};
}

export interface QuizConfig {
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  selectedTopics: string[];
}

export interface UserStats {
  points: number;
  level: number;
  streak: number;
  correctAnswers: number;
  totalQuestions: number;
  monsterEvolution: number; 
  history: HistoryItem[];
}

export type ViewState = 'home' | 'history' | 'history-detail' | 'subject-selection' | 'unit-selection' | 'topic-selection' | 'quiz-config' | 'quiz' | 'result';
