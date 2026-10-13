import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  RotateCcw,
  Clock,
  CheckSquare,
  Square,
  HelpCircle,
  Sparkles,
  Zap,
  Flame,
  Coffee,
  Volume2,
  VolumeX,
  Heart,
  Music,
  ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Student, AppSettings, QuestionPackage, Classroom, SuspenseTheme } from '../types';
import { QUESTION_PACKAGES, SUSPENSE_THEMES } from '../data/mockData';
import { soundManager } from '../utils/audio';
import { ClassDropdown } from './ClassDropdown';

interface ConveyorBeltProps {
  students: Student[];
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onSelectStudent: (student: Student) => void;
  onResetExclusions: () => void;
  classes?: Classroom[];
  activeClassId?: string;
  onSwitchClass?: (classId: string) => void;
  onOpenClassManager?: (tab?: 'classes' | 'word' | 'paste' | 'list') => void;
}

export const ConveyorBelt: React.FC<ConveyorBeltProps> = ({
  students,
  settings,
  onUpdateSettings,
  onSelectStudent,
  onResetExclusions,
  classes,
  activeClassId,
  onSwitchClass,
  onOpenClassManager
}) => {
  const isDark = settings.theme === 'dark';
  const availableStudents = students.filter(s => !s.isExcluded);

  const [isSpinning, setIsSpinning] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [spinProgress, setSpinProgress] = useState(0);
  const [shakingCup, setShakingCup] = useState(false);
  const [suspensePhase, setSuspensePhase] = useState<'idle' | 'running' | 'suspense' | 'locked'>('idle');
  const [isSuspenseMenuOpen, setIsSuspenseMenuOpen] = useState(false);

  const spinIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const suspenseMenuRef = useRef<HTMLDivElement | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
      soundManager.stopSuspenseSession();
    };
  }, []);

  // Close suspense menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suspenseMenuRef.current && !suspenseMenuRef.current.contains(e.target as Node)) {
        setIsSuspenseMenuOpen(false);
      }
    };
    if (isSuspenseMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSuspenseMenuOpen]);

  // Keyboard shortcut: Press Space to spin
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpinning && availableStudents.length > 0) {
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
          e.preventDefault();
          startSpin();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpinning, availableStudents]);

  const activePackage =
    QUESTION_PACKAGES.find(p => p.id === settings.selectedPackageId) || QUESTION_PACKAGES[0];

  const currentTheme = settings.suspenseTheme || 'millionaire';
  const currentThemeInfo =
    SUSPENSE_THEMES.find(t => t.id === currentTheme) || SUSPENSE_THEMES[0];

  const startSpin = () => {
    if (isSpinning || availableStudents.length === 0) return;

    setIsSpinning(true);
    setShakingCup(true);
    setSpinProgress(0);
    setSuspensePhase('running');
    setIsSuspenseMenuOpen(false);

    soundManager.playConveyorTick(1.0, currentTheme);
    soundManager.playToppingDrop();

    const totalDuration = settings.spinDurationSeconds * 1000;
    const startTime = Date.now();
    let currentInterval = 45;

    // Start background tension drone / roll for this suspense theme
    soundManager.startSuspenseSession(currentTheme, totalDuration);

    // Pick winning student index ahead of time
    const winnerRandomIndex = Math.floor(Math.random() * availableStudents.length);
    const winningStudent = availableStudents[winnerRandomIndex];

    let currentIndex = 0;
    let tickCount = 0;
    let heartbeatPlayedAt = 0;
    let riserTriggered = false;

    const runStep = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / totalDuration);
      setSpinProgress(progress);

      // Rapidly step through students
      currentIndex = (currentIndex + 1) % availableStudents.length;
      setHighlightedIndex(currentIndex);
      tickCount++;

      // Sound feedback with varying pitch based on theme
      if (tickCount % 2 === 0) {
        const pitchFactor = 1 + progress * 0.5;
        soundManager.playConveyorTick(pitchFactor, currentTheme);
      }

      if (progress < 0.50) {
        // High speed conveyor
        currentInterval = 45 + progress * 35;
      } else if (progress < 0.82) {
        // Decelerating & building tension
        setSuspensePhase('suspense');
        currentInterval = 80 + (progress - 0.50) * 450;

        // Theme-specific suspense pulse
        if (settings.suspenseSoundEnabled) {
          const beatInterval = Math.max(220, 480 - (progress - 0.50) * 400);
          if (elapsed - heartbeatPlayedAt > beatInterval) {
            if (currentTheme === 'drumroll') {
              soundManager.playDrumrollBurst(1.0 + progress * 0.5);
            } else if (currentTheme === 'squid_suspense') {
              soundManager.playTensionPing(tickCount);
            } else {
              soundManager.playHeartbeat(1.1 + progress * 0.4);
            }
            heartbeatPlayedAt = elapsed;
          }
        }

        if (tickCount % 4 === 0) {
          soundManager.playToppingDrop();
        }
      } else {
        // Final tense crawl before locking
        currentInterval = 230 + (progress - 0.82) * 1100;

        // Urgent rapid beats
        if (settings.suspenseSoundEnabled) {
          const beatInterval = Math.max(140, 220 - (progress - 0.82) * 450);
          if (elapsed - heartbeatPlayedAt > beatInterval) {
            if (currentTheme === 'drumroll') {
              soundManager.playDrumrollBurst(1.4 + progress * 0.6);
            } else if (currentTheme === 'squid_suspense') {
              soundManager.playTensionPing(tickCount);
            } else {
              soundManager.playHeartbeat(1.4 + progress * 0.5);
            }
            heartbeatPlayedAt = elapsed;
          }
        }

        // Suspense riser swell leading right to the reveal
        if (progress > 0.88 && !riserTriggered) {
          riserTriggered = true;
          soundManager.playSuspenseRiser(Math.max(0.6, (totalDuration - elapsed) / 1000));
        }
      }

      if (elapsed < totalDuration) {
        spinIntervalRef.current = setTimeout(runStep, currentInterval);
      } else {
        // FINAL REVEAL ON WINNER!
        setHighlightedIndex(winnerRandomIndex);
        setIsSpinning(false);
        setShakingCup(false);
        setSuspensePhase('locked');

        // DRAMATIC AUDIO IMPACT & VICTORY FANFARE
        if (settings.suspenseSoundEnabled) {
          soundManager.playDramaticReveal(currentTheme);
        }
        setTimeout(() => {
          soundManager.playTadaCelebration();
        }, 160);

        confetti({
          particleCount: 95,
          spread: 80,
          origin: { y: 0.58 },
          colors: ['#f472b6', '#fbbf24', '#a855f7', '#38bdf8', '#34d399', '#f43f5e']
        });

        // Trigger result modal after a brief suspense beat
        setTimeout(() => {
          onSelectStudent(winningStudent);
          setSuspensePhase('idle');
        }, 650);
      }
    };

    spinIntervalRef.current = setTimeout(runStep, currentInterval);
  };

  const currentHighlighted = availableStudents[highlightedIndex] || availableStudents[0];

  return (
    <div className="w-full flex flex-col items-center gap-5">
      {/* Conveyor Belt Machine Housing */}
      <div
        id="conveyor-machine"
        className={`w-full max-w-5xl rounded-3xl border-2 p-4 sm:p-7 relative overflow-hidden transition-all duration-300 shadow-xl ${
          suspensePhase === 'suspense'
            ? 'ring-4 ring-rose-500/40 animate-pulse'
            : suspensePhase === 'locked'
            ? 'ring-4 ring-amber-400'
            : ''
        } ${
          isDark
            ? 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 border-slate-700 shadow-pink-950/20'
            : 'bg-gradient-to-b from-amber-50/70 via-pink-50/60 to-orange-50/80 border-pink-200 shadow-pink-100'
        }`}
      >
        {/* Machine Top Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-pink-200/50 dark:border-slate-700/60">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                suspensePhase === 'suspense' ? 'bg-rose-500' : 'bg-pink-400'
              } opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${
                suspensePhase === 'suspense' ? 'bg-rose-600' : 'bg-pink-500'
              }`}></span>
            </span>
            <span className="font-extrabold text-xs sm:text-sm tracking-wider uppercase text-pink-600 dark:text-pink-400 font-['Comfortaa',cursive]">
              Dây Chuyền Trà Sữa
            </span>

            {/* In-machine Class Switcher Pill */}
            {classes && activeClassId && onSwitchClass && (
              <ClassDropdown
                classes={classes}
                activeClassId={activeClassId}
                onSwitchClass={onSwitchClass}
                onOpenClassManager={onOpenClassManager || (() => {})}
                isDark={isDark}
                variant="conveyor"
              />
            )}

            {suspensePhase === 'suspense' && (
              <span className="animate-bounce text-[11px] font-black px-2 py-0.5 rounded-full bg-rose-500 text-white flex items-center gap-1 shadow-sm">
                <Heart className="w-3 h-3 fill-current animate-pulse text-white" />
                Hồi Hộp Căng Thẳng!
              </span>
            )}
          </div>

          {/* Quick Stats Pill & Revival */}
          <div className="flex items-center gap-2 text-xs font-bold">
            <span
              className={`px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                availableStudents.length > 0
                  ? isDark
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : isDark
                  ? 'bg-rose-950/60 border-rose-800 text-rose-300'
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              Sẵn sàng: <strong className="font-black text-sm">{availableStudents.length}</strong> / {students.length}
            </span>

            {students.some(s => s.isExcluded) && (
              <button
                onClick={onResetExclusions}
                className={`px-2.5 py-1 rounded-full border text-xs font-bold transition-all flex items-center gap-1 ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-300'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
                title="Khôi phục tất cả học sinh đã loại trở lại băng chuyền"
              >
                <RotateCcw className="w-3 h-3" />
                Hồi sinh toàn bộ
              </button>
            )}
          </div>
        </div>

        {/* Central Display: The Giant Kawaii Boba Cup & Topping Scanner */}
        <div className="relative py-3 sm:py-6 flex flex-col items-center justify-center min-h-[280px] sm:min-h-[340px]">
          {/* Background Steam / Gears Animation */}
          <div className="absolute inset-0 flex items-center justify-between pointer-events-none opacity-25 dark:opacity-10 px-8">
            <div className={`w-36 h-36 rounded-full border-4 border-dashed border-pink-400 ${isSpinning ? 'animate-spin' : ''}`} />
            <div className={`w-48 h-48 rounded-full border-4 border-dashed border-amber-400 ${isSpinning ? 'animate-spin' : ''}`} style={{ animationDirection: 'reverse' }} />
          </div>

          {/* Central Boba Cup with Animated Student Topping */}
          <div className="relative flex flex-col items-center">
            {/* Boba Straw */}
            <div className="w-6 h-14 sm:h-18 bg-gradient-to-r from-pink-400 via-rose-300 to-pink-500 rounded-t-full -mb-3 z-10 shadow-md transform -rotate-12 origin-bottom flex items-center justify-center">
              <div className="w-1.5 h-full bg-white/40" />
            </div>

            {/* Cup Container */}
            <motion.div
              animate={
                shakingCup
                  ? {
                      rotate: suspensePhase === 'suspense' ? [-3, 3, -3, 2, 0] : [-1.5, 1.5, -1.5, 1, 0],
                      y: suspensePhase === 'suspense' ? [-4, 4, -3, 3, 0] : [-2, 2, -2, 1, 0],
                      scale: suspensePhase === 'suspense' ? [1, 1.04, 0.98, 1.02, 1] : [1, 1.01, 0.99, 1]
                    }
                  : { y: [0, -4, 0] }
              }
              transition={
                shakingCup
                  ? { repeat: Infinity, duration: suspensePhase === 'suspense' ? 0.12 : 0.18 }
                  : { repeat: Infinity, duration: 3, ease: 'easeInOut' }
              }
              className={`w-60 sm:w-72 h-64 sm:h-74 rounded-b-[42px] rounded-t-xl border-4 p-3 relative overflow-hidden flex flex-col justify-between shadow-2xl backdrop-blur-sm transition-all ${
                suspensePhase === 'suspense'
                  ? 'border-rose-500 shadow-rose-500/30'
                  : isDark
                  ? 'border-pink-500/60 bg-gradient-to-b from-slate-900/90 via-slate-800/95 to-slate-950 shadow-pink-900/30'
                  : 'border-pink-300 bg-gradient-to-b from-white/90 via-pink-50/90 to-amber-50/90 shadow-pink-200'
              }`}
            >
              {/* Cup Lid Seal */}
              <div className="w-full pb-2 border-b border-pink-300/40 dark:border-pink-800/50 flex items-center justify-between px-2">
                <span className="text-[11px] font-bold text-pink-500 dark:text-pink-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Size Siêu To 1000ml
                </span>
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  {settings.enableQuestions ? activePackage.shortName : 'Chỉ gọi tên'}
                </span>
              </div>

              {/* Center Student Avatar & Name inside the Cup */}
              <div className="flex-1 flex flex-col items-center justify-center text-center px-3 z-10">
                {availableStudents.length === 0 ? (
                  <div className="py-6 flex flex-col items-center gap-2">
                    <span className="text-4xl">🧋✨</span>
                    <p className="font-black text-base text-rose-500">Đã gọi hết cả lớp rồi!</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Nhấn "Hồi sinh toàn bộ" để tiếp tục vòng tiếp theo nhé thầy cô!
                    </p>
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentHighlighted?.id || 'empty'}
                      initial={{ scale: 0.82, opacity: 0.6, y: -8 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.9, opacity: 0.3, y: 8 }}
                      transition={{ duration: isSpinning ? 0.07 : 0.22 }}
                      className="w-full flex flex-col items-center"
                    >
                      {/* Topping Icon Bubble */}
                      <div
                        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-lg border-2 mb-2 transition-transform ${
                          suspensePhase === 'locked' ? 'scale-110 ring-4 ring-amber-400' : 'hover:scale-105'
                        }`}
                        style={{
                          backgroundColor: currentHighlighted?.topping.color || '#ff8787',
                          borderColor: '#ffffff'
                        }}
                      >
                        {currentHighlighted?.topping.emoji || '🧋'}
                      </div>

                      {/* Student Number & Topping Type */}
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-black bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800">
                          STT #{currentHighlighted?.code || '00'}
                        </span>
                        <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 truncate max-w-[140px]">
                          {currentHighlighted?.topping.name}
                        </span>
                      </div>

                      {/* Student Name */}
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white line-clamp-1 max-w-full">
                        {currentHighlighted?.name || 'Học Sinh Bí Ẩn'}
                      </h2>

                      {/* Fun Tagline */}
                      <p className="text-[11px] italic font-semibold text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                        "{currentHighlighted?.topping.tagline || 'Topping định mệnh hôm nay!'}"
                      </p>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>

              {/* Bottom Liquid Wave & Boba Pearls inside the Cup */}
              <div className="relative w-full h-14 rounded-b-[30px] overflow-hidden -mx-3 -mb-3 px-3 pb-2 bg-gradient-to-t from-amber-700/80 via-amber-600/70 to-pink-400/50 flex items-end justify-around">
                {[...Array(7)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={
                      isSpinning
                        ? {
                            y: [0, -14 - (i % 3) * 6, 0],
                            x: [(i % 2 === 0 ? -3 : 3), 0]
                          }
                        : { y: [0, -3, 0] }
                    }
                    transition={{
                      repeat: Infinity,
                      duration: isSpinning ? 0.28 + (i % 4) * 0.08 : 1.8 + i * 0.2,
                      ease: 'easeInOut'
                    }}
                    className="w-4 h-4 rounded-full bg-slate-950 border border-amber-900 shadow-inner"
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* The Animated Conveyor Belt Track Below */}
        <div className="w-full mt-2">
          <div className="relative h-14 sm:h-16 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-900 overflow-hidden flex items-center shadow-inner">
            <div
              className={`absolute inset-0 opacity-40 bg-[radial-gradient(#ec4899_1px,transparent_1px)] [background-size:16px_16px] ${
                isSpinning ? 'animate-pulse' : ''
              }`}
            />

            {/* Horizontal Topping Parade */}
            <div className="flex items-center gap-3 px-4 w-full overflow-hidden justify-center">
              {availableStudents.slice(0, 10).map((st, idx) => (
                <div
                  key={st.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-extrabold whitespace-nowrap transition-all ${
                    idx === (highlightedIndex % Math.min(10, availableStudents.length))
                      ? 'scale-110 bg-pink-500 text-white border-pink-400 shadow-md'
                      : isDark
                      ? 'bg-slate-800 border-slate-700 text-slate-300'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <span>{st.topping.emoji}</span>
                  <span className="truncate max-w-[90px] sm:max-w-[120px]">{st.name}</span>
                </div>
              ))}
            </div>

            {/* Moving track lines */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-400 via-amber-400 to-pink-500 animate-gradient" />
          </div>

          {/* Progress Bar during spin */}
          {isSpinning && (
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-75 ${
                  suspensePhase === 'suspense'
                    ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-red-600'
                    : 'bg-gradient-to-r from-pink-500 via-amber-500 to-pink-600'
                }`}
                style={{ width: `${spinProgress * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* PACKAGE SELECTOR BAR: REQUIREMENT 1 */}
        <div className="mt-5 pt-4 border-t border-pink-200/60 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-pink-600 dark:text-pink-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                Gói Câu Hỏi Buổi Học:
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:inline">
                (Tùy chọn số lượng câu đố vui hoặc dò bài)
              </span>
            </div>

            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 italic">
              {activePackage.description}
            </div>
          </div>

          {/* Package Pills Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {QUESTION_PACKAGES.map(pkg => {
              const isSelected = settings.selectedPackageId === pkg.id;
              return (
                <button
                  key={pkg.id}
                  disabled={isSpinning}
                  onClick={() => {
                    onUpdateSettings({ selectedPackageId: pkg.id, enableQuestions: true });
                    soundManager.playOptionSelect();
                  }}
                  className={`p-2.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                    isSelected
                      ? 'border-pink-500 bg-pink-500 text-white shadow-md shadow-pink-500/20 scale-[1.02]'
                      : isDark
                      ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200'
                      : 'bg-white hover:bg-pink-50/60 border-pink-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm">{pkg.icon}</span>
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-pink-100 dark:bg-slate-700 text-pink-700 dark:text-pink-300'
                      }`}
                    >
                      {pkg.questionCount} câu
                    </span>
                  </div>
                  <p className={`font-black text-xs mt-1 truncate ${isSelected ? 'text-white' : ''}`}>
                    {pkg.name}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Master Control Bar */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 pt-3">
          {/* Left: Quick options & features toggles */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            {/* Spin Duration Selector */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${
                isDark ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-pink-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-pink-500" />
              <span className="text-slate-500 dark:text-slate-400">Quay:</span>
              {[2, 3, 5, 8].map(sec => (
                <button
                  key={sec}
                  disabled={isSpinning}
                  onClick={() => {
                    onUpdateSettings({ spinDurationSeconds: sec });
                    soundManager.playConveyorTick(1.1);
                  }}
                  className={`px-1.5 py-0.5 rounded-lg text-xs font-extrabold transition-all ${
                    settings.spinDurationSeconds === sec
                      ? 'bg-pink-500 text-white shadow-xs'
                      : isDark
                      ? 'text-slate-300 hover:bg-slate-700'
                      : 'text-slate-600 hover:bg-pink-100'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>

            {/* Auto Exclude Toggle */}
            <button
              disabled={isSpinning}
              onClick={() => {
                onUpdateSettings({ autoExcludeCalled: !settings.autoExcludeCalled });
                soundManager.playToppingDrop();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                settings.autoExcludeCalled
                  ? isDark
                    ? 'bg-pink-950/80 border-pink-700 text-pink-300'
                    : 'bg-pink-50 border-pink-300 text-pink-800'
                  : isDark
                  ? 'bg-slate-800/80 border-slate-700 text-slate-400'
                  : 'bg-white border-slate-200 text-slate-500'
              }`}
              title="Tự động loại học sinh sau khi gọi để không bị trùng lặp"
            >
              {settings.autoExcludeCalled ? (
                <CheckSquare className="w-4 h-4 text-pink-500" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              <span>Loại tên đã gọi</span>
            </button>

            {/* Suspense Sound Toggle & Theme Selector */}
            <div className="flex items-center gap-1.5" ref={suspenseMenuRef}>
              <button
                disabled={isSpinning}
                onClick={() => {
                  const nextSuspense = !settings.suspenseSoundEnabled;
                  onUpdateSettings({ suspenseSoundEnabled: nextSuspense });
                  soundManager.setConfig(settings.soundEnabled, settings.soundVolume, nextSuspense);
                  if (nextSuspense) {
                    soundManager.playSuspensePreview(settings.suspenseTheme || 'millionaire');
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  settings.suspenseSoundEnabled
                    ? isDark
                      ? 'bg-rose-950/80 border-rose-700 text-rose-300'
                      : 'bg-rose-50 border-rose-300 text-rose-800'
                    : isDark
                    ? 'bg-slate-800/80 border-slate-700 text-slate-400'
                    : 'bg-white border-slate-200 text-slate-500'
                }`}
                title="Bật/Tắt hiệu ứng âm thanh hồi hộp kịch tính"
              >
                <Heart
                  className={`w-3.5 h-3.5 ${
                    settings.suspenseSoundEnabled ? 'fill-current text-rose-500 animate-pulse' : ''
                  }`}
                />
                <span>Âm hồi hộp</span>
              </button>

              {/* Quick Suspense Sound Theme Selector */}
              {settings.suspenseSoundEnabled && (
                <div className="relative">
                  <button
                    disabled={isSpinning}
                    onClick={() => setIsSuspenseMenuOpen(!isSuspenseMenuOpen)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-black transition-all ${
                      isDark
                        ? 'bg-slate-800 border-rose-800 text-rose-300 hover:bg-slate-700'
                        : 'bg-white border-rose-300 text-rose-700 hover:bg-rose-50 shadow-xs'
                    }`}
                    title="Bấm để đổi kiểu âm thanh hồi hộp khác"
                  >
                    <span>{currentThemeInfo.icon}</span>
                    <span className="max-w-[120px] truncate">{currentThemeInfo.shortName}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${
                        isSuspenseMenuOpen ? 'rotate-180 text-rose-500' : 'text-slate-400'
                      }`}
                    />
                  </button>

                  {/* Suspense Theme Dropdown Popover */}
                  <AnimatePresence>
                    {isSuspenseMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute bottom-full left-0 mb-2 w-72 sm:w-80 rounded-2xl border-2 shadow-2xl p-3 z-50 overflow-hidden ${
                          isDark
                            ? 'bg-slate-900 border-rose-800/80 text-white'
                            : 'bg-white border-rose-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80 dark:border-slate-800">
                          <div className="flex items-center gap-1.5">
                            <Flame className="w-4 h-4 text-amber-500 fill-current" />
                            <span className="font-extrabold text-xs">Đổi Kiểu Âm Thanh Hồi Hộp</span>
                          </div>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500 text-white">
                            4 Kiểu
                          </span>
                        </div>

                        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                          {SUSPENSE_THEMES.map(theme => {
                            const isSelected = currentTheme === theme.id;
                            return (
                              <div
                                key={theme.id}
                                className={`p-2 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                                  isSelected
                                    ? 'border-rose-500 bg-rose-50/90 dark:bg-rose-950/60 ring-1 ring-rose-400'
                                    : isDark
                                    ? 'border-slate-800 hover:bg-slate-800 text-slate-300'
                                    : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    onUpdateSettings({ suspenseTheme: theme.id });
                                    soundManager.playSuspensePreview(theme.id);
                                    setIsSuspenseMenuOpen(false);
                                  }}
                                  className="flex-1 text-left flex items-start gap-2"
                                >
                                  <span className="text-lg leading-none mt-0.5">{theme.icon}</span>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <p className="font-black text-xs text-slate-800 dark:text-white">
                                        {theme.shortName}
                                      </p>
                                      {isSelected && (
                                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-rose-500 text-white">
                                          Đang chọn
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                      {theme.tagline}
                                    </p>
                                  </div>
                                </button>

                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation();
                                    onUpdateSettings({ suspenseTheme: theme.id });
                                    soundManager.playSuspensePreview(theme.id);
                                  }}
                                  className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 hover:bg-rose-200 transition-colors shrink-0"
                                  title="Nghe thử âm thanh này"
                                >
                                  <Play className="w-3 h-3 fill-current" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* Right: Big CTA Spin Button */}
          <div className="flex items-center gap-3">
            <button
              id="btn-spin-conveyor"
              disabled={isSpinning || availableStudents.length === 0}
              onClick={startSpin}
              className={`px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black text-sm sm:text-base tracking-wide flex items-center gap-2.5 shadow-lg transition-all transform active:scale-95 ${
                availableStudents.length === 0
                  ? 'bg-slate-400 cursor-not-allowed text-white opacity-60'
                  : isSpinning
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white animate-pulse'
                  : 'bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white hover:shadow-pink-500/30 hover:scale-[1.02]'
              }`}
            >
              {isSpinning ? (
                <>
                  <Zap className="w-5 h-5 animate-spin" />
                  <span>Đang Quay Dây Chuyền...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>RÓT TRÀ & GỌI TÊN</span>
                  <span className="hidden md:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/20 uppercase">
                    Space
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
