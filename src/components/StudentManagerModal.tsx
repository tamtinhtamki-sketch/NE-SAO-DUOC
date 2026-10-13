import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  UploadCloud,
  FileText,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Users,
  Eye,
  EyeOff,
  Sparkles,
  Shuffle,
  GraduationCap,
  Copy,
  Edit2,
  Check,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { Student, Classroom } from '../types';
import { parseDocxFile, parseRawTextToStudents } from '../utils/wordParser';
import { DEFAULT_STUDENTS, getRandomTopping, MILK_TEA_TOPPINGS } from '../data/mockData';
import { soundManager } from '../utils/audio';

interface StudentManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onUpdateStudents: (students: Student[]) => void;
  classes: Classroom[];
  activeClassId: string;
  onSwitchClass: (classId: string) => void;
  onCreateClass: (name: string, subject?: string, initialStudents?: Student[]) => string;
  onUpdateClassInfo: (classId: string, updates: Partial<Classroom>) => void;
  onDeleteClass: (classId: string) => void;
  onDuplicateClass: (classId: string) => void;
  onSaveCurrentAsNewClass: (name: string, subject?: string) => void;
  initialTab?: 'classes' | 'word' | 'paste' | 'list';
  isDark: boolean;
}

export const StudentManagerModal: React.FC<StudentManagerModalProps> = ({
  isOpen,
  onClose,
  students,
  onUpdateStudents,
  classes,
  activeClassId,
  onSwitchClass,
  onCreateClass,
  onUpdateClassInfo,
  onDeleteClass,
  onDuplicateClass,
  onSaveCurrentAsNewClass,
  initialTab = 'classes',
  isDark
}) => {
  const [activeTab, setActiveTab] = useState<'classes' | 'word' | 'paste' | 'list'>(initialTab);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Class creation state
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassSubject, setNewClassSubject] = useState('');
  const [newClassInitialSource, setNewClassInitialSource] = useState<'empty' | 'copy_current'>('empty');

  // Class editing state
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editClassName, setEditClassName] = useState('');
  const [editClassSubject, setEditClassSubject] = useState('');

  // Paste raw text state
  const [pasteText, setPasteText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [classSearch, setClassSearch] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initial tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setStatusMessage(null);
      setIsCreatingClass(false);
      setEditingClassId(null);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const activeClass = classes.find(c => c.id === activeClassId) || classes[0];

  const handleProcessDocx = async (file: File, appendMode = false) => {
    setIsProcessingFile(true);
    setStatusMessage({ type: 'info', text: `Đang phân tích file Word "${file.name}"...` });

    try {
      const result = await parseDocxFile(file, appendMode ? students.length : 0);
      if (result.students.length > 0) {
        if (appendMode) {
          onUpdateStudents([...students, ...result.students]);
          setStatusMessage({
            type: 'success',
            text: `Đã thêm thành công ${result.students.length} học sinh từ file Word vào ${activeClass ? activeClass.name : 'lớp'}!`
          });
        } else {
          onUpdateStudents(result.students);
          setStatusMessage({
            type: 'success',
            text: `Đã nhập mới thành công ${result.students.length} học sinh từ file Word vào ${activeClass ? activeClass.name : 'lớp'}!`
          });
        }
        soundManager.playCorrectSound();
      } else {
        setStatusMessage({
          type: 'error',
          text: result.warning || 'Không tìm thấy danh sách học sinh hợp lệ trong file Word này.'
        });
        soundManager.playWrongSound();
      }
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Lỗi xảy ra khi đọc file Word. Hãy thử copy dán nội dung ở tab "Dán văn bản".'
      });
      soundManager.playWrongSound();
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessDocx(file, false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.name.endsWith('.docx') || file.type.includes('word') || file.name.endsWith('.txt')) {
        handleProcessDocx(file, false);
      } else {
        setStatusMessage({
          type: 'error',
          text: 'Vui lòng tải lên file định dạng Word (.docx).'
        });
      }
    }
  };

  const handlePasteSubmit = (appendMode = false) => {
    if (!pasteText.trim()) return;

    const result = parseRawTextToStudents(pasteText, appendMode ? students.length : 0);
    if (result.students.length > 0) {
      if (appendMode) {
        onUpdateStudents([...students, ...result.students]);
      } else {
        onUpdateStudents(result.students);
      }
      setPasteText('');
      setStatusMessage({
        type: 'success',
        text: `Đã thêm ${result.students.length} học sinh vào ${activeClass ? activeClass.name : 'lớp'}!`
      });
      soundManager.playCorrectSound();
      setActiveTab('list');
    } else {
      setStatusMessage({
        type: 'error',
        text: 'Không nhận diện được tên học sinh. Vui lòng mỗi dòng nhập một tên.'
      });
      soundManager.playWrongSound();
    }
  };

  const handleAddSingleStudent = () => {
    if (!newStudentName.trim()) return;
    const newStudent: Student = {
      id: `st-${Date.now()}`,
      code: String(students.length + 1).padStart(2, '0'),
      name: newStudentName.trim(),
      topping: getRandomTopping(),
      calledCount: 0,
      isExcluded: false
    };

    onUpdateStudents([...students, newStudent]);
    setNewStudentName('');
    soundManager.playToppingDrop();
  };

  const handleToggleExclude = (id: string) => {
    onUpdateStudents(
      students.map(s => (s.id === id ? { ...s, isExcluded: !s.isExcluded } : s))
    );
    soundManager.playConveyorTick(1.2);
  };

  const handleDeleteStudent = (id: string) => {
    onUpdateStudents(students.filter(s => s.id !== id));
  };

  const handleRandomizeAllToppings = () => {
    onUpdateStudents(
      students.map(s => ({ ...s, topping: getRandomTopping() }))
    );
    soundManager.playToppingDrop();
    setStatusMessage({ type: 'info', text: 'Đã phát ngẫu nhiên lại toàn bộ topping trà sữa cho học sinh!' });
  };

  const handleResetToDefault = () => {
    if (confirm('Khôi phục danh sách mẫu lớp 12A1 (18 học sinh)?')) {
      onUpdateStudents(DEFAULT_STUDENTS);
      soundManager.playCorrectSound();
    }
  };

  // Class Management Handlers
  const handleStartCreateClass = () => {
    setIsCreatingClass(true);
    setNewClassName(`Lớp ${classes.length + 1}`);
    setNewClassSubject('Tiết Học Hào Hứng');
    setNewClassInitialSource('empty');
  };

  const handleConfirmCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    let initialList: Student[] = [];
    if (newClassInitialSource === 'copy_current') {
      initialList = students.map(s => ({
        ...s,
        id: `st-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        calledCount: 0,
        isExcluded: false,
        lastScore: undefined,
        lastGradedAt: undefined
      }));
    }

    const createdId = onCreateClass(newClassName.trim(), newClassSubject.trim(), initialList);
    setIsCreatingClass(false);
    setStatusMessage({
      type: 'success',
      text: `Đã tạo lớp "${newClassName.trim()}" thành công và chuyển sang lớp này!`
    });
    soundManager.playCorrectSound();
  };

  const handleStartEditClass = (cls: Classroom) => {
    setEditingClassId(cls.id);
    setEditClassName(cls.name);
    setEditClassSubject(cls.subject || '');
  };

  const handleSaveEditClass = (classId: string) => {
    if (!editClassName.trim()) return;
    onUpdateClassInfo(classId, {
      name: editClassName.trim(),
      subject: editClassSubject.trim()
    });
    setEditingClassId(null);
    setStatusMessage({
      type: 'success',
      text: `Đã cập nhật thông tin lớp "${editClassName.trim()}"!`
    });
    soundManager.playOptionSelect();
  };

  const handleDeleteClassConfirm = (cls: Classroom) => {
    if (classes.length <= 1) {
      setStatusMessage({
        type: 'error',
        text: 'Cần giữ lại ít nhất 1 lớp trong danh sách!'
      });
      return;
    }
    if (confirm(`Bạn có chắc chắn muốn xóa "${cls.name}" (${cls.students.length} học sinh) không?`)) {
      onDeleteClass(cls.id);
      setStatusMessage({
        type: 'info',
        text: `Đã xóa "${cls.name}".`
      });
    }
  };

  const handleSelectClass = (clsId: string) => {
    onSwitchClass(clsId);
    const target = classes.find(c => c.id === clsId);
    setStatusMessage({
      type: 'success',
      text: `Đã chọn sử dụng "${target?.name || 'Lớp'}" (${target?.students.length || 0} học sinh). Băng chuyền đã sẵn sàng!`
    });
    soundManager.playOptionSelect();
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.code && s.code.includes(searchQuery))
  );

  const filteredClasses = classes.filter(
    c =>
      c.name.toLowerCase().includes(classSearch.toLowerCase()) ||
      (c.subject && c.subject.toLowerCase().includes(classSearch.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={`w-full max-w-4xl rounded-3xl border-2 shadow-2xl overflow-hidden my-4 flex flex-col max-h-[90vh] transition-colors ${
          isDark
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-white border-pink-200 text-slate-800'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg font-['Comfortaa',cursive] flex items-center gap-2">
                Quản Lý Danh Sách & Nhiều Lớp Học
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-white/20 text-white border border-white/30">
                  {classes.length} Lớp
                </span>
              </h3>
              <p className="text-xs text-pink-100 font-semibold">
                Lưu nhiều lớp học khác nhau, chuyển lớp dùng ngay, nhập file Word hoặc dán danh sách
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

        {/* Current Active Class Indicator Bar */}
        <div
          className={`px-6 py-2.5 border-b text-xs flex flex-wrap items-center justify-between gap-2 ${
            isDark ? 'bg-slate-950/80 border-slate-800 text-slate-300' : 'bg-pink-50/70 border-pink-100 text-pink-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500 dark:text-slate-400">Đang chọn dùng:</span>
            <span className="font-black px-2 py-0.5 rounded-lg bg-pink-500 text-white text-xs font-['Comfortaa',cursive]">
              {activeClass ? activeClass.name : 'Chưa chọn lớp'}
            </span>
            <span className="text-slate-500">
              ({students.length} học sinh • {activeClass?.subject || 'Tiết học'})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('classes')}
              className="font-bold text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1"
            >
              <Shuffle className="w-3 h-3" />
              Đổi lớp khác
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div
          className={`flex border-b text-xs sm:text-sm font-bold px-4 pt-2 gap-2 overflow-x-auto ${
            isDark ? 'border-slate-800 bg-slate-950/60' : 'border-pink-100 bg-pink-50/50'
          }`}
        >
          <button
            id="tab-classes"
            onClick={() => setActiveTab('classes')}
            className={`px-4 py-2.5 rounded-t-xl border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'classes'
                ? 'border-pink-500 text-pink-600 dark:text-pink-400 bg-white dark:bg-slate-900 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>🏫 Danh Sách Các Lớp ({classes.length})</span>
          </button>

          <button
            id="tab-word"
            onClick={() => setActiveTab('word')}
            className={`px-4 py-2.5 rounded-t-xl border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'word'
                ? 'border-pink-500 text-pink-600 dark:text-pink-400 bg-white dark:bg-slate-900 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>📄 Tải File Word (.docx)</span>
          </button>

          <button
            id="tab-paste"
            onClick={() => setActiveTab('paste')}
            className={`px-4 py-2.5 rounded-t-xl border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'paste'
                ? 'border-pink-500 text-pink-600 dark:text-pink-400 bg-white dark:bg-slate-900 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>📝 Dán Văn Bản Nhanh</span>
          </button>

          <button
            id="tab-list"
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2.5 rounded-t-xl border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'list'
                ? 'border-pink-500 text-pink-600 dark:text-pink-400 bg-white dark:bg-slate-900 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>👥 Học Sinh Lớp Này ({students.length})</span>
          </button>
        </div>

        {/* Status Message Notification */}
        {statusMessage && (
          <div
            className={`mx-6 mt-4 p-3 rounded-xl text-xs font-bold flex items-center justify-between gap-2 border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                : statusMessage.type === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/70 border-rose-300 text-rose-800 dark:text-rose-300'
                : 'bg-blue-50 dark:bg-blue-950/70 border-blue-300 text-blue-800 dark:text-blue-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
              {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {/* ========================================================= */}
          {/* TAB 0: QUẢN LÝ CÁC LỚP HỌC (MULTI-CLASS MANAGEMENT)     */}
          {/* ========================================================= */}
          {activeTab === 'classes' && (
            <div className="space-y-6">
              {/* Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-pink-100 dark:border-slate-800">
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={classSearch}
                    onChange={e => setClassSearch(e.target.value)}
                    placeholder="Tìm theo tên lớp, môn học..."
                    className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border outline-none transition-all ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-pink-500'
                        : 'bg-white border-slate-200 text-slate-800 focus:border-pink-400'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-save-as-new-class"
                    onClick={() => {
                      const name = prompt('Nhập tên lớp mới để lưu danh sách học sinh hiện tại:', `Lớp ${classes.length + 1}`);
                      if (name && name.trim()) {
                        onSaveCurrentAsNewClass(name.trim());
                        setStatusMessage({
                          type: 'success',
                          text: `Đã lưu danh sách học sinh hiện tại thành "${name.trim()}"!`
                        });
                      }
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
                      isDark
                        ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-pink-300'
                        : 'bg-white hover:bg-pink-50 border-pink-200 text-pink-700 shadow-2xs'
                    }`}
                    title="Lưu các học sinh đang có trong bộ nhớ thành một lớp mới riêng biệt"
                  >
                    <Copy className="w-3.5 h-3.5 text-pink-500" />
                    <span>Lưu HS hiện tại thành lớp mới</span>
                  </button>

                  <button
                    id="btn-create-new-class"
                    onClick={handleStartCreateClass}
                    className="px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-xs flex items-center gap-1.5 transition-all hover:scale-102"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Thêm Lớp Mới</span>
                  </button>
                </div>
              </div>

              {/* Create Class Form Inline */}
              <AnimatePresence>
                {isCreatingClass && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-4 sm:p-5 rounded-2xl border-2 overflow-hidden ${
                      isDark
                        ? 'bg-slate-800/80 border-pink-500/50 text-slate-100'
                        : 'bg-pink-50/80 border-pink-300 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-extrabold text-sm flex items-center gap-2 text-pink-600 dark:text-pink-400 font-['Comfortaa',cursive]">
                        <Plus className="w-4 h-4" />
                        Tạo Lớp Học Mới
                      </h4>
                      <button
                        onClick={() => setIsCreatingClass(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleConfirmCreateClass} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                            Tên lớp học *
                          </label>
                          <input
                            type="text"
                            required
                            value={newClassName}
                            onChange={e => setNewClassName(e.target.value)}
                            placeholder="Ví dụ: 12A3, 11B2, 10 Chuyên Lý..."
                            className={`w-full px-3 py-2 text-xs font-bold rounded-xl border outline-none ${
                              isDark
                                ? 'bg-slate-900 border-slate-700 text-white focus:border-pink-500'
                                : 'bg-white border-pink-200 text-slate-800 focus:border-pink-400'
                            }`}
                            autoFocus
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                            Môn học / Tiết dạy
                          </label>
                          <input
                            type="text"
                            value={newClassSubject}
                            onChange={e => setNewClassSubject(e.target.value)}
                            placeholder="Ví dụ: Vật Lý, Ngữ Văn, Tiếng Anh..."
                            className={`w-full px-3 py-2 text-xs font-bold rounded-xl border outline-none ${
                              isDark
                                ? 'bg-slate-900 border-slate-700 text-white focus:border-pink-500'
                                : 'bg-white border-pink-200 text-slate-800 focus:border-pink-400'
                            }`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                          Khởi tạo danh sách học sinh:
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <label
                            className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                              newClassInitialSource === 'empty'
                                ? isDark
                                  ? 'bg-pink-950/60 border-pink-500 text-pink-300'
                                  : 'bg-white border-pink-400 text-pink-900 shadow-2xs font-bold'
                                : isDark
                                ? 'bg-slate-900 border-slate-700'
                                : 'bg-white/60 border-slate-200'
                            }`}
                          >
                            <input
                              type="radio"
                              name="classSource"
                              checked={newClassInitialSource === 'empty'}
                              onChange={() => setNewClassInitialSource('empty')}
                              className="accent-pink-500"
                            />
                            <span>Tạo lớp trống (nhập Word/Dán sau)</span>
                          </label>

                          <label
                            className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                              newClassInitialSource === 'copy_current'
                                ? isDark
                                  ? 'bg-pink-950/60 border-pink-500 text-pink-300'
                                  : 'bg-white border-pink-400 text-pink-900 shadow-2xs font-bold'
                                : isDark
                                ? 'bg-slate-900 border-slate-700'
                                : 'bg-white/60 border-slate-200'
                            }`}
                          >
                            <input
                              type="radio"
                              name="classSource"
                              checked={newClassInitialSource === 'copy_current'}
                              onChange={() => setNewClassInitialSource('copy_current')}
                              className="accent-pink-500"
                            />
                            <span>Sao chép {students.length} học sinh từ lớp đang chọn</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsCreatingClass(false)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-xl text-xs font-extrabold bg-pink-500 hover:bg-pink-600 text-white shadow-xs"
                        >
                          Tạo & Dùng Ngay
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Grid of Saved Classes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredClasses.map(cls => {
                  const isActive = cls.id === activeClassId;
                  const isEditing = editingClassId === cls.id;

                  return (
                    <div
                      key={cls.id}
                      className={`rounded-2xl border-2 p-4 transition-all relative flex flex-col justify-between ${
                        isActive
                          ? isDark
                            ? 'bg-gradient-to-b from-pink-950/40 to-slate-800 border-pink-500 shadow-md shadow-pink-950/40 ring-1 ring-pink-500/50'
                            : 'bg-gradient-to-b from-pink-50/90 to-rose-50/60 border-pink-400 shadow-sm ring-1 ring-pink-300'
                          : isDark
                          ? 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
                          : 'bg-white border-slate-200 hover:border-pink-200 hover:shadow-2xs'
                      }`}
                    >
                      {/* Card Top: Class Name & Active Status */}
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-2xs ${
                                isActive
                                  ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white'
                                  : isDark
                                  ? 'bg-slate-700 text-slate-300'
                                  : 'bg-pink-100 text-pink-700'
                              }`}
                            >
                              {cls.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3) || 'Lớp'}
                            </div>

                            <div className="min-w-0">
                              {isEditing ? (
                                <div className="space-y-1">
                                  <input
                                    type="text"
                                    value={editClassName}
                                    onChange={e => setEditClassName(e.target.value)}
                                    className="w-full px-2 py-1 text-xs font-extrabold border rounded-md"
                                    placeholder="Tên lớp..."
                                    autoFocus
                                  />
                                  <input
                                    type="text"
                                    value={editClassSubject}
                                    onChange={e => setEditClassSubject(e.target.value)}
                                    className="w-full px-2 py-0.5 text-[11px] border rounded-md"
                                    placeholder="Môn học..."
                                  />
                                </div>
                              ) : (
                                <>
                                  <h4 className="font-extrabold text-sm sm:text-base font-['Comfortaa',cursive] truncate flex items-center gap-1.5">
                                    {cls.name}
                                  </h4>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                                    <BookOpen className="w-3 h-3 text-pink-500 shrink-0" />
                                    <span>{cls.subject || 'Tiết học hào hứng'}</span>
                                  </p>
                                </>
                              )}
                            </div>
                          </div>

                          {isActive && (
                            <span className="shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-500 text-white shadow-2xs flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Đang chọn
                            </span>
                          )}
                        </div>

                        {/* Class Info Badges */}
                        <div className="flex items-center gap-2 my-3 text-xs font-bold">
                          <span
                            className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 ${
                              isDark
                                ? 'bg-slate-900/80 text-pink-300 border border-slate-700'
                                : 'bg-white text-pink-700 border border-pink-100 shadow-2xs'
                            }`}
                          >
                            <Users className="w-3.5 h-3.5 text-pink-500" />
                            <strong>{cls.students.length}</strong> học sinh
                          </span>

                          <span className="text-[11px] text-slate-400 font-normal">
                            Cập nhật: {new Date(cls.updatedAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>

                      {/* Card Bottom Actions */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-1.5">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5 w-full justify-end">
                            <button
                              onClick={() => setEditingClassId(null)}
                              className="px-2.5 py-1 text-xs font-bold text-slate-500 hover:text-slate-700"
                            >
                              Hủy
                            </button>
                            <button
                              onClick={() => handleSaveEditClass(cls.id)}
                              className="px-3 py-1 text-xs font-extrabold bg-pink-500 text-white rounded-lg shadow-xs"
                            >
                              Lưu
                            </button>
                          </div>
                        ) : (
                          <>
                            {/* Switch to this class button */}
                            {isActive ? (
                              <button
                                onClick={() => setActiveTab('list')}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-pink-100 dark:bg-pink-950/70 text-pink-700 dark:text-pink-300 flex items-center gap-1 hover:bg-pink-200 transition-colors"
                              >
                                <span>Xem học sinh</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSelectClass(cls.id)}
                                className="px-3 py-1.5 rounded-xl text-xs font-black bg-pink-500 hover:bg-pink-600 text-white flex items-center gap-1 shadow-2xs transition-all hover:scale-102"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>Chọn dùng ngay</span>
                              </button>
                            )}

                            {/* Secondary Actions */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleStartEditClass(cls)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                title="Đổi tên lớp hoặc môn học"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  onDuplicateClass(cls.id);
                                  setStatusMessage({
                                    type: 'success',
                                    text: `Đã nhân bản lớp "${cls.name}" thành bản sao mới!`
                                  });
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                title="Nhân bản lớp này"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              {classes.length > 1 && (
                                <button
                                  onClick={() => handleDeleteClassConfirm(cls)}
                                  className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                                  title="Xóa lớp này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 1: UPLOAD WORD FILE                                   */}
          {/* ========================================================= */}
          {activeTab === 'word' && (
            <div className="space-y-5">
              {/* Target Class Alert */}
              <div
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between ${
                  isDark
                    ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                    : 'bg-pink-50/80 border-pink-200 text-pink-900'
                }`}
              >
                <span>
                  Đang chuẩn bị nhập học sinh vào: <strong>{activeClass?.name}</strong> ({students.length} hs hiện có)
                </span>
                <button
                  onClick={() => setActiveTab('classes')}
                  className="text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1"
                >
                  <Shuffle className="w-3 h-3" />
                  Đổi lớp khác
                </button>
              </div>

              <div
                onDragOver={e => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/30 scale-[1.01]'
                    : isDark
                    ? 'border-slate-700 hover:border-pink-500 bg-slate-800/50 hover:bg-slate-800'
                    : 'border-pink-300 hover:border-pink-500 bg-pink-50/40 hover:bg-pink-50/80'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 text-white flex items-center justify-center shadow-md">
                  <UploadCloud className="w-8 h-8" />
                </div>

                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-100">
                    Kéo thả file Word (.docx) danh sách lớp vào đây
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Hỗ trợ file danh sách học sinh xuất từ vnEdu, SMAS, bảng Word có cột Họ và tên
                  </p>
                </div>

                <button
                  type="button"
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-pink-500 hover:bg-pink-600 text-white shadow-xs transition-colors"
                >
                  Chọn File Từ Máy Tính
                </button>
              </div>

              <div
                className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <p className="font-bold text-slate-800 dark:text-slate-200">💡 Mẹo chuẩn hóa file Word:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-500 dark:text-slate-400">
                  <li>File Word có thể là bảng biểu (Table) hoặc danh sách xuống dòng.</li>
                  <li>Hệ thống tự động lọc bỏ số thứ tự (1, 2, 3...) và tự động phát Topping trà sữa ngẫu nhiên.</li>
                  <li>Nếu file Word có định dạng đặc biệt, thầy cô chỉ cần mở file, bấm Ctrl+A copy và dán vào tab <strong>"Dán Văn Bản Nhanh"</strong>.</li>
                </ul>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: PASTE RAW TEXT                                     */}
          {/* ========================================================= */}
          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between ${
                  isDark
                    ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                    : 'bg-pink-50/80 border-pink-200 text-pink-900'
                }`}
              >
                <span>
                  Đang thêm vào: <strong>{activeClass?.name}</strong> ({students.length} hs hiện có)
                </span>
                <button
                  onClick={() => setActiveTab('classes')}
                  className="text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1"
                >
                  <Shuffle className="w-3 h-3" />
                  Đổi lớp khác
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Dán danh sách tên học sinh (Mỗi dòng một tên hoặc copy từ Word / Excel):
                </label>
                <textarea
                  value={pasteText}
                  onChange={e => setPasteText(e.target.value)}
                  rows={8}
                  placeholder={`Nguyễn Hoàng An\nTrần Thị Mỹ Linh\nLê Quốc Bảo\nPhạm Minh Châu\n...`}
                  className={`w-full p-3.5 text-xs font-mono rounded-2xl border outline-none transition-all ${
                    isDark
                      ? 'bg-slate-950 border-slate-700 text-slate-100 focus:border-pink-500'
                      : 'bg-white border-pink-200 text-slate-800 focus:border-pink-400 shadow-inner'
                  }`}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-slate-400">
                  {pasteText.split('\n').filter(l => l.trim()).length} dòng đã nhập
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePasteSubmit(true)}
                    disabled={!pasteText.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-bold border border-pink-300 dark:border-slate-700 text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-slate-800 disabled:opacity-50"
                  >
                    + Thêm vào lớp này ({students.length})
                  </button>

                  <button
                    onClick={() => handlePasteSubmit(false)}
                    disabled={!pasteText.trim()}
                    className="px-5 py-2 rounded-xl text-xs font-extrabold bg-pink-500 hover:bg-pink-600 text-white shadow-xs disabled:opacity-50"
                  >
                    Thay thế toàn bộ lớp
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: CURRENT STUDENT LIST & TOPPINGS                     */}
          {/* ========================================================= */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              {/* Quick Add Single Student & Search */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex-1 min-w-[240px] flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Tìm học sinh theo tên hoặc STT..."
                      className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border outline-none ${
                        isDark
                          ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-pink-500'
                          : 'bg-white border-slate-200 text-slate-800 focus:border-pink-400'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRandomizeAllToppings}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      isDark
                        ? 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-amber-300'
                        : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900'
                    }`}
                    title="Đổi lại topping ngẫu nhiên cho toàn bộ học sinh"
                  >
                    <Shuffle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Đổi Topping</span>
                  </button>

                  <button
                    onClick={handleResetToDefault}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      isDark
                        ? 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-400'
                        : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                    title="Khôi phục danh sách mẫu 18 bạn"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Mẫu 18 bạn</span>
                  </button>
                </div>
              </div>

              {/* Add Single Student Input Bar */}
              <div
                className={`p-2 rounded-2xl border flex items-center gap-2 ${
                  isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-pink-50/50 border-pink-200'
                }`}
              >
                <input
                  type="text"
                  value={newStudentName}
                  onChange={e => setNewStudentName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddSingleStudent()}
                  placeholder="Thêm 1 học sinh mới (Nhập họ tên rồi bấm Thêm)..."
                  className={`flex-1 px-3 py-1.5 text-xs rounded-xl border outline-none ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-white'
                      : 'bg-white border-pink-200 text-slate-800'
                  }`}
                />
                <button
                  onClick={handleAddSingleStudent}
                  disabled={!newStudentName.trim()}
                  className="px-4 py-1.5 rounded-xl text-xs font-extrabold bg-pink-500 hover:bg-pink-600 text-white shadow-xs disabled:opacity-50 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm</span>
                </button>
              </div>

              {/* Students Grid List */}
              <div className="max-h-[380px] overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredStudents.length === 0 ? (
                  <div className="col-span-full py-10 text-center text-xs text-slate-400">
                    Chưa có học sinh nào trong lớp này. Hãy tải file Word hoặc dán danh sách!
                  </div>
                ) : (
                  filteredStudents.map(student => (
                    <div
                      key={student.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                        student.isExcluded
                          ? 'opacity-40 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                          : isDark
                          ? 'bg-slate-800/80 border-slate-700 hover:border-pink-500/50'
                          : 'bg-white border-pink-100 hover:border-pink-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-base shadow-xs shrink-0"
                          style={{ backgroundColor: student.topping.color }}
                        >
                          {student.topping.emoji}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-black truncate text-slate-900 dark:text-white">
                            #{student.code} {student.name}
                          </p>
                          <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold truncate">
                            {student.topping.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Exclude / Include Toggle */}
                        <button
                          onClick={() => handleToggleExclude(student.id)}
                          className={`p-1.5 rounded-lg border text-xs transition-colors ${
                            student.isExcluded
                              ? 'text-slate-400 border-slate-300 dark:border-slate-700'
                              : 'text-pink-600 border-pink-200 bg-pink-50 dark:bg-pink-950/40'
                          }`}
                          title={student.isExcluded ? 'Khôi phục lên băng chuyền' : 'Loại khỏi băng chuyền'}
                        >
                          {student.isExcluded ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>

                        {/* Delete Single Student */}
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs"
                          title="Xóa học sinh này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-3.5 border-t flex items-center justify-between text-xs font-bold ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-pink-50/40 border-pink-100'
          }`}
        >
          <span className="text-slate-500 dark:text-slate-400">
            Lớp <strong>{activeClass ? activeClass.name : ''}</strong>: <strong>{students.length}</strong> bạn (Sẵn sàng:{' '}
            <strong className="text-pink-600 dark:text-pink-400">
              {students.filter(s => !s.isExcluded).length}
            </strong>
            ) • Tổng <strong>{classes.length}</strong> lớp đã lưu
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl font-black bg-pink-500 hover:bg-pink-600 text-white shadow-xs"
          >
            Hoàn tất & Về Dây Chuyền
          </button>
        </div>
      </motion.div>
    </div>
  );
};
