import React, { useState, useRef, useEffect } from 'react';
import {
  GraduationCap,
  ChevronDown,
  Check,
  Plus,
  Settings,
  Users,
  Search,
  Sparkles
} from 'lucide-react';
import { Classroom } from '../types';
import { soundManager } from '../utils/audio';

interface ClassDropdownProps {
  classes: Classroom[];
  activeClassId: string;
  onSwitchClass: (classId: string) => void;
  onOpenClassManager: (tab?: 'classes' | 'word' | 'paste' | 'list') => void;
  isDark: boolean;
  variant?: 'header' | 'conveyor';
}

export const ClassDropdown: React.FC<ClassDropdownProps> = ({
  classes,
  activeClassId,
  onSwitchClass,
  onOpenClassManager,
  isDark,
  variant = 'header'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeClass = classes.find(c => c.id === activeClassId) || classes[0];

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredClasses = classes.filter(
    c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.subject && c.subject.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelect = (classId: string) => {
    if (classId !== activeClassId) {
      onSwitchClass(classId);
    }
    setIsOpen(false);
    setSearch('');
  };

  const isHeader = variant === 'header';

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        id={isHeader ? 'btn-header-class-dropdown' : 'btn-conveyor-class-dropdown'}
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          soundManager.playOptionSelect();
        }}
        className={`group flex items-center gap-2 font-bold transition-all border ${
          isHeader
            ? isDark
              ? 'px-3 py-1.5 rounded-xl text-xs sm:text-sm bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
              : 'px-3 py-1.5 rounded-xl text-xs sm:text-sm bg-pink-50/90 hover:bg-pink-100/80 border-pink-200 text-pink-900 shadow-2xs'
            : isDark
            ? 'px-2.5 py-1 rounded-full text-xs bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-pink-300'
            : 'px-2.5 py-1 rounded-full text-xs bg-white/90 hover:bg-pink-50 border-pink-200 text-pink-800 shadow-2xs'
        }`}
        title="Bấm để đổi lớp học hoặc quản lý danh sách lớp"
      >
        <GraduationCap className={`w-4 h-4 text-pink-500 shrink-0 group-hover:scale-110 transition-transform`} />
        
        <span className="truncate max-w-[110px] sm:max-w-[150px] font-extrabold font-['Comfortaa',cursive]">
          {activeClass ? activeClass.name : 'Chọn lớp'}
        </span>

        <span
          className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
            isDark
              ? 'bg-slate-700 text-pink-300'
              : 'bg-pink-200/80 text-pink-800'
          }`}
        >
          {activeClass ? `${activeClass.students.length} hs` : '0'}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div
          className={`absolute left-0 mt-2 w-72 sm:w-80 rounded-2xl border-2 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
            isDark
              ? 'bg-slate-900 border-slate-700 text-slate-100 shadow-black/60'
              : 'bg-white border-pink-200 text-slate-800 shadow-pink-200/50'
          }`}
        >
          {/* Popover Header */}
          <div
            className={`p-3 border-b flex items-center justify-between ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-pink-50/60 border-pink-100'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              <span className="text-xs font-black uppercase tracking-wider text-pink-600 dark:text-pink-400 font-['Comfortaa',cursive]">
                Danh Sách Các Lớp ({classes.length})
              </span>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenClassManager('classes');
              }}
              className="text-[11px] font-bold text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-0.5"
            >
              <Settings className="w-3 h-3" />
              <span>Quản lý</span>
            </button>
          </div>

          {/* Quick Search if multiple classes */}
          {classes.length > 3 && (
            <div className={`p-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Tìm theo tên lớp hoặc môn..."
                  className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border outline-none transition-all ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-pink-500'
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-pink-400'
                  }`}
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Class List */}
          <div className="max-h-64 overflow-y-auto p-1.5 space-y-1 divide-y-0">
            {filteredClasses.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Không tìm thấy lớp phù hợp
              </div>
            ) : (
              filteredClasses.map(c => {
                const isActive = c.id === activeClassId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelect(c.id)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between gap-2 ${
                      isActive
                        ? isDark
                          ? 'bg-pink-950/60 border border-pink-800/80 text-pink-200 font-extrabold shadow-xs'
                          : 'bg-pink-50 border border-pink-300 text-pink-900 font-extrabold shadow-xs'
                        : isDark
                        ? 'hover:bg-slate-800/70 text-slate-200 border border-transparent'
                        : 'hover:bg-pink-50/50 text-slate-700 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shrink-0 ${
                          isActive
                            ? 'bg-pink-500 text-white shadow-xs'
                            : isDark
                            ? 'bg-slate-800 text-slate-300'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {c.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3) || 'Lớp'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs sm:text-sm truncate">
                            {c.name}
                          </span>
                          {isActive && (
                            <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-pink-500 text-white">
                              Đang dùng
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {c.subject || 'Tiết học hào hứng'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                          isDark
                            ? 'bg-slate-800 text-slate-300'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Users className="w-3 h-3 text-pink-500" />
                        {c.students.length}
                      </span>
                      {isActive && <Check className="w-4 h-4 text-pink-500" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Popover Footer: Quick Add New Class */}
          <div
            className={`p-2 border-t flex items-center justify-between gap-2 ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-100'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenClassManager('classes');
              }}
              className="w-full py-2 px-3 rounded-xl text-xs font-extrabold bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Thêm & Quản lý nhiều lớp</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
