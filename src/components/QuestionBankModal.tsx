import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  HelpCircle,
  Plus,
  Trash2,
  BookOpen,
  Sparkles,
  Shuffle,
  ListOrdered,
  RefreshCw,
  CheckCircle2,
  Check,
  Filter,
  FileCheck
} from 'lucide-react';
import { Question, AppSettings, QuestionType } from '../types';
import { DEFAULT_QUESTIONS, QUESTION_PACKAGES } from '../data/mockData';
import { soundManager } from '../utils/audio';

interface QuestionBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  onUpdateQuestions: (questions: Question[]) => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  isDark: boolean;
}

export const QuestionBankModal: React.FC<QuestionBankModalProps> = ({
  isOpen,
  onClose,
  questions,
  onUpdateQuestions,
  settings,
  onUpdateSettings,
  isDark
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'batch'>('list');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Single Question Form State
  const [newType, setNewType] = useState<QuestionType>('multiple_choice');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Dò bài cũ');
  const [newDifficulty, setNewDifficulty] = useState<Question['difficulty']>('Trung Bình');
  const [newAnswer, setNewAnswer] = useState('');

  // Multiple Choice Specific fields
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number>(0);

  // True/False Specific field
  const [correctBoolean, setCorrectBoolean] = useState<boolean>(true);

  // Batch import text
  const [batchText, setBatchText] = useState('');

  if (!isOpen) return null;

  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    let options: string[] | undefined = undefined;
    let correctAnswer: string | undefined = undefined;

    if (newType === 'multiple_choice') {
      options = [
        `A. ${optionA.replace(/^[A-Da-d][\.\:\-\s]+/, '').trim() || 'Lựa chọn A'}`,
        `B. ${optionB.replace(/^[A-Da-d][\.\:\-\s]+/, '').trim() || 'Lựa chọn B'}`,
        `C. ${optionC.replace(/^[A-Da-d][\.\:\-\s]+/, '').trim() || 'Lựa chọn C'}`,
        `D. ${optionD.replace(/^[A-Da-d][\.\:\-\s]+/, '').trim() || 'Lựa chọn D'}`
      ];
      correctAnswer = ['A', 'B', 'C', 'D'][correctOptionIndex];
    }

    const newQ: Question = {
      id: `q-${Date.now()}`,
      content: newContent.trim(),
      type: newType,
      options,
      correctOptionIndex: newType === 'multiple_choice' ? correctOptionIndex : undefined,
      correctAnswer,
      correctBoolean: newType === 'true_false' ? correctBoolean : undefined,
      category: newCategory.trim() || 'Bài học',
      difficulty: newDifficulty,
      suggestedAnswer: newAnswer.trim() || undefined
    };

    onUpdateQuestions([...questions, newQ]);

    // Reset Form
    setNewContent('');
    setNewAnswer('');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setCorrectOptionIndex(0);
    setCorrectBoolean(true);
    setActiveTab('list');
    soundManager.playCorrectSound();
  };

  // Smart Batch Import
  const handleBatchImport = () => {
    if (!batchText.trim()) return;

    const rawBlocks = batchText.split(/\n\s*\n/);
    const newItems: Question[] = [];

    rawBlocks.forEach((block, bIdx) => {
      const trimmedBlock = block.trim();
      if (!trimmedBlock) return;

      const lines = trimmedBlock.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const firstLine = lines[0].replace(/^[0-9]+[\.\-\)\s]+/, '').trim();

      // Check if block has multiple choice options (A, B, C, D)
      const optLines = lines.slice(1).filter(l => /^[A-Da-d][\.\:\-\)]\s*/.test(l));

      if (optLines.length >= 2) {
        // Multiple choice
        const options = optLines.slice(0, 4).map(l => l.trim());
        let correctIdx = 0;

        // Check if there is an answer indicator
        const ansLine = lines.find(l => /đáp án|câu đúng|correct|key/i.test(l));
        if (ansLine) {
          if (/A/i.test(ansLine)) correctIdx = 0;
          else if (/B/i.test(ansLine)) correctIdx = 1;
          else if (/C/i.test(ansLine)) correctIdx = 2;
          else if (/D/i.test(ansLine)) correctIdx = 3;
        }

        newItems.push({
          id: `q-${Date.now()}-${bIdx}`,
          content: firstLine,
          type: 'multiple_choice',
          options,
          correctOptionIndex: correctIdx,
          correctAnswer: ['A', 'B', 'C', 'D'][correctIdx],
          category: 'Trắc nghiệm',
          difficulty: 'Trung Bình'
        });
      } else if (/đúng hay sai|đúng\/sai|đ\/s/i.test(firstLine)) {
        // True / False
        const isTrue = /đáp án:?\s*đúng|key:?\s*true|1/i.test(trimmedBlock);
        newItems.push({
          id: `q-${Date.now()}-${bIdx}`,
          content: firstLine,
          type: 'true_false',
          correctBoolean: isTrue,
          category: 'Đúng/Sai',
          difficulty: 'Trung Bình'
        });
      } else {
        // Essay / Short Answer
        newItems.push({
          id: `q-${Date.now()}-${bIdx}`,
          content: firstLine,
          type: 'essay',
          category: 'Tự luận',
          difficulty: 'Trung Bình',
          suggestedAnswer: lines.length > 1 ? lines.slice(1).join('\n') : undefined
        });
      }
    });

    onUpdateQuestions([...questions, ...newItems]);
    setBatchText('');
    setActiveTab('list');
    soundManager.playCorrectSound();
  };

  const handleDeleteQuestion = (id: string) => {
    onUpdateQuestions(questions.filter(q => q.id !== id));
  };

  const handleResetDefaults = () => {
    if (confirm('Khôi phục danh sách câu hỏi phong phú mẫu (Trắc nghiệm, Đúng/Sai, Tự luận)?')) {
      onUpdateQuestions(DEFAULT_QUESTIONS);
      soundManager.playToppingDrop();
    }
  };

  // Filter questions
  const filteredQuestions = questions.filter(q => {
    if (filterType !== 'all' && q.type !== filterType) return false;
    if (filterCategory !== 'all' && q.category !== filterCategory) return false;
    return true;
  });

  const categories = Array.from(new Set(questions.map(q => q.category).filter(Boolean)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0 }}
        className={`w-full max-w-3xl rounded-3xl border-2 shadow-2xl overflow-hidden my-4 flex flex-col max-h-[90vh] transition-colors ${
          isDark
            ? 'bg-slate-900 border-slate-700 text-slate-100 shadow-amber-950/20'
            : 'bg-white border-pink-200 text-slate-800 shadow-amber-100'
        }`}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            <div>
              <h3 className="font-extrabold text-base sm:text-lg font-['Comfortaa',cursive]">
                Ngân Hàng Câu Hỏi Buổi Học
              </h3>
              <p className="text-xs text-amber-100 font-semibold">
                Hỗ trợ Trắc nghiệm 4 lựa chọn (A,B,C,D), Đúng/Sai và Tự luận
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

        {/* Global Question Setting Banner */}
        <div
          className={`px-5 sm:px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs font-bold ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-amber-50/50 border-amber-100'
          }`}
        >
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.enableQuestions}
              onChange={e => onUpdateSettings({ enableQuestions: e.target.checked })}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
            />
            <span className="text-slate-800 dark:text-slate-200 font-extrabold">
              Kèm câu hỏi khi quay ({settings.enableQuestions ? 'Đang bật' : 'Tắt'})
            </span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400">Chế độ giao:</span>
            <button
              onClick={() => onUpdateSettings({ questionMode: 'random' })}
              className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 ${
                settings.questionMode === 'random'
                  ? 'bg-amber-500 text-white border-amber-600'
                  : isDark
                  ? 'border-slate-700 text-slate-300'
                  : 'border-slate-200 text-slate-600'
              }`}
            >
              <Shuffle className="w-3 h-3" />
              Ngẫu nhiên
            </button>
            <button
              onClick={() => onUpdateSettings({ questionMode: 'sequential' })}
              className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 ${
                settings.questionMode === 'sequential'
                  ? 'bg-amber-500 text-white border-amber-600'
                  : isDark
                  ? 'border-slate-700 text-slate-300'
                  : 'border-slate-200 text-slate-600'
              }`}
            >
              <ListOrdered className="w-3 h-3" />
              Theo thứ tự
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div
          className={`flex border-b text-xs sm:text-sm font-bold px-4 pt-2 gap-2 ${
            isDark ? 'border-slate-800 bg-slate-900' : 'border-amber-100 bg-amber-50/30'
          }`}
        >
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2.5 rounded-t-xl border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'list'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Danh Sách ({questions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2.5 rounded-t-xl border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'add'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Câu Mới (3 Dạng)</span>
          </button>

          <button
            onClick={() => setActiveTab('batch')}
            className={`px-4 py-2.5 rounded-t-xl border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'batch'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Nhập Nhanh Hàng Loạt</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* TAB 1: LIST WITH FILTERS */}
          {activeTab === 'list' && (
            <div className="space-y-3">
              {/* Filter controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" /> Dạng câu:
                  </span>
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'multiple_choice', label: '🎯 Trắc nghiệm' },
                    { id: 'true_false', label: '⚖️ Đúng/Sai' },
                    { id: 'essay', label: '✍️ Tự luận' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFilterType(f.id)}
                      className={`px-2 py-0.5 rounded-lg border transition-all ${
                        filterType === f.id
                          ? 'bg-amber-500 text-white border-amber-600'
                          : isDark
                          ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                          : 'border-slate-200 text-slate-600 hover:bg-amber-50'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleResetDefaults}
                  className={`px-2.5 py-1 rounded-xl border text-xs font-bold flex items-center gap-1 ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                      : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <RefreshCw className="w-3 h-3" />
                  Nạp mẫu THPT
                </button>
              </div>

              {filteredQuestions.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <p className="text-sm font-bold text-slate-500">Không tìm thấy câu hỏi nào phù hợp.</p>
                  <button
                    onClick={() => setActiveTab('add')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-white"
                  >
                    Thêm câu hỏi mới ngay
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {filteredQuestions.map((q, index) => (
                    <div
                      key={q.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                        isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-amber-100 shadow-xs'
                      }`}
                    >
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-black px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            #{index + 1}
                          </span>

                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                              q.type === 'multiple_choice'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : q.type === 'true_false'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                          >
                            {q.type === 'multiple_choice'
                              ? '🎯 Trắc nghiệm A,B,C,D'
                              : q.type === 'true_false'
                              ? '⚖️ Đúng / Sai'
                              : '✍️ Tự luận'}
                          </span>

                          {q.category && (
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                              • {q.category}
                            </span>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
                          {q.content}
                        </p>

                        {/* Options preview for multiple choice */}
                        {q.type === 'multiple_choice' && q.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
                            {q.options.map((opt, i) => (
                              <div
                                key={i}
                                className={`text-[11px] px-2 py-1 rounded-lg border font-semibold truncate ${
                                  i === q.correctOptionIndex || (q.correctAnswer && opt.startsWith(q.correctAnswer))
                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                                    : isDark
                                    ? 'border-slate-700 bg-slate-900/50 text-slate-400'
                                    : 'border-slate-200 bg-slate-50 text-slate-600'
                                }`}
                              >
                                {opt}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* True/False preview */}
                        {q.type === 'true_false' && (
                          <div className="text-[11px] font-bold text-slate-500 pt-0.5">
                            Đáp án:{' '}
                            <span className={q.correctBoolean ? 'text-emerald-600' : 'text-rose-600'}>
                              {q.correctBoolean ? 'ĐÚNG (True)' : 'SAI (False)'}
                            </span>
                          </div>
                        )}

                        {/* Suggested answer */}
                        {q.suggestedAnswer && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                            Gợi ý / Giải thích: {q.suggestedAnswer}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 shrink-0"
                        title="Xóa câu hỏi này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADD SINGLE QUESTION (3 QUESTION TYPES) */}
          {activeTab === 'add' && (
            <form onSubmit={handleAddSingle} className="space-y-4">
              {/* Question Type Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Dạng câu hỏi:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'multiple_choice' as const, label: '🎯 Trắc nghiệm 4 lựa chọn' },
                    { type: 'true_false' as const, label: '⚖️ Đúng / Sai' },
                    { type: 'essay' as const, label: '✍️ Tự luận / Trình bày' }
                  ].map(t => (
                    <button
                      key={t.type}
                      type="button"
                      onClick={() => setNewType(t.type)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                        newType === t.type
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                          : isDark
                          ? 'bg-slate-800 border-slate-700 text-slate-300'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Content */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Nội dung câu hỏi / Đề bài:
                </label>
                <textarea
                  required
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="Nhập nội dung câu hỏi..."
                  rows={2}
                  className={`w-full p-3 rounded-2xl text-xs sm:text-sm border outline-none focus:ring-2 focus:ring-amber-400 ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              {/* Specific Fields for MULTIPLE CHOICE */}
              {newType === 'multiple_choice' && (
                <div className="space-y-2 p-3 rounded-2xl border border-blue-200/60 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20">
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider block">
                    4 Phương Án & Tích Chọn Đáp Án Đúng:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { val: optionA, setVal: setOptionA, label: 'A', idx: 0 },
                      { val: optionB, setVal: setOptionB, label: 'B', idx: 1 },
                      { val: optionC, setVal: setOptionC, label: 'C', idx: 2 },
                      { val: optionD, setVal: setOptionD, label: 'D', idx: 3 }
                    ].map(opt => (
                      <div key={opt.label} className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setCorrectOptionIndex(opt.idx)}
                          className={`w-7 h-7 rounded-lg text-xs font-black shrink-0 transition-all border ${
                            correctOptionIndex === opt.idx
                              ? 'bg-emerald-500 text-white border-emerald-600 ring-2 ring-emerald-300'
                              : isDark
                              ? 'bg-slate-800 border-slate-700 text-slate-300'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                          title={`Chọn ${opt.label} là đáp án đúng`}
                        >
                          {opt.label}
                        </button>
                        <input
                          type="text"
                          required
                          value={opt.val}
                          onChange={e => opt.setVal(e.target.value)}
                          placeholder={`Nội dung lựa chọn ${opt.label}...`}
                          className={`w-full px-2.5 py-1.5 rounded-xl text-xs border outline-none ${
                            isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specific Fields for TRUE / FALSE */}
              {newType === 'true_false' && (
                <div className="p-3 rounded-2xl border border-purple-200/60 dark:border-purple-900/60 bg-purple-50/30 dark:bg-purple-950/20">
                  <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider block mb-2">
                    Đáp án đúng của phát biểu:
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCorrectBoolean(true)}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                        correctBoolean === true
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                          : isDark
                          ? 'bg-slate-800 border-slate-700 text-slate-300'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      ✅ ĐÚNG (True)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCorrectBoolean(false)}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                        correctBoolean === false
                          ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                          : isDark
                          ? 'bg-slate-800 border-slate-700 text-slate-300'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      ❌ SAI (False)
                    </button>
                  </div>
                </div>
              )}

              {/* Common Details: Category, Difficulty, Explanation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Chủ đề / Chuyên đề:
                  </label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    placeholder="Đố vui, Dò bài cũ, Vận dụng..."
                    className={`w-full px-3 py-1.5 rounded-xl text-xs border outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Mức độ thử thách:
                  </label>
                  <select
                    value={newDifficulty}
                    onChange={e => setNewDifficulty(e.target.value as Question['difficulty'])}
                    className={`w-full px-3 py-1.5 rounded-xl text-xs border outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
                    }`}
                  >
                    <option value="Dễ">Dễ</option>
                    <option value="Trung Bình">Trung Bình</option>
                    <option value="Khó">Khó</option>
                    <option value="Siêu Topping">Siêu Topping (Nâng cao)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Giải thích đáp án / Bareme thang điểm (Tùy chọn):
                </label>
                <input
                  type="text"
                  value={newAnswer}
                  onChange={e => setNewAnswer(e.target.value)}
                  placeholder="Giải thích chi tiết hoặc bareme chia điểm..."
                  className={`w-full px-3 py-1.5 rounded-xl text-xs border outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className={`px-4 py-2 rounded-xl border text-xs font-bold ${
                    isDark ? 'border-slate-700' : 'border-slate-200'
                  }`}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-black text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                >
                  Lưu câu hỏi
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: BATCH IMPORT */}
          {activeTab === 'batch' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Dán câu hỏi hàng loạt (Hỗ trợ Trắc nghiệm A,B,C,D, Đúng/Sai hoặc Tự luận):
                </label>
                <textarea
                  value={batchText}
                  onChange={e => setBatchText(e.target.value)}
                  placeholder={`Ví dụ 1: Câu trắc nghiệm (cách nhau dòng trống)
1. Đâu là công thức định luật Ohm?
A. I = U/R
B. I = U*R
C. I = R/U
D. I = U^2
Đáp án: A

Ví dụ 2: Câu đúng sai
2. Quang hợp diễn ra cả ban đêm giải phóng oxy? (Đúng hay sai)
Đáp án: Sai

Ví dụ 3: Câu tự luận
3. Nêu 3 nguyên nhân dẫn đến thắng lợi của chiến dịch Điện Biên Phủ?`}
                  rows={9}
                  className={`w-full p-3.5 rounded-2xl text-xs sm:text-sm border outline-none focus:ring-2 focus:ring-amber-400 ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                      : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={handleBatchImport}
                  className="px-5 py-2.5 rounded-xl font-black text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                >
                  Nhận diện & Nạp vào ngân hàng
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-3.5 border-t flex items-center justify-end ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-amber-50/40 border-amber-100'
          }`}
        >
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl font-black text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </div>
  );
};
