import React from 'react';
import {
  FileText,
  HelpCircle,
  History,
  Settings as SettingsIcon,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Maximize,
  Sparkles,
  Users,
  GraduationCap
} from 'lucide-react';
import { AppSettings, Student, Classroom } from '../types';
import { soundManager } from '../utils/audio';
import { ClassDropdown } from './ClassDropdown';

interface HeaderProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  students: Student[];
  calledCount: number;
  classes: Classroom[];
  activeClassId: string;
  onSwitchClass: (classId: string) => void;
  onOpenStudentModal: (tab?: 'classes' | 'word' | 'paste' | 'list') => void;
  onOpenQuestionModal: () => void;
  onOpenHistoryModal: () => void;
  onOpenSettingsModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  students,
  calledCount,
  classes,
  activeClassId,
  onSwitchClass,
  onOpenStudentModal,
  onOpenQuestionModal,
  onOpenHistoryModal,
  onOpenSettingsModal,
}) => {
  const isDark = settings.theme === 'dark';
  const remainingCount = students.filter(s => !s.isExcluded).length;
  const activeClass = classes.find(c => c.id === activeClassId) || classes[0];

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    onUpdateSettings({ theme: nextTheme });
    soundManager.playToppingDrop();
  };

  const toggleSound = () => {
    const nextSound = !settings.soundEnabled;
    onUpdateSettings({ soundEnabled: nextSound });
    soundManager.setConfig(nextSound, settings.soundVolume);
    if (nextSound) {
      soundManager.playConveyorTick(1.2);
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header
      id="app-header"
      className={`border-b transition-colors duration-200 sticky top-0 z-30 ${
        isDark
          ? 'bg-slate-900/95 border-slate-800 text-slate-100 backdrop-blur-md'
          : 'bg-white/95 border-pink-100 text-slate-800 backdrop-blur-md shadow-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Brand & Quick Class Selector */}
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-sm border transition-transform hover:scale-105 ${
              isDark
                ? 'bg-gradient-to-br from-pink-500 to-amber-600 border-pink-400/30'
                : 'bg-gradient-to-br from-pink-400 to-amber-300 border-pink-200'
            }`}
          >
            🧋
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight font-['Comfortaa',cursive] text-pink-600 dark:text-pink-400 flex items-center gap-1.5">
                Né Sao Được
                <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800">
                  THPT
                </span>
              </h1>
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Dây Chuyền Trà Sữa Thất Lạc Topping
            </p>
          </div>

          {/* Quick Class Dropdown in Header */}
          <div className="hidden sm:block ml-2 pl-3 border-l border-slate-200 dark:border-slate-800">
            <ClassDropdown
              classes={classes}
              activeClassId={activeClassId}
              onSwitchClass={onSwitchClass}
              onOpenClassManager={onOpenStudentModal}
              isDark={isDark}
              variant="header"
            />
          </div>
        </div>

        {/* Quick Classroom Status Pills */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-bold">
          <div
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
              isDark
                ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                : 'bg-pink-50/80 border-pink-200 text-pink-800'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-pink-500" />
            <span>Băng chuyền:</span>
            <strong className="text-pink-600 dark:text-pink-400">{remainingCount}</strong>
            <span className="text-slate-400">/{students.length} bạn</span>
          </div>

          <button
            id="btn-quick-history"
            onClick={onOpenHistoryModal}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-colors ${
              isDark
                ? 'bg-slate-800/80 hover:bg-slate-750 border-slate-700 text-amber-300'
                : 'bg-amber-50 hover:bg-amber-100/80 border-amber-200 text-amber-900'
            }`}
          >
            <History className="w-3.5 h-3.5 text-amber-500" />
            <span>Đã gọi:</span>
            <strong className="text-amber-600 dark:text-amber-400">{calledCount}</strong>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile Class Switcher button */}
          <div className="sm:hidden">
            <ClassDropdown
              classes={classes}
              activeClassId={activeClassId}
              onSwitchClass={onSwitchClass}
              onOpenClassManager={onOpenStudentModal}
              isDark={isDark}
              variant="header"
            />
          </div>

          {/* Word Import / Student List */}
          <button
            id="btn-manage-students"
            onClick={() => onOpenStudentModal('classes')}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-xs border ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-pink-300'
                : 'bg-white hover:bg-pink-50 border-pink-200 text-pink-700'
            }`}
            title="Quản lý nhiều lớp & danh sách học sinh"
          >
            <GraduationCap className="w-4 h-4 text-pink-500" />
            <span className="hidden sm:inline">Lớp & Học sinh</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-md bg-pink-100 dark:bg-pink-900/60 text-pink-700 dark:text-pink-300 font-extrabold">
              {classes.length} Lớp
            </span>
          </button>

          {/* Question Bank */}
          <button
            id="btn-question-bank"
            onClick={onOpenQuestionModal}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-xs border ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-300'
                : 'bg-white hover:bg-amber-50 border-amber-200 text-amber-800'
            }`}
            title="Ngân hàng câu hỏi bài học"
          >
            <HelpCircle className="w-4 h-4 text-amber-500" />
            <span className="hidden md:inline">Câu hỏi</span>
          </button>

          {/* History & Export PDF */}
          <button
            id="btn-history-pdf"
            onClick={onOpenHistoryModal}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-xs border ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-blue-300'
                : 'bg-white hover:bg-blue-50 border-blue-200 text-blue-700'
            }`}
            title="Lịch sử gọi tên & Xuất file PDF"
          >
            <History className="w-4 h-4 text-blue-500" />
            <span className="hidden md:inline">Kết quả</span>
            {calledCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            )}
          </button>

          {/* Sound Toggle */}
          <button
            id="btn-toggle-sound"
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition-colors ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
            title={settings.soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh vui nhộn'}
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-pink-500" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            id="btn-toggle-theme"
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-colors ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-400'
                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
            title={isDark ? 'Chuyển sang chế độ sáng' : 'Chế độ tối (Dịu mắt ban đêm)'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Settings */}
          <button
            id="btn-open-settings"
            onClick={onOpenSettingsModal}
            className={`p-2 rounded-xl border transition-colors ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
            title="Cài đặt thời gian & cơ chế quay"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          {/* Projector Fullscreen */}
          <button
            id="btn-toggle-fullscreen"
            onClick={handleToggleFullscreen}
            className={`hidden sm:flex p-2 rounded-xl border transition-colors ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400 hover:text-slate-200'
                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800'
            }`}
            title="Tràn màn hình cho máy chiếu lớp học"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
