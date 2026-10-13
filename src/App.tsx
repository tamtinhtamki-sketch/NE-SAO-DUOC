import React, { useState, useEffect } from 'react';
import { Student, Question, CallRecord, AppSettings, QuestionPackage, Classroom } from './types';
import { DEFAULT_CLASSES, DEFAULT_QUESTIONS, QUESTION_PACKAGES } from './data/mockData';
import { Header } from './components/Header';
import { ConveyorBelt } from './components/ConveyorBelt';
import { ResultModal } from './components/ResultModal';
import { StudentManagerModal } from './components/StudentManagerModal';
import { QuestionBankModal } from './components/QuestionBankModal';
import { HistoryLogModal } from './components/HistoryLogModal';
import { SettingsModal } from './components/SettingsModal';
import { soundManager } from './utils/audio';

const STORAGE_KEYS = {
  CLASSES: 'ne_sao_duoc_classes_v2',
  ACTIVE_CLASS_ID: 'ne_sao_duoc_active_class_id_v2',
  STUDENTS: 'ne_sao_duoc_students_v2',
  QUESTIONS: 'ne_sao_duoc_questions_v2',
  RECORDS: 'ne_sao_duoc_records_v2',
  SETTINGS: 'ne_sao_duoc_settings_v2'
};

const DEFAULT_SETTINGS: AppSettings = {
  spinDurationSeconds: 3,
  answerTimerSeconds: 30,
  autoExcludeCalled: true,
  soundEnabled: true,
  soundVolume: 0.8,
  suspenseSoundEnabled: true,
  suspenseTheme: 'millionaire',
  enableQuestions: true,
  questionMode: 'random',
  selectedPackageId: 'pkg-dovui',
  theme: 'light',
  className: 'Lớp 12A1',
  subjectName: 'Toán Học & KHTN',
  activeClassId: 'class-12a1'
};

