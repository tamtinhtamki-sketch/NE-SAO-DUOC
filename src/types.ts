export interface Topping {
  id: string;
  name: string;
  color: string;
  emoji: string;
  tagline: string;
}

export interface Student {
  id: string;
  code?: string; // STT or student ID
  name: string;
  gender?: 'Nam' | 'Nữ' | 'Khác';
  topping: Topping;
  calledCount: number;
  lastScore?: number;
  lastGradedAt?: string;
  isExcluded: boolean;
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'essay';

export interface QuestionOption {
  id: string; // e.g. 'A', 'B', 'C', 'D'
  text: string;
}

export interface Question {
  id: string;
  content: string;
  type: QuestionType; // 'multiple_choice' | 'true_false' | 'essay'
  options?: string[]; // 4 choices for multiple_choice: ['A. ...', 'B. ...', 'C. ...', 'D. ...']
  correctOptionIndex?: number; // 0 for A, 1 for B, 2 for C, 3 for D
  correctAnswer?: string; // 'A' | 'B' | 'C' | 'D'
  correctBoolean?: boolean; // For true_false: true = Đúng, false = Sai
  suggestedAnswer?: string; // Explanation or bareme for essay
  category?: string; // 'Đố vui', 'Dò bài cũ', 'Toán học', 'Văn học'...
  packageTag?: string; // 'dovui' | 'baicu' | 'thuthach' | 'chung'
  difficulty?: 'Dễ' | 'Trung Bình' | 'Khó' | 'Siêu Topping';
}

export interface QuestionPackage {
  id: string;
  name: string;
  shortName: string;
  description: string;
  questionCount: number;
  icon: string;
  badgeColor: string;
  categoryFilter?: string;
  preferredType?: QuestionType | 'mixed';
}

export interface QuestionAnswerRecord {
  questionId: string;
  content: string;
  type: QuestionType;
  selectedAnswer?: string | boolean;
  isCorrect?: boolean;
}

export interface CallRecord {
  id: string;
  timestamp: string;
  studentId: string;
  studentName: string;
  toppingName: string;
  packageName?: string;
  question?: string;
  questionsCount?: number;
  questionDetails?: QuestionAnswerRecord[];
  score?: number; // e.g. 0-10
  gradeStatus: 'Xuất sắc' | 'Đạt' | 'Cần cố gắng' | 'Chưa chuẩn bị' | 'Chưa chấm';
  teacherNote?: string;
  timeSpentSeconds?: number;
}

export interface Classroom {
  id: string;
  name: string; // e.g. '12A1'
  subject?: string; // e.g. 'Tiết Học Hào Hứng'
  grade?: string; // e.g. 'Khối 12', 'Khối 11', 'Khối 10'
  students: Student[];
  createdAt: string;
  updatedAt: string;
  description?: string;
}

export type SuspenseTheme = 'millionaire' | 'drumroll' | 'cinematic_heartbeat' | 'squid_suspense';

export interface AppSettings {
  spinDurationSeconds: number; // e.g. 3, 5, 8
  answerTimerSeconds: number; // e.g. 15, 30, 45, 60
  autoExcludeCalled: boolean;
  soundEnabled: boolean;
  soundVolume: number; // 0 to 1
  suspenseSoundEnabled: boolean;
  suspenseTheme: SuspenseTheme;
  enableQuestions: boolean;
  questionMode: 'random' | 'sequential';
  selectedPackageId: string; // ID of selected question package
  theme: 'light' | 'dark';
  className: string;
  subjectName: string;
  activeClassId?: string;
}
