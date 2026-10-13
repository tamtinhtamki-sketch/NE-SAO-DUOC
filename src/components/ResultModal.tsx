import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Check,
  Zap,
  Flame,
  FileCheck
} from 'lucide-react';
import { Student, Question, CallRecord, AppSettings, QuestionPackage, QuestionAnswerRecord } from '../types';
import { soundManager } from '../utils/audio';

interface ResultModalProps {
  student: Student;
  questions: Question[];
  currentPackage: QuestionPackage;
  allPackages: QuestionPackage[];
  settings: AppSettings;
  onClose: () => void;
  onSaveResult: (record: CallRecord, excludeStudent: boolean) => void;
  onPickAnotherQuestions: () => void;
  onSelectPackage: (pkgId: string) => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  student,
  questions,
  currentPackage,
  allPackages,
  settings,
  onClose,
  onSaveResult,
  onPickAnotherQuestions,
  onSelectPackage
}) => {
  const isDark = settings.theme === 'dark';

  // Active question index in the package
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // User answer selections for each question: { [questionId]: { selection, isCorrect, revealed } }
  const [userAnswers, setUserAnswers] = useState<{
    [qId: string]: {
      selection?: string | boolean;
      isCorrect?: boolean;
      revealedAnswer?: boolean;
    };
  }>({});

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState(settings.answerTimerSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedScore, setSelectedScore] = useState<number | undefined>(undefined);
  const [gradeStatus, setGradeStatus] = useState<CallRecord['gradeStatus']>('Chưa chấm');
  const [teacherNote, setTeacherNote] = useState('');
  const [excludeThisStudent, setExcludeThisStudent] = useState(settings.autoExcludeCalled);

  // Reset state on open
  useEffect(() => {
    setTimeLeft(settings.answerTimerSeconds);
    setIsTimerRunning(settings.enableQuestions && questions.length > 0);
    setSelectedScore(undefined);
    setGradeStatus('Chưa chấm');
    setTeacherNote('');
    setCurrentQIndex(0);
    setUserAnswers({});
    setExcludeThisStudent(settings.autoExcludeCalled);
  }, [student, questions, settings.answerTimerSeconds, settings.enableQuestions, settings.autoExcludeCalled]);

  // Timer countdown loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            soundManager.playTimeUpBuzzer();
            setIsTimerRunning(false);
            return 0;
          }
          if (prev <= 6) {
            soundManager.playTimerUrgent();
          } else {
            soundManager.playTimerTick();
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeLeft]);

  // Handle Multiple Choice selection
  const handleSelectMultipleChoice = (q: Question, optionText: string, optIndex: number) => {
    const isCorrect =
      q.correctOptionIndex !== undefined
        ? optIndex === q.correctOptionIndex
        : q.correctAnswer
        ? optionText.startsWith(q.correctAnswer)
        : false;

    soundManager.playOptionSelect();
    setTimeout(() => {
      if (isCorrect) {
        soundManager.playCorrectSound();
      } else {
        soundManager.playWrongSound();
      }
    }, 100);

    setUserAnswers(prev => {
      const next = {
        ...prev,
        [q.id]: {
          selection: optionText,
          isCorrect,
          revealedAnswer: true
        }
      };
      autoCalculateScore(next);
      return next;
    });
  };

  // Handle True / False selection
  const handleSelectTrueFalse = (q: Question, value: boolean) => {
    const isCorrect = q.correctBoolean !== undefined ? value === q.correctBoolean : true;

    soundManager.playOptionSelect();
    setTimeout(() => {
      if (isCorrect) {
        soundManager.playCorrectSound();
      } else {
        soundManager.playWrongSound();
      }
    }, 100);

    setUserAnswers(prev => {
      const next = {
        ...prev,
        [q.id]: {
          selection: value,
          isCorrect,
          revealedAnswer: true
        }
      };
      autoCalculateScore(next);
      return next;
    });
  };

  // Toggle revealed explanation / bareme for Essay
  const handleToggleEssayAnswer = (qId: string) => {
    soundManager.playToppingDrop();
    setUserAnswers(prev => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        revealedAnswer: !prev[qId]?.revealedAnswer
      }
    }));
  };

  // Auto-calculate suggested score when objective questions are answered
  const autoCalculateScore = (answersMap: typeof userAnswers) => {
    const objectiveQuestions = questions.filter(q => q.type === 'multiple_choice' || q.type === 'true_false');
    if (objectiveQuestions.length === 0) return;

    let correctCount = 0;
    let answeredCount = 0;

    objectiveQuestions.forEach(q => {
      if (answersMap[q.id]?.selection !== undefined) {
        answeredCount++;
        if (answersMap[q.id]?.isCorrect) {
          correctCount++;
        }
      }
    });

    if (answeredCount > 0) {
      const ratio = correctCount / objectiveQuestions.length;
      let score = Math.round(ratio * 10);
      let status: CallRecord['gradeStatus'] = 'Đạt';
      if (score >= 9) status = 'Xuất sắc';
      else if (score >= 7) status = 'Đạt';
      else if (score >= 5) status = 'Cần cố gắng';
      else status = 'Chưa chuẩn bị';

      setSelectedScore(score);
      setGradeStatus(status);
    }
  };

  const handleScorePick = (score: number, status: CallRecord['gradeStatus']) => {
    setSelectedScore(score);
    setGradeStatus(status);
    if (score >= 8) {
      soundManager.playCorrectSound();
    } else {
      soundManager.playToppingDrop();
    }
  };

  const activeQuestion: Question | undefined = questions[currentQIndex] || questions[0];
  const activeAnswer = activeQuestion ? userAnswers[activeQuestion.id] : undefined;

  const handleSaveAndClose = () => {
    const questionDetails: QuestionAnswerRecord[] = questions.map(q => ({
      questionId: q.id,
      content: q.content,
      type: q.type,
      selectedAnswer: userAnswers[q.id]?.selection,
      isCorrect: userAnswers[q.id]?.isCorrect
    }));

    const record: CallRecord = {
      id: `call-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      studentId: student.id,
      studentName: student.name,
      toppingName: student.topping.name,
      packageName: currentPackage.name,
      questionsCount: questions.length,
      question: questions.length > 0 ? questions.map((q, i) => `${i + 1}. ${q.content}`).join(' | ') : undefined,
      questionDetails,
      score: selectedScore,
      gradeStatus: gradeStatus,
      teacherNote: teacherNote.trim() || undefined,
      timeSpentSeconds: settings.answerTimerSeconds - timeLeft
    };

    onSaveResult(record, excludeThisStudent);
  };

  const timerPercent = (timeLeft / settings.answerTimerSeconds) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0 }}
        className={`w-full max-w-3xl rounded-3xl border-2 shadow-2xl overflow-hidden my-4 transition-colors flex flex-col max-h-[90vh] ${
          isDark
            ? 'bg-slate-900 border-slate-700 text-slate-100 shadow-pink-950/40'
            : 'bg-white border-pink-200 text-slate-800 shadow-pink-200'
        }`}
      >
        {/* Modal Top Banner */}
        <div className="px-5 sm:px-6 py-3.5 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎉</span>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg font-['Comfortaa',cursive]">
                Topping Đã Bị Bắt Trúng!
              </h3>
              <p className="text-xs text-pink-100 font-semibold">
                Né Sao Được • {currentPackage.name} ({questions.length} câu)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Student Showcase Card */}
          <div
            className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left transition-colors ${
              isDark
                ? 'bg-slate-800/80 border-slate-700'
                : 'bg-gradient-to-r from-pink-50/90 to-amber-50/90 border-pink-200'
            }`}
          >
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-md border-2 shrink-0 transform hover:scale-105 transition-transform"
              style={{
                backgroundColor: student.topping.color,
                borderColor: '#ffffff'
              }}
            >
              {student.topping.emoji}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="text-xs px-2.5 py-0.5 rounded-full font-black bg-pink-500 text-white shadow-xs">
                  STT #{student.code || '00'}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  {student.topping.name}
                </span>
                {student.calledCount > 0 && (
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    (Đã gọi {student.calledCount} lần)
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {student.name}
              </h2>

              <p className="text-xs font-semibold italic text-pink-600 dark:text-pink-400 mt-0.5">
                "{student.topping.tagline}"
              </p>
            </div>

            {/* Quick Switch Package in Modal */}
            <div className="flex flex-col items-center sm:items-end gap-1 shrink-0">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Đổi gói câu hỏi:
              </span>
              <div className="flex items-center gap-1">
                {allPackages.map(pkg => (
                  <button
                    key={pkg.id}
                    onClick={() => onSelectPackage(pkg.id)}
                    className={`px-2 py-1 rounded-lg text-xs font-extrabold transition-all border ${
                      currentPackage.id === pkg.id
                        ? 'bg-pink-500 text-white border-pink-600 shadow-xs'
                        : isDark
                        ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-pink-50'
                    }`}
                    title={pkg.description}
                  >
                    {pkg.icon} {pkg.questionCount}c
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* QUESTION PACKAGE SECTION */}
          {settings.enableQuestions && questions.length > 0 && (
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-colors ${
                isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-amber-50/50 border-amber-200'
              }`}
            >
              {/* Question Stepper & Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-amber-200/60 dark:border-slate-700/80">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    {currentPackage.name}
                  </span>

                  {/* Question Stepper tabs */}
                  <div className="flex items-center gap-1 ml-2">
                    {questions.map((q, idx) => {
                      const ans = userAnswers[q.id];
                      let dotColor = isDark ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-600 border border-slate-200';
                      if (ans?.isCorrect === true) dotColor = 'bg-emerald-500 text-white';
                      if (ans?.isCorrect === false) dotColor = 'bg-rose-500 text-white';
                      if (idx === currentQIndex) dotColor = 'ring-2 ring-pink-500 font-black bg-pink-500 text-white';

                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentQIndex(idx)}
                          className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-all ${dotColor}`}
                          title={`Xem câu ${idx + 1}`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Question Type Badge & Shuffle */}
                <div className="flex items-center gap-2">
                  {activeQuestion && (
                    <span
                      className={`text-[11px] font-black px-2 py-0.5 rounded-full border ${
                        activeQuestion.type === 'multiple_choice'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200'
                          : activeQuestion.type === 'true_false'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200'
                      }`}
                    >
                      {activeQuestion.type === 'multiple_choice'
                        ? 'Trắc nghiệm 4 lựa chọn'
                        : activeQuestion.type === 'true_false'
                        ? 'Đúng / Sai'
                        : 'Tự luận / Trình bày'}
                    </span>
                  )}

                  <button
                    onClick={onPickAnotherQuestions}
                    className={`text-xs font-bold flex items-center gap-1 hover:underline ${
                      isDark ? 'text-pink-400' : 'text-pink-600'
                    }`}
                    title="Bốc bộ câu hỏi khác từ ngân hàng"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    Đổi bộ câu hỏi
                  </button>
                </div>
              </div>

              {/* ACTIVE QUESTION BODY */}
              {activeQuestion && (
                <div className="py-3 space-y-4">
                  {/* Question Content */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                        Câu {currentQIndex + 1}/{questions.length}
                      </span>
                      {activeQuestion.category && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                          • {activeQuestion.category}
                        </span>
                      )}
                      {activeQuestion.difficulty && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200/70 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-bold">
                          {activeQuestion.difficulty}
                        </span>
                      )}
                    </div>

                    <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-relaxed">
                      {activeQuestion.content}
                    </p>
                  </div>

                  {/* 1. MULTIPLE CHOICE INTERACTION (A, B, C, D) */}
                  {activeQuestion.type === 'multiple_choice' && activeQuestion.options && (
                    <div className="space-y-2 pt-1">
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Chọn đáp án của học sinh:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {activeQuestion.options.map((opt, optIdx) => {
                          const isSelected = activeAnswer?.selection === opt;
                          const isCorrectChoice =
                            activeQuestion.correctOptionIndex !== undefined
                              ? optIdx === activeQuestion.correctOptionIndex
                              : activeQuestion.correctAnswer
                              ? opt.startsWith(activeQuestion.correctAnswer)
                              : false;

                          let btnStyle = isDark
                            ? 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800';

                          if (activeAnswer?.revealedAnswer) {
                            if (isCorrectChoice) {
                              btnStyle =
                                'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20';
                            } else if (isSelected && !isCorrectChoice) {
                              btnStyle = 'bg-rose-500 text-white border-rose-600';
                            } else {
                              btnStyle = isDark ? 'opacity-40 bg-slate-900' : 'opacity-40 bg-slate-100';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectMultipleChoice(activeQuestion, opt, optIdx)}
                              className={`p-3 rounded-2xl border text-left font-bold text-xs sm:text-sm transition-all flex items-start gap-2.5 ${btnStyle} ${
                                isSelected ? 'ring-2 ring-pink-400' : ''
                              }`}
                            >
                              <span
                                className={`w-6 h-6 rounded-lg font-black text-xs shrink-0 flex items-center justify-center ${
                                  activeAnswer?.revealedAnswer && isCorrectChoice
                                    ? 'bg-white text-emerald-700'
                                    : activeAnswer?.revealedAnswer && isSelected && !isCorrectChoice
                                    ? 'bg-white text-rose-700'
                                    : isDark
                                    ? 'bg-slate-700 text-pink-300'
                                    : 'bg-pink-100 text-pink-700'
                                }`}
                              >
                                {['A', 'B', 'C', 'D'][optIdx] || optIdx + 1}
                              </span>
                              <span className="flex-1 leading-snug">{opt}</span>
                              {activeAnswer?.revealedAnswer && isCorrectChoice && (
                                <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
                              )}
                              {activeAnswer?.revealedAnswer && isSelected && !isCorrectChoice && (
                                <XCircle className="w-4 h-4 shrink-0 text-white" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 2. TRUE / FALSE INTERACTION */}
                  {activeQuestion.type === 'true_false' && (
                    <div className="space-y-2 pt-1">
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Khẳng định trên là:
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {/* True Button */}
                        <button
                          onClick={() => handleSelectTrueFalse(activeQuestion, true)}
                          className={`py-3.5 px-4 rounded-2xl border font-black text-sm transition-all flex items-center justify-center gap-2 ${
                            activeAnswer?.revealedAnswer
                              ? activeQuestion.correctBoolean === true
                                ? 'bg-emerald-500 text-white border-emerald-600 shadow-md'
                                : activeAnswer.selection === true
                                ? 'bg-rose-500 text-white border-rose-600'
                                : isDark
                                ? 'opacity-40 bg-slate-800'
                                : 'opacity-40 bg-slate-100'
                              : isDark
                              ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-emerald-400'
                              : 'bg-white hover:bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs'
                          }`}
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          <span>ĐÚNG (True)</span>
                        </button>

                        {/* False Button */}
                        <button
                          onClick={() => handleSelectTrueFalse(activeQuestion, false)}
                          className={`py-3.5 px-4 rounded-2xl border font-black text-sm transition-all flex items-center justify-center gap-2 ${
                            activeAnswer?.revealedAnswer
                              ? activeQuestion.correctBoolean === false
                                ? 'bg-emerald-500 text-white border-emerald-600 shadow-md'
                                : activeAnswer.selection === false
                                ? 'bg-rose-500 text-white border-rose-600'
                                : isDark
                                ? 'opacity-40 bg-slate-800'
                                : 'opacity-40 bg-slate-100'
                              : isDark
                              ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-rose-400'
                              : 'bg-white hover:bg-rose-50 border-rose-300 text-rose-700 shadow-xs'
                          }`}
                        >
                          <XCircle className="w-5 h-5" />
                          <span>SAI (False)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 3. ESSAY INTERACTION */}
                  {activeQuestion.type === 'essay' && (
                    <div className="pt-2">
                      <button
                        onClick={() => handleToggleEssayAnswer(activeQuestion.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-colors ${
                          isDark
                            ? 'bg-slate-900 border-slate-700 text-amber-300 hover:bg-slate-800'
                            : 'bg-white border-amber-300 text-amber-800 hover:bg-amber-50'
                        }`}
                      >
                        <FileCheck className="w-4 h-4 text-amber-500" />
                        <span>
                          {activeAnswer?.revealedAnswer
                            ? 'Ẩn đáp án & Bareme thang điểm'
                            : 'Hiện đáp án chuẩn & Bareme gợi ý chấm'}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* EXPLANATION / SUGGESTED ANSWER CARD */}
                  {activeQuestion.suggestedAnswer &&
                    (activeAnswer?.revealedAnswer || activeQuestion.type === 'essay') && (
                      <div
                        className={`p-3 rounded-xl border text-xs leading-relaxed transition-all ${
                          activeAnswer?.isCorrect === true
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                            : activeAnswer?.isCorrect === false
                            ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                            : isDark
                            ? 'bg-slate-900/80 border-slate-700 text-slate-300'
                            : 'bg-white/80 border-amber-200 text-slate-700'
                        }`}
                      >
                        <strong className="block mb-0.5 text-amber-800 dark:text-amber-400">
                          💡 Gợi ý giải thích & Thang điểm:
                        </strong>
                        <p className="whitespace-pre-line">{activeQuestion.suggestedAnswer}</p>
                      </div>
                    )}

                  {/* Question Stepper Navigation Buttons (Next / Prev) */}
                  {questions.length > 1 && (
                    <div className="flex items-center justify-between pt-2 border-t border-amber-200/40 dark:border-slate-700/60">
                      <button
                        disabled={currentQIndex === 0}
                        onClick={() => {
                          setCurrentQIndex(prev => Math.max(0, prev - 1));
                          soundManager.playOptionSelect();
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 ${
                          currentQIndex === 0
                            ? 'opacity-40 cursor-not-allowed'
                            : isDark
                            ? 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                            : 'bg-white hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Câu trước
                      </button>

                      <span className="text-xs font-bold text-slate-500">
                        {currentQIndex + 1} trên {questions.length} câu
                      </span>

                      <button
                        disabled={currentQIndex >= questions.length - 1}
                        onClick={() => {
                          setCurrentQIndex(prev => Math.min(questions.length - 1, prev + 1));
                          soundManager.playOptionSelect();
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 ${
                          currentQIndex >= questions.length - 1
                            ? 'opacity-40 cursor-not-allowed'
                            : isDark
                            ? 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                            : 'bg-white hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        Câu kế tiếp
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Countdown Timer Bar */}
              <div className="mt-3 pt-3 border-t border-amber-200/60 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Clock
                    className={`w-4 h-4 ${
                      timeLeft <= 6 ? 'text-rose-500 animate-bounce' : 'text-amber-600 dark:text-amber-400'
                    }`}
                  />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Đồng hồ trả lời:
                  </span>
                  <span
                    className={`text-base font-black px-2.5 py-0.5 rounded-lg border ${
                      timeLeft <= 6
                        ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                        : isDark
                        ? 'bg-slate-900 text-amber-300 border-slate-700'
                        : 'bg-white text-amber-800 border-amber-300'
                    }`}
                  >
                    {timeLeft}s
                  </span>
                </div>

                {/* Timer Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 transition-colors ${
                      isDark
                        ? 'bg-slate-900 hover:bg-slate-700 border-slate-700 text-slate-200'
                        : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    {isTimerRunning ? (
                      <>
                        <Pause className="w-3.5 h-3.5 text-amber-500" />
                        Tạm dừng
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-emerald-500" />
                        Tiếp tục
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setTimeLeft(settings.answerTimerSeconds);
                      setIsTimerRunning(true);
                      soundManager.playToppingDrop();
                    }}
                    className={`p-1 rounded-lg border text-xs font-bold transition-colors ${
                      isDark
                        ? 'bg-slate-900 hover:bg-slate-700 border-slate-700 text-slate-200'
                        : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                    title="Đặt lại thời gian"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress bar visual */}
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 mt-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    timeLeft <= 6
                      ? 'bg-rose-500'
                      : timeLeft <= 15
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${timerPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Quick Grading & Feedback Section */}
          <div
            className={`p-4 rounded-2xl border space-y-3 ${
              isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-pink-500" />
                Đánh giá & Chấm điểm buổi học:
              </span>
              {selectedScore !== undefined && (
                <span className="text-xs font-black text-pink-600 dark:text-pink-400">
                  Tổng điểm: {selectedScore}đ ({gradeStatus})
                </span>
              )}
            </div>

            {/* Grading buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { score: 10, label: '10đ • Xuất sắc', status: 'Xuất sắc' as const, color: 'hover:border-emerald-500 hover:text-emerald-600' },
                { score: 8, label: '8đ • Đạt', status: 'Đạt' as const, color: 'hover:border-blue-500 hover:text-blue-600' },
                { score: 5, label: '5đ • Cần cố gắng', status: 'Cần cố gắng' as const, color: 'hover:border-amber-500 hover:text-amber-600' },
                { score: 0, label: '0đ • Chưa chuẩn bị', status: 'Chưa chuẩn bị' as const, color: 'hover:border-rose-500 hover:text-rose-600' }
              ].map(item => (
                <button
                  key={item.score}
                  onClick={() => handleScorePick(item.score, item.status)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-black transition-all ${item.color} ${
                    selectedScore === item.score
                      ? 'bg-pink-500 text-white border-pink-600 shadow-xs scale-[1.02]'
                      : isDark
                      ? 'bg-slate-800 border-slate-700 text-slate-300'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Teacher note input */}
            <input
              type="text"
              value={teacherNote}
              onChange={e => setTeacherNote(e.target.value)}
              placeholder="Ghi chú nhận xét (ví dụ: trả lời đúng trọng tâm câu hỏi, cộng 1 điểm phát biểu...)"
              className={`w-full px-3.5 py-2 rounded-xl text-xs border transition-colors outline-none focus:ring-2 focus:ring-pink-400 ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500'
                  : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400'
              }`}
            />
          </div>

          {/* Exclude option checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600 dark:text-slate-300 select-none">
              <input
                type="checkbox"
                checked={excludeThisStudent}
                onChange={e => setExcludeThisStudent(e.target.checked)}
                className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500 border-slate-300 cursor-pointer"
              />
              <span>Loại bạn này khỏi các lượt quay kế tiếp (né gọi trùng)</span>
            </label>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div
          className={`px-5 sm:px-6 py-3.5 border-t flex flex-wrap items-center justify-between gap-3 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-pink-50/40 border-pink-100'
          }`}
        >
          <button
            onClick={onClose}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-colors ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            Đóng (Không lưu)
          </button>

          <button
            id="btn-save-result"
            onClick={handleSaveAndClose}
            className="px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-md hover:shadow-pink-500/20 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <span>Lưu kết quả & Tiếp tục</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
