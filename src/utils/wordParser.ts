import mammoth from 'mammoth';
import { Student } from '../types';
import { getRandomTopping } from '../data/mockData';

export interface ParseResult {
  students: Student[];
  warning?: string;
  totalParsed: number;
}

/**
 * Clean up names by removing leading numbering (e.g., "1. ", "01 - ", "1/ ")
 * and removing common header words like "Họ và tên", "STT", "Học sinh".
 */
export function cleanStudentName(rawLine: string): string | null {
  let line = rawLine.trim();
  if (!line) return null;

  // Ignore header rows commonly found in Word documents
  const lower = line.toLowerCase();
  if (
    lower === 'họ và tên' ||
    lower === 'stt' ||
    lower === 'danh sách học sinh' ||
    lower === 'lớp' ||
    lower === 'giới tính' ||
    lower.startsWith('danh sách') ||
    lower.startsWith('bảng điểm') ||
    lower.startsWith('trường thpt')
  ) {
    return null;
  }

  // Remove leading numbers, periods, dashes, tabs, brackets: "1. ", "01. ", "1/ ", "[1] "
  line = line.replace(/^[0-9]+[\.\-\)\/\:\s\]]+/, '').trim();
  // If line has multiple tab/comma separated items (like "1   Nguyen Van A   Nam")
  if (line.includes('\t')) {
    const parts = line.split('\t').map(p => p.trim()).filter(Boolean);
    // Find part that looks like a name (usually letters with length > 2)
    const namePart = parts.find(p => p.length >= 3 && !/^\d+$/.test(p) && !['nam', 'nữ', 'khác'].includes(p.toLowerCase()));
    if (namePart) {
      line = namePart;
    }
  }

  // Check if string is still valid name
  if (line.length < 2 || /^\d+$/.test(line)) {
    return null;
  }

  return line;
}

/**
 * Parse text content into a list of students
 */
export function parseRawTextToStudents(rawText: string, existingCount = 0): ParseResult {
  const lines = rawText.split(/\r?\n/);
  const students: Student[] = [];
  let seq = existingCount + 1;

  for (const rawLine of lines) {
    // If line has comma or semicolon separated list
    if (rawLine.includes(',') && !rawLine.includes('\t') && rawLine.split(',').length > 2) {
      const subItems = rawLine.split(',');
      for (const item of subItems) {
        const cleaned = cleanStudentName(item);
        if (cleaned) {
          students.push({
            id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            code: String(seq).padStart(2, '0'),
            name: cleaned,
            topping: getRandomTopping(),
            calledCount: 0,
            isExcluded: false
          });
          seq++;
        }
      }
      continue;
    }

    const cleaned = cleanStudentName(rawLine);
    if (cleaned) {
      students.push({
        id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        code: String(seq).padStart(2, '0'),
        name: cleaned,
        topping: getRandomTopping(),
        calledCount: 0,
        isExcluded: false
      });
      seq++;
    }
  }

  return {
    students,
    totalParsed: students.length
  };
}

/**
 * Read and parse .docx file using mammoth
 */
export async function parseDocxFile(file: File, existingCount = 0): Promise<ParseResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value;

    if (!text || text.trim().length === 0) {
      return {
        students: [],
        warning: 'Không tìm thấy nội dung văn bản trong file Word này. Hãy kiểm tra lại file .docx.',
        totalParsed: 0
      };
    }

    const parsed = parseRawTextToStudents(text, existingCount);
    if (parsed.students.length === 0) {
      return {
        students: [],
        warning: 'Đã đọc file nhưng không nhận diện được tên học sinh. Bạn có thể dán trực tiếp danh sách vào ô văn bản.',
        totalParsed: 0
      };
    }

    return parsed;
  } catch (err) {
    console.error('Lỗi khi đọc file Word:', err);
    return {
      students: [],
      warning: 'Không thể đọc file Word này. Vui lòng đảm bảo file có định dạng .docx hợp lệ hoặc copy dán trực tiếp.',
      totalParsed: 0
    };
  }
}
