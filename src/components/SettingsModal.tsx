import React from 'react';
import { motion } from 'motion/react';
import {
  X,
  Settings as SettingsIcon,
  Clock,
  Volume2,
  Moon,
  Sun,
  School,
  Sparkles,
  Heart,
  Zap,
  BookOpen,
  Play,
  Check,
  Flame,
  Music
} from 'lucide-react';
import { AppSettings, SuspenseTheme } from '../types';
import { QUESTION_PACKAGES, SUSPENSE_THEMES } from '../data/mockData';
import { soundManager } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  if (!isOpen) return null;

  const isDark = settings.theme === 'dark';

  const handleTestSound = () => {
    soundManager.playTadaCelebration();
  };

  const handleTestSuspense = () => {
    soundManager.playHeartbeat(1.4);
    setTimeout(() => {
      soundManager.playSuspenseRiser();
    }, 300);
    setTimeout(() => {
      soundManager.playDramaticReveal();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={`w-full max-w-lg rounded-3xl border-2 shadow-2xl overflow-hidden my-4 transition-colors ${
          isDark
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-white border-pink-200 text-slate-800'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            <div>
              <h3 className="font-extrabold text-base sm:text-lg font-['Comfortaa',cursive]">
                Cài Đặt Né Sao Được
              </h3>
              <p className="text-xs text-pink-100 font-semibold">
                Thời gian, gói câu hỏi, âm thanh hồi hộp và giao diện
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Class and Subject */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <School className="w-4 h-4 text-pink-500" />
              Thông Tin Buổi Học
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Tên Lớp:
                </label>
                <input
                  type="text"
                  value={settings.className}
                  onChange={e => onUpdateSettings({ className: e.target.value })}
                  placeholder="Ví dụ: Lớp 12A1"
                  className={`w-full px-3.5 py-2 rounded-xl text-xs font-bold border outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Môn Học:
                </label>
                <input
                  type="text"
                  value={settings.subjectName}
                  onChange={e => onUpdateSettings({ subjectName: e.target.value })}
                  placeholder="Ví dụ: Toán, Ngữ Văn, Tiếng Anh..."
                  className={`w-full px-3.5 py-2 rounded-xl text-xs font-bold border outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Default Question Package Setting */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-500" />
              Gói Câu Hỏi Mặc Định
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {QUESTION_PACKAGES.map(pkg => (
                <button
                  key={pkg.id}
                  onClick={() => onUpdateSettings({ selectedPackageId: pkg.id })}
                  className={`p-2.5 rounded-2xl border text-left transition-all ${
                    settings.selectedPackageId === pkg.id
                      ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/40 text-pink-900 dark:text-pink-300 font-black'
                      : isDark
                      ? 'bg-slate-800 border-slate-700 text-slate-300'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{pkg.icon}</span>
                    <span className="text-xs truncate">{pkg.name}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {pkg.questionCount} câu • {pkg.description.slice(0, 35)}...
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Time settings */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" />
              Thời Gian Vận Hành Dây Chuyền & Trả Lời
            </h4>

            {/* Spin duration */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Thời gian quay băng chuyền:
                </span>
                <span className="text-xs font-black text-pink-600 dark:text-pink-400">
                  {settings.spinDurationSeconds} giây
                </span>
              </div>
              <div className="flex gap-2">
                {[2, 3, 5, 8, 10].map(sec => (
                  <button
                    key={sec}
                    onClick={() => onUpdateSettings({ spinDurationSeconds: sec })}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-black border transition-all ${
                      settings.spinDurationSeconds === sec
                        ? 'bg-pink-500 text-white border-pink-600 shadow-xs'
                        : isDark
                        ? 'bg-slate-800 border-slate-700 text-slate-300'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            {/* Answer countdown timer */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Thời gian đếm ngược trả lời câu hỏi:
                </span>
                <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                  {settings.answerTimerSeconds} giây
                </span>
              </div>
              <div className="flex gap-2">
                {[15, 30, 45, 60, 90].map(sec => (
                  <button
                    key={sec}
                    onClick={() => onUpdateSettings({ answerTimerSeconds: sec })}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-black border transition-all ${
                      settings.answerTimerSeconds === sec
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : isDark
                        ? 'bg-slate-800 border-slate-700 text-slate-300'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sound & Suspense */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-blue-500" />
              Âm Thanh Gameshow & Hồi Hộp Căng Thẳng
            </h4>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={e => {
                    onUpdateSettings({ soundEnabled: e.target.checked });
                    soundManager.setConfig(e.target.checked, settings.soundVolume, settings.suspenseSoundEnabled);
                  }}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span>Kích hoạt hiệu ứng âm thanh</span>
              </label>

              <button
                onClick={handleTestSound}
                className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-colors ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-pink-300'
                    : 'bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-700'
                }`}
              >
                Thử Fanfare 🎉
              </button>
            </div>

            {/* Suspense audio toggle & theme selection */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={settings.suspenseSoundEnabled}
                    onChange={e => {
                      onUpdateSettings({ suspenseSoundEnabled: e.target.checked });
                      soundManager.setConfig(settings.soundEnabled, settings.soundVolume, e.target.checked);
                    }}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                  <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-black">
                    <Flame className="w-4 h-4 fill-current text-amber-500" />
                    Bật hiệu ứng âm thanh hồi hộp kịch tính
                  </span>
                </label>

                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                  4 Chế Độ Hồi Hộp
                </span>
              </div>

              {settings.suspenseSoundEnabled && (
                <div className="space-y-2 pt-1">
                  <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Music className="w-3.5 h-3.5 text-rose-500" />
                    Chọn Kiểu Âm Thanh Hồi Hộp Khi Quay:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {SUSPENSE_THEMES.map(theme => {
                      const isSelected = (settings.suspenseTheme || 'millionaire') === theme.id;
                      return (
                        <div
                          key={theme.id}
                          className={`p-3 rounded-2xl border transition-all text-left relative flex flex-col justify-between ${
                            isSelected
                              ? 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 shadow-xs ring-1 ring-rose-400'
                              : isDark
                              ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                              : 'bg-white border-slate-200 hover:border-pink-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <button
                                type="button"
                                onClick={() => onUpdateSettings({ suspenseTheme: theme.id })}
                                className="flex items-center gap-1.5 text-left font-black text-xs text-slate-800 dark:text-slate-100"
                              >
                                <span className="text-base">{theme.icon}</span>
                                <span className="hover:underline">{theme.shortName}</span>
                              </button>
                              <span
                                className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase ${
                                  isSelected
                                    ? 'bg-rose-500 text-white'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                }`}
                              >
                                {theme.badge}
                              </span>
                            </div>

                            <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {theme.tagline}
                            </p>
                          </div>

                          <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateSettings({ suspenseTheme: theme.id });
                                soundManager.playSuspensePreview(theme.id);
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-100/60 dark:hover:bg-rose-900/40 transition-colors"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Nghe thử</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => onUpdateSettings({ suspenseTheme: theme.id })}
                              className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                                isSelected
                                  ? 'bg-rose-500 text-white shadow-xs'
                                  : isDark
                                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {isSelected ? (
                                <>
                                  <Check className="w-3 h-3 stroke-[3]" />
                                  <span>Đang chọn</span>
                                </>
                              ) : (
                                <span>Chọn kiểu này</span>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {settings.soundEnabled && (
              <div className="pt-1">
                <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                  <span>Âm lượng:</span>
                  <span>{Math.round(settings.soundVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={settings.soundVolume}
                  onChange={e => {
                    const vol = parseFloat(e.target.value);
                    onUpdateSettings({ soundVolume: vol });
                    soundManager.setConfig(true, vol, settings.suspenseSoundEnabled);
                  }}
                  className="w-full accent-pink-500 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Theme & Eye-care Mode */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Chế Độ Giao Diện (Giảm mỏi mắt giáo viên)
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onUpdateSettings({ theme: 'light' })}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-black transition-all ${
                  settings.theme === 'light'
                    ? 'border-pink-500 bg-pink-50 text-pink-900 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Trà Sữa Sáng (Ban ngày)</span>
              </button>

              <button
                onClick={() => onUpdateSettings({ theme: 'dark' })}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-black transition-all ${
                  settings.theme === 'dark'
                    ? 'border-pink-500 bg-slate-800 text-pink-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Than Tre Tối (Dịu mắt)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-3.5 border-t flex justify-end ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl font-black text-xs bg-pink-500 hover:bg-pink-600 text-white shadow-xs"
          >
            Lưu & Đóng
          </button>
        </div>
      </motion.div>
    </div>
  );
};
