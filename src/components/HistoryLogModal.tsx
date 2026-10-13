import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  History,
  Download,
  Printer,
  Trash2,
  Award,
  Users,
  CheckCircle,
  FileCheck
} from 'lucide-react';
import { CallRecord, Student, AppSettings } from '../types';
import { exportSessionToPdf } from '../utils/pdfExport';
import { soundManager } from '../utils/audio';

interface HistoryLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: CallRecord[];
  allStudents: Student[];
  settings: AppSettings;
  onClearHistory: () => void;
  isDark: boolean;
}

export const HistoryLogModal: React.FC<HistoryLogModalProps> = ({
  isOpen,
  onClose,
  records,
  allStudents,
  settings,
  onClearHistory,
  isDark
}) => {
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const gradedRecords = records.filter(r => typeof r.score === 'number');
  const avgScore = gradedRecords.length > 0
    ? (gradedRecords.reduce((sum, r) => sum + (r.score || 0), 0) / gradedRecords.length).toFixed(1)
    : 'Chưa có';

  const excellentCount = records.filter(r => (r.score || 0) >= 9).length;

  const handleExportPdf = () => {
    setIsExporting(true);
    soundManager.playCorrectSound();

    try {
      exportSessionToPdf({
        className: settings.className || 'Lớp 12A1',
        subjectName: settings.subjectName || 'Bài Học',
        dateStr: new Date().toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        records,
        allStudents
      });
    } catch (err) {
      console.error('Lỗi xuất PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintView = () => {
    // Open a clean printable report window that can be saved directly as PDF in high quality
    const printWin = window.open('', '_blank');
    if (!printWin) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Kết Quả Buổi Học - ${settings.className || 'Né Sao Được'}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #1e293b; }
          .header { text-align: center; border-bottom: 2px solid #ec4899; padding-bottom: 12px; margin-bottom: 16px; }
          .title { font-size: 22px; font-weight: bold; color: #db2777; margin: 0; }
          .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
          .meta-grid { display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 13px; background: #fdf2f8; padding: 12px; border-radius: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th { background: #f472b6; color: white; padding: 8px; text-align: left; }
          td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
          tr:nth-child(even) { background-color: #fafafa; }
          .badge { padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 11px; }
          .footer { margin-top: 24px; text-align: right; font-size: 13px; color: #475569; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">BÁO CÁO KẾT QUẢ BUỔI HỌC - NÉ SAO ĐƯỢC</div>
          <div class="subtitle">Phong cách: Dây Chuyền Trà Sữa Thất Lạc Topping</div>
        </div>
        <div class="meta-grid">
          <div>
            <p><strong>Lớp học:</strong> ${settings.className || '12A1'}</p>
            <p><strong>Môn học:</strong> ${settings.subjectName || 'Không xác định'}</p>
            <p><strong>Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}</p>
          </div>
          <div>
            <p><strong>Tổng sĩ số:</strong> ${allStudents.length} học sinh</p>
            <p><strong>Số lượt gọi:</strong> ${records.length} lượt</p>
            <p><strong>Điểm trung bình:</strong> ${avgScore} điểm</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 40px">STT</th>
              <th style="width: 70px">Thời gian</th>
              <th>Họ và tên</th>
              <th>Topping Trà Sữa</th>
              <th>Câu hỏi</th>
              <th style="width: 60px">Điểm</th>
              <th>Đánh giá</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            ${records.map((r, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${r.timestamp}</td>
                <td><strong>${r.studentName}</strong></td>
                <td>${r.toppingName}</td>
                <td>${r.question || '<i>(Chỉ gọi tên)</i>'}</td>
                <td><strong>${r.score !== undefined ? r.score + 'đ' : '-'}</strong></td>
                <td>${r.gradeStatus}</td>
                <td>${r.teacherNote || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          <p><i>Ngày ..... tháng ..... năm 2026</i></p>
          <p style="margin-top: 40px"><strong>Giáo viên bộ môn</strong></p>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;
    printWin.document.write(html);
    printWin.document.close();
  };

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
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5" />
            <div>
              <h3 className="font-extrabold text-base sm:text-lg font-['Comfortaa',cursive]">
                Lịch Sử Buổi Học & Xuất File PDF
              </h3>
              <p className="text-xs text-blue-100 font-semibold">
                Lưu trữ kết quả gọi tên, điểm số và câu trả lời của học sinh
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

        {/* Quick Stats Cards */}
        <div className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-slate-200 dark:border-slate-800">
          <div
            className={`p-3 rounded-2xl border text-center ${
              isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-pink-50/60 border-pink-200'
            }`}
          >
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Số lượt gọi</span>
            <p className="text-xl font-black text-pink-600 dark:text-pink-400 mt-0.5">{records.length}</p>
          </div>

          <div
            className={`p-3 rounded-2xl border text-center ${
              isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-blue-50/60 border-blue-200'
            }`}
          >
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Đã chấm điểm</span>
            <p className="text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5">{gradedRecords.length}</p>
          </div>

          <div
            className={`p-3 rounded-2xl border text-center ${
              isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-emerald-50/60 border-emerald-200'
            }`}
          >
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Điểm trung bình</span>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{avgScore}</p>
          </div>

          <div
            className={`p-3 rounded-2xl border text-center ${
              isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-amber-50/60 border-amber-200'
            }`}
          >
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Xuất sắc (9-10đ)</span>
            <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{excellentCount}</p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400">
              Lớp: <strong>{settings.className || '12A1'}</strong> • Môn:{' '}
              <strong>{settings.subjectName || 'Tự chọn'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct PDF Download */}
            <button
              id="btn-download-pdf"
              onClick={handleExportPdf}
              disabled={records.length === 0 || isExporting}
              className={`px-4 py-2 rounded-xl font-black flex items-center gap-1.5 transition-all shadow-xs ${
                records.length === 0
                  ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-pink-500/20'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Xuất File PDF</span>
            </button>

            {/* Print / High quality browser PDF */}
            <button
              onClick={handlePrintView}
              disabled={records.length === 0}
              className={`px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-colors ${
                records.length === 0
                  ? 'border-slate-200 text-slate-400 cursor-not-allowed'
                  : isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                  : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
              title="Mở giao diện in và lưu PDF trực tiếp từ trình duyệt"
            >
              <Printer className="w-4 h-4 text-blue-500" />
              <span className="hidden sm:inline">In / Lưu PDF Chuẩn</span>
            </button>

            {records.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Bạn có chắc muốn xóa sạch lịch sử gọi tên buổi học này không?')) {
                    onClearHistory();
                  }
                }}
                className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-900"
                title="Xóa lịch sử buổi học"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Records Table */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {records.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <span className="text-4xl">📋</span>
              <p className="font-extrabold text-sm text-slate-500 dark:text-slate-400">
                Chưa có lượt gọi tên nào trong buổi học này!
              </p>
              <p className="text-xs text-slate-400">
                Hãy quay dây chuyền trà sữa để bắt đầu gọi học sinh nhé.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr
                    className={`border-b text-slate-500 dark:text-slate-400 uppercase tracking-wider ${
                      isDark ? 'border-slate-800' : 'border-slate-200'
                    }`}
                  >
                    <th className="py-2.5 px-3">STT</th>
                    <th className="py-2.5 px-3">Thời gian</th>
                    <th className="py-2.5 px-3">Học sinh</th>
                    <th className="py-2.5 px-3">Topping</th>
                    <th className="py-2.5 px-3">Câu hỏi</th>
                    <th className="py-2.5 px-3">Điểm</th>
                    <th className="py-2.5 px-3">Đánh giá</th>
                    <th className="py-2.5 px-3">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {records.map((rec, index) => (
                    <tr
                      key={rec.id}
                      className={`hover:bg-pink-50/30 dark:hover:bg-slate-800/50 transition-colors ${
                        isDark ? 'text-slate-200' : 'text-slate-800'
                      }`}
                    >
                      <td className="py-3 px-3 font-bold text-slate-400">{index + 1}</td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-500 dark:text-slate-400">
                        {rec.timestamp}
                      </td>
                      <td className="py-3 px-3 font-black whitespace-nowrap text-slate-900 dark:text-white">
                        {rec.studentName}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-amber-700 dark:text-amber-400 font-bold">
                        {rec.toppingName}
                      </td>
                      <td className="py-3 px-3 max-w-[220px]" title={rec.question}>
                        {rec.packageName && (
                          <span className="inline-block text-[10px] font-black px-1.5 py-0.2 rounded bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 mr-1">
                            {rec.packageName}
                          </span>
                        )}
                        <span className="truncate inline-block max-w-[150px] align-middle">
                          {rec.question || <span className="text-slate-400 italic">(Chỉ gọi tên)</span>}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-black">
                        {rec.score !== undefined ? (
                          <span
                            className={`px-2 py-0.5 rounded-md ${
                              rec.score >= 8
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : rec.score >= 5
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {rec.score}đ
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          {rec.gradeStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400 italic max-w-[140px] truncate">
                        {rec.teacherNote || ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-3.5 border-t flex items-center justify-between text-xs font-bold ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <span className="text-slate-500 dark:text-slate-400">
            Dữ liệu được lưu trữ trực tiếp trong buổi học
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl font-black bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white shadow-xs"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </div>
  );
};