export default function App() {
  // 1. Multi-class list state
  const [classes, setClasses] = useState<Classroom[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLASSES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}

    // Backward compatibility: migrate legacy single-list students into class-12a1 if available
    try {
      const legacyStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (legacyStudents) {
        const parsedSt = JSON.parse(legacyStudents);
        if (Array.isArray(parsedSt) && parsedSt.length > 0) {
          return [
            {
              id: 'class-12a1',
              name: 'Lớp 12A1',
              subject: 'Toán Học & KHTN',
              students: parsedSt,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            ...DEFAULT_CLASSES.filter(c => c.id !== 'class-12a1')
          ];
        }
      }
    } catch {}

    return DEFAULT_CLASSES;
  });

  // 2. Active class ID state
  const [activeClassId, setActiveClassId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEYS.ACTIVE_CLASS_ID);
      if (savedId) return savedId;
    } catch {}
    return 'class-12a1';
  });

  // Derived active class and current students
  const activeClass = classes.find(c => c.id === activeClassId) || classes[0] || DEFAULT_CLASSES[0];
  const students = activeClass ? activeClass.students : [];

  // Question bank state
  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      return saved ? JSON.parse(saved) : DEFAULT_QUESTIONS;
    } catch {
      return DEFAULT_QUESTIONS;
    }
  });

  // History records state
  const [records, setRecords] = useState<CallRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECORDS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Settings state
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Modal open states
  const [activePickedStudent, setActivePickedStudent] = useState<Student | null>(null);
  const [activePickedQuestions, setActivePickedQuestions] = useState<Question[]>([]);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentModalTab, setStudentModalTab] = useState<'classes' | 'word' | 'paste' | 'list'>('classes');
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Sequential question pointer
  const [sequentialQuestionIndex, setSequentialQuestionIndex] = useState(0);

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
    } catch {}
  }, [classes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CLASS_ID, activeClassId);
    } catch {}
  }, [activeClassId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch {}
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
    } catch {}
  }, [questions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    } catch {}
  }, [records]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Sync theme class with document root
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    soundManager.setConfig(settings.soundEnabled, settings.soundVolume, settings.suspenseSoundEnabled);
  }, [settings.theme, settings.soundEnabled, settings.soundVolume, settings.suspenseSoundEnabled]);

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Switch to another class
  const handleSwitchClass = (classId: string) => {
    const target = classes.find(c => c.id === classId);
    if (!target) return;
    setActiveClassId(classId);
    setSettings(prev => ({
      ...prev,
      className: target.name,
      subjectName: target.subject || prev.subjectName,
      activeClassId: target.id
    }));
    soundManager.playOptionSelect();
  };

  // Update students of the active class
  const handleUpdateActiveStudents = (newStudents: Student[]) => {
    setClasses(prev =>
      prev.map(cls =>
        cls.id === activeClass.id
          ? { ...cls, students: newStudents, updatedAt: new Date().toISOString() }
          : cls
      )
    );
  };

  // Create a new class
  const handleCreateClass = (name: string, subject = 'Tiết Học Hào Hứng', initialStudents: Student[] = []): string => {
    const newId = `class-${Date.now()}`;
    const newClass: Classroom = {
      id: newId,
      name,
      subject,
      students: initialStudents,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setClasses(prev => [...prev, newClass]);
    setActiveClassId(newId);
    setSettings(prev => ({
      ...prev,
      className: name,
      subjectName: subject,
      activeClassId: newId
    }));
    return newId;
  };

  // Update class name or subject
  const handleUpdateClassInfo = (classId: string, updates: Partial<Classroom>) => {
    setClasses(prev =>
      prev.map(c => (c.id === classId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    );
    if (classId === activeClassId && updates.name) {
      setSettings(prev => ({
        ...prev,
        className: updates.name!,
        subjectName: updates.subject !== undefined ? updates.subject : prev.subjectName
      }));
    }
  };

  // Delete a class
  const handleDeleteClass = (classId: string) => {
    if (classes.length <= 1) return;
    const remaining = classes.filter(c => c.id !== classId);
    setClasses(remaining);
    if (activeClassId === classId) {
      const nextActive = remaining[0];
      setActiveClassId(nextActive.id);
      setSettings(prev => ({
        ...prev,
        className: nextActive.name,
        subjectName: nextActive.subject || prev.subjectName,
        activeClassId: nextActive.id
      }));
    }
    soundManager.playToppingDrop();
  };

  // Duplicate an existing class
  const handleDuplicateClass = (classId: string) => {
    const target = classes.find(c => c.id === classId);
    if (!target) return;
    const newId = `class-${Date.now()}`;
    const duplicatedStudents: Student[] = target.students.map(s => ({
      ...s,
      id: `st-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      calledCount: 0,
      isExcluded: false,
      lastScore: undefined,
      lastGradedAt: undefined
    }));

    const newClass: Classroom = {
      id: newId,
      name: `${target.name} (Bản sao)`,
      subject: target.subject,
      students: duplicatedStudents,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setClasses(prev => [...prev, newClass]);
    setActiveClassId(newId);
    setSettings(prev => ({
      ...prev,
      className: newClass.name,
      subjectName: newClass.subject || prev.subjectName,
      activeClassId: newId
    }));
    soundManager.playCorrectSound();
  };

  // Save current active students as a brand new class
  const handleSaveCurrentAsNewClass = (name: string, subject = 'Tiết Học Hào Hứng') => {
    handleCreateClass(name, subject, [...students]);
  };

  const handleOpenStudentModal = (tab: 'classes' | 'word' | 'paste' | 'list' = 'classes') => {
    setStudentModalTab(tab);
    setIsStudentModalOpen(true);
  };

  // Select questions for the active package
  const getQuestionsForPackage = (packageId: string): Question[] => {
    if (!settings.enableQuestions || questions.length === 0) return [];

    const pkg = QUESTION_PACKAGES.find(p => p.id === packageId) || QUESTION_PACKAGES[0];
    const count = Math.min(pkg.questionCount, questions.length);

    let pool = questions;
    if (pkg.categoryFilter) {
      const filtered = questions.filter(
        q =>
          q.category?.toLowerCase().includes(pkg.categoryFilter!.toLowerCase()) ||
          q.packageTag === pkg.id.replace('pkg-', '')
      );
      if (filtered.length >= count) {
        pool = filtered;
      }
    }

    if (settings.questionMode === 'random') {
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    } else {
      const picked: Question[] = [];
      for (let i = 0; i < count; i++) {
        picked.push(pool[(sequentialQuestionIndex + i) % pool.length]);
      }
      setSequentialQuestionIndex(prev => (prev + count) % pool.length);
      return picked;
    }
  };

  // Called when conveyor belt finishes spinning and locks in a student
  const handleSelectStudent = (student: Student) => {
    setActivePickedStudent(student);
    const bundle = getQuestionsForPackage(settings.selectedPackageId);
    setActivePickedQuestions(bundle);
  };

  // Save call record to history log and update student stats in active class
  const handleSaveResult = (record: CallRecord, excludeStudent: boolean) => {
    setRecords(prev => [record, ...prev]);

    setClasses(prev =>
      prev.map(cls => {
        if (cls.id === activeClass.id) {
          const updatedStudents = cls.students.map(s => {
            if (s.id === record.studentId) {
              return {
                ...s,
                calledCount: s.calledCount + 1,
                lastScore: record.score,
                lastGradedAt: record.timestamp,
                isExcluded: excludeStudent ? true : s.isExcluded
              };
            }
            return s;
          });
          return { ...cls, students: updatedStudents, updatedAt: new Date().toISOString() };
        }
        return cls;
      })
    );

    setActivePickedStudent(null);
    setActivePickedQuestions([]);
  };

  const handleResetExclusions = () => {
    handleUpdateActiveStudents(students.map(s => ({ ...s, isExcluded: false })));
    soundManager.playCorrectSound();
  };

  const handleClearHistory = () => {
    setRecords([]);
    soundManager.playToppingDrop();
  };

  const activePackage =
    QUESTION_PACKAGES.find(p => p.id === settings.selectedPackageId) || QUESTION_PACKAGES[0];

  const isDark = settings.theme === 'dark';

  return (
    <div
      className={`min-h-screen transition-colors duration-200 flex flex-col ${
        isDark
          ? 'bg-slate-950 text-slate-100 selection:bg-pink-900 selection:text-pink-100'
          : 'bg-gradient-to-b from-rose-50/50 via-amber-50/40 to-pink-50/60 text-slate-800 selection:bg-pink-200 selection:text-pink-900'
      }`}
    >
      {/* Header Bar */}
      <Header
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        students={students}
        calledCount={records.length}
        classes={classes}
        activeClassId={activeClass.id}
        onSwitchClass={handleSwitchClass}
        onOpenStudentModal={handleOpenStudentModal}
        onOpenQuestionModal={() => setIsQuestionModalOpen(true)}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Content Arena */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-7 flex flex-col items-center justify-center">
        {/* The Milk Tea Conveyor Belt Machine */}
        <ConveyorBelt
          students={students}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onSelectStudent={handleSelectStudent}
          onResetExclusions={handleResetExclusions}
          classes={classes}
          activeClassId={activeClass.id}
          onSwitchClass={handleSwitchClass}
          onOpenClassManager={handleOpenStudentModal}
        />
      </main>

      {/* Footnote / Classroom Tagline */}
      <footer
        className={`py-3 border-t text-center text-xs font-semibold ${
          isDark
            ? 'border-slate-800/80 text-slate-500 bg-slate-950'
            : 'border-pink-100 text-slate-400 bg-white/50'
        }`}
      >
        <p>
          🧋 <strong>Né Sao Được</strong> • Dây Chuyền Trà Sữa Thất Lạc Topping • Đang dùng <strong>{activeClass?.name}</strong> ({students.length} học sinh) • Quản lý {classes.length} lớp học tiện lợi
        </p>
      </footer>

      {/* RESULT MODAL (WHEN STUDENT IS PICKED) */}
      {activePickedStudent && (
        <ResultModal
          student={activePickedStudent}
          questions={activePickedQuestions}
          currentPackage={activePackage}
          allPackages={QUESTION_PACKAGES}
          settings={settings}
          onClose={() => {
            setActivePickedStudent(null);
            setActivePickedQuestions([]);
          }}
          onSaveResult={handleSaveResult}
          onPickAnotherQuestions={() => {
            const bundle = getQuestionsForPackage(settings.selectedPackageId);
            setActivePickedQuestions(bundle);
            soundManager.playToppingDrop();
          }}
          onSelectPackage={(pkgId: string) => {
            handleUpdateSettings({ selectedPackageId: pkgId });
            const bundle = getQuestionsForPackage(pkgId);
            setActivePickedQuestions(bundle);
            soundManager.playOptionSelect();
          }}
        />
      )}

      {/* STUDENT MANAGER MODAL (MULTI-CLASS, WORD FILE IMPORT & TOPPINGS) */}
      {isStudentModalOpen && (
        <StudentManagerModal
          isOpen={isStudentModalOpen}
          onClose={() => setIsStudentModalOpen(false)}
          students={students}
          onUpdateStudents={handleUpdateActiveStudents}
          classes={classes}
          activeClassId={activeClass.id}
          onSwitchClass={handleSwitchClass}
          onCreateClass={handleCreateClass}
          onUpdateClassInfo={handleUpdateClassInfo}
          onDeleteClass={handleDeleteClass}
          onDuplicateClass={handleDuplicateClass}
          onSaveCurrentAsNewClass={handleSaveCurrentAsNewClass}
          initialTab={studentModalTab}
          isDark={isDark}
        />
      )}

      {/* QUESTION BANK MODAL */}
      {isQuestionModalOpen && (
        <QuestionBankModal
          isOpen={isQuestionModalOpen}
          onClose={() => setIsQuestionModalOpen(false)}
          questions={questions}
          onUpdateQuestions={setQuestions}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          isDark={isDark}
        />
      )}

      {/* HISTORY & EXPORT PDF MODAL */}
      {isHistoryModalOpen && (
        <HistoryLogModal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          records={records}
          allStudents={students}
          settings={settings}
          onClearHistory={handleClearHistory}
          isDark={isDark}
        />
      )}

      {/* SETTINGS MODAL */}
      {isSettingsModalOpen && (
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
        />
      )}
    </div>
  );
}
