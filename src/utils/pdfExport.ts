import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CallRecord, Student } from '../types';

/**
 * Remove Vietnamese accents for strict standard font PDF compatibility
 */
export function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

export function exportSessionToPdf(options: {
  className: string;
  subjectName: string;
  dateStr: string;
  records: CallRecord[];
  allStudents: Student[];
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const { className, subjectName, dateStr, records, allStudents } = options;

  // Header
  doc.setFontSize(18);
  doc.setTextColor(219, 39, 119); // Pink-600
  doc.text('NE SAO DUOC - KET QUA BUOI HOC', 105, 18, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.text(`Phong cach: Day Chuyen Tra Sua That Lac Topping`, 105, 25, { align: 'center' });

  doc.setLineWidth(0.5);
  doc.setDrawColor(244, 114, 182);
  doc.line(14, 28, 196, 28);

  // Metadata summary
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text(`Lop: ${removeVietnameseTones(className || 'Chua dat')}`, 14, 35);
  doc.text(`Mon hoc: ${removeVietnameseTones(subjectName || 'Khong xac dinh')}`, 14, 41);
  doc.text(`Ngay gio: ${dateStr}`, 14, 47);

  const totalStudents = allStudents.length;
  const calledUnique = new Set(records.map(r => r.studentId)).size;
  const gradedRecords = records.filter(r => typeof r.score === 'number');
  const avgScore = gradedRecords.length > 0
    ? (gradedRecords.reduce((sum, r) => sum + (r.score || 0), 0) / gradedRecords.length).toFixed(1)
    : 'Chua co';

  doc.text(`Tong hoc sinh: ${totalStudents}`, 120, 35);
  doc.text(`So luot da goi: ${records.length} (${calledUnique} hoc sinh)`, 120, 41);
  doc.text(`Diem trung binh: ${avgScore}`, 120, 47);

  // Table Data
  const tableRows = records.map((rec, index) => {
    return [
      index + 1,
      rec.timestamp.split(' ')[1] || rec.timestamp,
      removeVietnameseTones(rec.studentName),
      removeVietnameseTones(rec.toppingName),
      rec.question ? removeVietnameseTones(rec.question) : '(Chi goi ten)',
      rec.score !== undefined ? `${rec.score}d` : '-',
      removeVietnameseTones(rec.gradeStatus),
      rec.teacherNote ? removeVietnameseTones(rec.teacherNote) : ''
    ];
  });

  autoTable(doc, {
    startY: 53,
    head: [['STT', 'Gio', 'Hoc sinh', 'Topping', 'Cau hoi', 'Diem', 'Danh gia', 'Ghi chu']],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [244, 114, 182], // Pink
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 16 },
      2: { cellWidth: 32 },
      3: { cellWidth: 28 },
      4: { cellWidth: 50 },
      5: { cellWidth: 14 },
      6: { cellWidth: 20 },
      7: { cellWidth: 20 }
    }
  });

  // Footer note
  const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(
      `Ne Sao Duoc - He thong goi ten thong minh THPT | Trang ${i}/${pageCount}`,
      105,
      287,
      { align: 'center' }
    );
  }

  const safeFileName = `Ket_qua_${removeVietnameseTones(className || 'Lop')}_${new Date().toISOString().slice(0, 10)}.pdf`.replace(/\s+/g, '_');
  doc.save(safeFileName);
}
