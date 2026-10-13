import { Topping, Student, Question, QuestionPackage, Classroom, SuspenseTheme } from '../types';

export const MILK_TEA_TOPPINGS: Topping[] = [
  { id: 'boba-black', name: 'Trân Châu Đen Hoàng Gia', color: '#2b1e1a', emoji: '🧋', tagline: 'Dai giòn sần sật, né sao được số phận!' },
  { id: 'cheese-foam', name: 'Kem Cheese Mặn Mặn', color: '#ffec99', emoji: '🧀', tagline: 'Béo ngậy ngất ngây, trả lời đỉnh chóp!' },
  { id: 'pudding-egg', name: 'Pudding Trứng Núng Nính', color: '#ffd43b', emoji: '🍮', tagline: 'Mềm mại dịu êm, bài này dễ ợt!' },
  { id: 'golden-boba', name: 'Trân Châu Hoàng Kim', color: '#f59f00', emoji: '✨', tagline: 'Tỏa sáng rực rỡ trước bảng đen!' },
  { id: 'grass-jelly', name: 'Sương Sáo Thanh Mát', color: '#343a40', emoji: '🌿', tagline: 'Hạ nhiệt căng thẳng, tự tin bứt phá!' },
  { id: 'taro-ball', name: 'Khoai Dẻo Dẻo Quẹo', color: '#b197fc', emoji: '🍠', tagline: 'Dẻo dai bền bỉ, 10 điểm về tay!' },
  { id: 'water-chestnut', name: 'Củ Năng Bọc Bột Lọc', color: '#ff8787', emoji: '🍬', tagline: 'Giòn tan bùng nổ, thầy cô vỗ tay!' },
  { id: 'matcha-jelly', name: 'Thạch Trà Xanh Đậm Vị', color: '#69db7c', emoji: '🍵', tagline: 'Tập trung cao độ, thần thái đỉnh cao!' },
  { id: 'aloe-vera', name: 'Nha Đam Giòn Ngọt', color: '#8ce99a', emoji: '🌱', tagline: 'Mát lạnh sảng khoái, không hề run sợ!' },
  { id: 'coconut-jelly', name: 'Thạch Dừa Ngọt Lịm', color: '#e9ecef', emoji: '🥥', tagline: 'Topping quốc dân, gọi trúng là mừng!' }
];

export const getRandomTopping = (): Topping => {
  const index = Math.floor(Math.random() * MILK_TEA_TOPPINGS.length);
  return MILK_TEA_TOPPINGS[index];
};

export const QUESTION_PACKAGES: QuestionPackage[] = [
  {
    id: 'pkg-dovui',
    name: 'Gói Đố Vui Nhanh',
    shortName: '⚡ Đố Vui (1 câu)',
    questionCount: 1,
    description: '1 câu hỏi đố vui/khởi động tạo tiếng cười, phản xạ nhanh cho lớp học.',
    icon: '⚡',
    badgeColor: 'bg-amber-500 text-white',
    categoryFilter: 'Đố vui'
  },
  {
    id: 'pkg-tieuchuan',
    name: 'Gói Kiểm Tra Tiêu Chuẩn',
    shortName: '🎯 Tiêu Chuẩn (2 câu)',
    questionCount: 2,
    description: '2 câu hỏi gồm trắc nghiệm và đúng/sai kiểm tra mức độ nắm kiến thức cốt lõi.',
    icon: '🎯',
    badgeColor: 'bg-blue-500 text-white'
  },
  {
    id: 'pkg-baicu',
    name: 'Gói Dò Bài Cũ Toàn Diện',
    shortName: '📚 Dò Bài Cũ (3 câu)',
    questionCount: 3,
    description: '3 câu hỏi dò bài đầu giờ: 1 trắc nghiệm lý thuyết, 1 câu đúng/sai bẫy đề và 1 câu tự luận trình bày.',
    icon: '📚',
    badgeColor: 'bg-pink-500 text-white',
    categoryFilter: 'Dò bài cũ'
  },
  {
    id: 'pkg-thuthach',
    name: 'Gói Thử Thách 10 Điểm',
    shortName: '🔥 Thử Thách (5 câu)',
    questionCount: 5,
    description: 'Bộ 5 câu hỏi nâng cao đủ mọi dạng: Trắc nghiệm nhiều lựa chọn, Đúng/Sai và Tự luận phân tích.',
    icon: '🔥',
    badgeColor: 'bg-rose-600 text-white'
  }
];

export const DEFAULT_STUDENTS: Student[] = [
  { id: 'st-1', code: '01', name: 'Nguyễn Hoàng An', gender: 'Nam', topping: MILK_TEA_TOPPINGS[0], calledCount: 0, isExcluded: false },
  { id: 'st-2', code: '02', name: 'Trần Thị Mỹ Linh', gender: 'Nữ', topping: MILK_TEA_TOPPINGS[1], calledCount: 0, isExcluded: false },
  { id: 'st-3', code: '03', name: 'Lê Quốc Bảo', gender: 'Nam', topping: MILK_TEA_TOPPINGS[2], calledCount: 0, isExcluded: false },
  { id: 'st-4', code: '04', name: 'Phạm Minh Châu', gender: 'Nữ', topping: MILK_TEA_TOPPINGS[3], calledCount: 0, isExcluded: false },
  { id: 'st-5', code: '05', name: 'Vũ Đức Duy', gender: 'Nam', topping: MILK_TEA_TOPPINGS[4], calledCount: 0, isExcluded: false },
  { id: 'st-6', code: '06', name: 'Hoàng Mai Phương', gender: 'Nữ', topping: MILK_TEA_TOPPINGS[5], calledCount: 0, isExcluded: false },
  { id: 'st-7', code: '07', name: 'Đặng Tuấn Kiệt', gender: 'Nam', topping: MILK_TEA_TOPPINGS[6], calledCount: 0, isExcluded: false },
  { id: 'st-8', code: '08', name: 'Bùi Khánh Vy', gender: 'Nữ', topping: MILK_TEA_TOPPINGS[7], calledCount: 0, isExcluded: false },
  { id: 'st-9', code: '09', name: 'Ngô Gia Huy', gender: 'Nam', topping: MILK_TEA_TOPPINGS[8], calledCount: 0, isExcluded: false },
  { id: 'st-10', code: '10', name: 'Đỗ Thảo Nguyên', gender: 'Nữ', topping: MILK_TEA_TOPPINGS[9], calledCount: 0, isExcluded: false },
  { id: 'st-11', code: '11', name: 'Phan Đình Trí', gender: 'Nam', topping: MILK_TEA_TOPPINGS[0], calledCount: 0, isExcluded: false },
  { id: 'st-12', code: '12', name: 'Lý Kim Ngân', gender: 'Nữ', topping: MILK_TEA_TOPPINGS[1], calledCount: 0, isExcluded: false },
  { id: 'st-13', code: '13', name: 'Hồ Hữu Phước', gender: 'Nam', topping: MILK_TEA_TOPPINGS[2], calledCount: 0, isExcluded: false },
  { id: 'st-14', code: '14', name: 'Dương Yến Nhi', gender: 'Nữ', topping: MILK_TEA_TOPPINGS[3], calledCount: 0, isExcluded: false },
  { id: 'st-15', code: '15', name: 'Cao Tiến Đạt', gender: 'Nam', topping: MILK_TEA_TOPPINGS[4], calledCount: 0, isExcluded: false },
  { id: 'st-16', code: '16', name: 'Trương Ngọc Ánh', gender: 'Nữ', topping: MILK_TEA_TOPPINGS[5], calledCount: 0, isExcluded: false },
  { id: 'st-17', code: '17', name: 'Võ Minh Khôi', gender: 'Nam', topping: MILK_TEA_TOPPINGS[6], calledCount: 0, isExcluded: false },
  { id: 'st-18', code: '18', name: 'Nguyễn Cẩm Tú', gender: 'Nữ', topping: MILK_TEA_TOPPINGS[7], calledCount: 0, isExcluded: false }
];

export const DEFAULT_QUESTIONS: Question[] = [
  // 1. Trắc nghiệm 4 lựa chọn (Multiple Choice)
  {
    id: 'q-mc-1',
    content: 'Theo định luật bảo toàn năng lượng, năng lượng không tự sinh ra cũng không tự mất đi mà chỉ có thể:',
    type: 'multiple_choice',
    options: [
      'A. Chuyển hóa từ dạng này sang dạng khác hoặc truyền từ vật này sang vật khác',
      'B. Tự biến mất khi gặp nhiệt độ cực thấp',
      'C. Nhân đôi khi chuyển qua máy cơ đơn giản',
      'D. Biến thành khối lượng tuyệt đối'
    ],
    correctOptionIndex: 0,
    correctAnswer: 'A',
    category: 'Vật lý & Tự nhiên',
    packageTag: 'baicu',
    difficulty: 'Dễ',
    suggestedAnswer: 'Đáp án A: Năng lượng được bảo toàn, chỉ chuyển hóa giữa các dạng (động năng, thế năng, nhiệt năng...) hoặc truyền từ vật này sang vật khác.'
  },
  {
    id: 'q-mc-2',
    content: 'Trong các chất sau đây, chất nào làm quỳ tím hóa đỏ khi tan trong nước?',
    type: 'multiple_choice',
    options: [
      'A. Dung dịch NaOH',
      'B. Dung dịch Axit Clohiđric (HCl)',
      'C. Dung dịch Muối ăn (NaCl)',
      'D. Dung dịch Rượu Etylic (C2H5OH)'
    ],
    correctOptionIndex: 1,
    correctAnswer: 'B',
    category: 'Hóa học cơ bản',
    packageTag: 'baicu',
    difficulty: 'Dễ',
    suggestedAnswer: 'Đáp án B: Axit HCl phân ly tạo ion H+ làm quỳ tím chuyển màu đỏ.'
  },
  {
    id: 'q-mc-3',
    content: 'Ai là tác giả của bài thơ "Sóng" - một kiệt tác thơ ca tình yêu trong chương trình Ngữ Văn THPT?',
    type: 'multiple_choice',
    options: [
      'A. Nhà thơ Hàn Mặc Tử',
      'B. Nhà thơ Huy Cận',
      'C. Nhà thơ Xuân Quỳnh',
      'D. Nhà thơ Xuân Diệu'
    ],
    correctOptionIndex: 2,
    correctAnswer: 'C',
    category: 'Ngữ Văn THPT',
    packageTag: 'dovui',
    difficulty: 'Dễ',
    suggestedAnswer: 'Đáp án C: Xuân Quỳnh sáng tác bài thơ "Sóng" năm 1967 tại vùng biển Diêm Điền (Thái Bình).'
  },
  {
    id: 'q-mc-4',
    content: 'Đố vui: Có một cây cầu chịu được tải trọng tối đa 10 tấn. Một chiếc xe tải nặng đúng 10 tấn chạy qua. Giữa cầu có một con chim bồ câu đậu xuống nóc xe. Hỏi cây cầu có sập không?',
    type: 'multiple_choice',
    options: [
      'A. Sập ngay lập tức vì quá tải',
      'B. Không sập vì xe chạy đã tiêu hao một lượng xăng đáng kể (lớn hơn trọng lượng chim)',
      'C. Cầu gãy đôi do cộng hưởng rung động',
      'D. Xe rơi xuống sông vì tài xế bấm còi giật mình'
    ],
    correctOptionIndex: 1,
    correctAnswer: 'B',
    category: 'Đố vui trí tuệ',
    packageTag: 'dovui',
    difficulty: 'Trung Bình',
    suggestedAnswer: 'Đáp án B: Xe chạy từ đầu cầu đến giữa cầu đã đốt cháy lượng xăng dầu nặng hơn rất nhiều so với vài lạng của con chim bồ câu!'
  },

  // 2. Câu hỏi Đúng / Sai (True / False)
  {
    id: 'q-tf-1',
    content: 'Khẳng định sau ĐÚNG hay SAI: "Tia X có bước sóng ngắn hơn bước sóng của ánh sáng nhìn thấy và có khả năng đâm xuyên mạnh qua các mô mềm."',
    type: 'true_false',
    correctBoolean: true,
    category: 'Vật lý 12',
    packageTag: 'baicu',
    difficulty: 'Trung Bình',
    suggestedAnswer: 'ĐÚNG: Tia X có bước sóng từ 10^-11 m đến 10^-8 m, ngắn hơn ánh sáng nhìn thấy (0.38 - 0.76 micromet), mang năng lượng cao và đâm xuyên mạnh.'
  },
  {
    id: 'q-tf-2',
    content: 'Khẳng định sau ĐÚNG hay SAI: "Quá trình quang hợp ở thực vật diễn ra cả ban ngày lẫn ban đêm, giải phóng khí Oxy liên tục 24/24."',
    type: 'true_false',
    correctBoolean: false,
    category: 'Sinh học',
    packageTag: 'dovui',
    difficulty: 'Dễ',
    suggestedAnswer: 'SAI: Pha sáng của quang hợp bắt buộc cần ánh sáng mặt trời để quang phân ly nước tạo Oxy. Ban đêm cây hô hấp hấp thụ O2 và thải CO2.'
  },
  {
    id: 'q-tf-3',
    content: 'Khẳng định sau ĐÚNG hay SAI: "Mọi phương trình bậc hai ax² + bx + c = 0 (a ≠ 0) có hệ số a và c trái dấu (a.c < 0) thì luôn có hai nghiệm phân biệt."',
    type: 'true_false',
    correctBoolean: true,
    category: 'Toán học',
    packageTag: 'thuthach',
    difficulty: 'Trung Bình',
    suggestedAnswer: 'ĐÚNG: Vì biệt thức Δ = b² - 4ac. Khi ac < 0 thì -4ac > 0, do đó Δ = b² - 4ac > 0 với mọi b, luôn cho 2 nghiệm phân biệt.'
  },
  {
    id: 'q-tf-4',
    content: 'Đố vui: Khẳng định sau ĐÚNG hay SAI: "Tháng 2 của năm nhuận theo Dương lịch có 29 ngày, và cứ đúng 4 năm thì 100% chắc chắn sẽ có 1 năm nhuận."',
    type: 'true_false',
    correctBoolean: false,
    category: 'Đố vui thiên văn',
    packageTag: 'dovui',
    difficulty: 'Khó',
    suggestedAnswer: 'SAI: Quy tắc năm nhuận: Chia hết cho 4 là năm nhuận, NHƯNG các năm tròn thế kỷ kết thúc bằng 00 (như 1900, 2100) phải chia hết cho 400 mới là năm nhuận!'
  },

  // 3. Câu hỏi Tự luận (Essay / Bài cũ)
  {
    id: 'q-es-1',
    content: 'Nêu định nghĩa và viết công thức then chốt của bài học tiết trước? Giải thích rõ ý nghĩa và đơn vị tính của từng đại lượng trong công thức.',
    type: 'essay',
    category: 'Kiến thức cốt lõi',
    packageTag: 'baicu',
    difficulty: 'Trung Bình',
    suggestedAnswer: 'Thang điểm (10đ):\n- 4đ: Phát biểu định nghĩa chính xác, rành mạch.\n- 3đ: Viết đúng công thức chuẩn.\n- 3đ: Giải thích đúng ký hiệu, tên gọi và đơn vị chuẩn trong hệ SI.'
  },
  {
    id: 'q-es-2',
    content: 'Hãy trình bày tóm tắt 3 luận điểm quan trọng nhất của bài học vừa rồi và lấy 1 ví dụ thực tiễn trong đời sống minh họa?',
    type: 'essay',
    category: 'Khởi động bài cũ',
    packageTag: 'baicu',
    difficulty: 'Trung Bình',
    suggestedAnswer: 'Thang điểm (10đ):\n- 6đ: Nêu đủ 3 luận điểm (mỗi ý 2đ).\n- 4đ: Ví dụ thực tế gần gũi, phân tích logic và thuyết phục.'
  },
  {
    id: 'q-es-3',
    content: 'Tại sao khi giải bài tập dạng này, học sinh thường bị mất điểm ở khâu điều kiện xác định hoặc đổi đơn vị? Hãy chỉ ra bí quyết phòng tránh.',
    type: 'essay',
    category: 'Kỹ năng làm bài',
    packageTag: 'thuthach',
    difficulty: 'Khó',
    suggestedAnswer: 'Học sinh chỉ ra được các lỗi phổ biến (quên đặt điều kiện mẫu số ≠ 0, biểu thức căn ≥ 0, chưa đổi từ km/h sang m/s hoặc từ cm sang m) và cách rà soát.'
  },
  {
    id: 'q-es-4',
    content: 'Đố vui tự luận: Hãy kể tên 3 thứ mà bạn không thể ăn vào bữa sáng?',
    type: 'essay',
    category: 'Đố vui giải trí',
    packageTag: 'dovui',
    difficulty: 'Dễ',
    suggestedAnswer: 'Đáp án đố vui: Bữa trưa, bữa tối và... điểm 0 bài kiểm tra miệng!'
  }
];

export const STUDENTS_12A2: Student[] = [
  { id: 'st-201', code: '01', name: 'Vũ Thảo Vân', gender: 'Nữ', topping: MILK_TEA_TOPPINGS[1], calledCount: 0, isExcluded: false },
  { id: 'st-202', code: '02', name: 'Lê Tuấn Hưng', gender: 'Nam', topping: MILK_TEA_TOPPINGS[0], calledCount: 0, isExcluded: false },
  { id: 'st-203', code: '03', name: 'Nguyễn Quỳnh Nga', gender: 'Nữ', topping: MILK_TEA_TOPPINGS[3], calledCount: 0, isExcluded: false },
  { id: 'st-204', code: '04', name: 'Hoàng Trọng Nghĩa', gender: 'Nam', topping: MILK_TEA_TOPPINGS[4], calledCount: 0, isExcluded: false },
  { id: 'st-205', code: '05', name: 'Đặng Thuỳ Trang', gender: 'Nữ', topping: MILK_TEA_TOPPINGS[2], calledCount: 0, isExcluded: false },
  { id: 'st-206', code: '06', name: 'Bùi Đức Thịnh', gender: 'Nam', topping: MILK_TEA_TOPPINGS[5], calledCount: 0, isExcluded: false },
  { id: 'st-207', code: '07', name: 'Phạm Mai Chi', gender: 'Nữ', topping: MILK_TEA_TOPPINGS[6], calledCount: 0, isExcluded: false },
  { id: 'st-208', code: '08', name: 'Đỗ Thanh Hằng', gender: 'Nữ', topping: MILK_TEA_TOPPINGS[7], calledCount: 0, isExcluded: false },
  { id: 'st-209', code: '09', name: 'Trần Quang Minh', gender: 'Nam', topping: MILK_TEA_TOPPINGS[8], calledCount: 0, isExcluded: false },
  { id: 'st-210', code: '10', name: 'Lâm Gia Hân', gender: 'Nữ', topping: MILK_TEA_TOPPINGS[9], calledCount: 0, isExcluded: false },
  { id: 'st-211', code: '11', name: 'Trịnh Hải Đăng', gender: 'Nam', topping: MILK_TEA_TOPPINGS[0], calledCount: 0, isExcluded: false },
  { id: 'st-212', code: '12', name: 'Chu Ngọc Bích', gender: 'Nữ', topping: MILK_TEA_TOPPINGS[1], calledCount: 0, isExcluded: false },
  { id: 'st-213', code: '13', name: 'Lương Vĩnh Phát', gender: 'Nam', topping: MILK_TEA_TOPPINGS[2], calledCount: 0, isExcluded: false },
  { id: 'st-214', code: '14', name: 'Phan Diệu Linh', gender: 'Nữ', topping: MILK_TEA_TOPPINGS[3], calledCount: 0, isExcluded: false },
  { id: 'st-215', code: '15', name: 'Huỳnh Tấn Tài', gender: 'Nam', topping: MILK_TEA_TOPPINGS[4], calledCount: 0, isExcluded: false },
  { id: 'st-216', code: '16', name: 'Tạ Thu Phương', gender: 'Nữ', topping: MILK_TEA_TOPPINGS[5], calledCount: 0, isExcluded: false }
];

export const STUDENTS_11B3: Student[] = [
  { id: 'st-301', code: '01', name: 'Phan Bảo Hân', gender: 'Nữ', topping: MILK_TEA_TOPPINGS[2], calledCount: 0, isExcluded: false },
  { id: 'st-302', code: '02', name: 'Trương Gia Khiêm', gender: 'Nam', topping: MILK_TEA_TOPPINGS[0], calledCount: 0, isExcluded: false },
  { id: 'st-303', code: '03', name: 'Mai Hoàng Phúc', gender: 'Nam', topping: MILK_TEA_TOPPINGS[4], calledCount: 0, isExcluded: false },
  { id: 'st-304', code: '04', name: 'Lê Phương Thảo', gender: 'Nữ', topping: MILK_TEA_TOPPINGS[1], calledCount: 0, isExcluded: false },
  { id: 'st-305', code: '05', name: 'Nguyễn Đình Quân', gender: 'Nam', topping: MILK_TEA_TOPPINGS[3], calledCount: 0, isExcluded: false },
  { id: 'st-306', code: '06', name: 'Đoàn Bảo Trâm', gender: 'Nữ', topping: MILK_TEA_TOPPINGS[7], calledCount: 0, isExcluded: false },
  { id: 'st-307', code: '07', name: 'Vương Kiến Huy', gender: 'Nam', topping: MILK_TEA_TOPPINGS[5], calledCount: 0, isExcluded: false },
  { id: 'st-308', code: '08', name: 'Tống Khánh An', gender: 'Nữ', topping: MILK_TEA_TOPPINGS[6], calledCount: 0, isExcluded: false },
  { id: 'st-309', code: '09', name: 'Nguyễn Minh Trí', gender: 'Nam', topping: MILK_TEA_TOPPINGS[8], calledCount: 0, isExcluded: false },
  { id: 'st-310', code: '10', name: 'Đào Thục Quyên', gender: 'Nữ', topping: MILK_TEA_TOPPINGS[9], calledCount: 0, isExcluded: false },
  { id: 'st-311', code: '11', name: 'Cao Bá Quát', gender: 'Nam', topping: MILK_TEA_TOPPINGS[0], calledCount: 0, isExcluded: false },
  { id: 'st-312', code: '12', name: 'Lý Diễm My', gender: 'Nữ', topping: MILK_TEA_TOPPINGS[1], calledCount: 0, isExcluded: false },
  { id: 'st-313', code: '13', name: 'Tạ Tuấn Anh', gender: 'Nam', topping: MILK_TEA_TOPPINGS[2], calledCount: 0, isExcluded: false },
  { id: 'st-314', code: '14', name: 'Phạm Hương Giang', gender: 'Nữ', topping: MILK_TEA_TOPPINGS[3], calledCount: 0, isExcluded: false },
  { id: 'st-315', code: '15', name: 'Bùi Nhật Nam', gender: 'Nam', topping: MILK_TEA_TOPPINGS[4], calledCount: 0, isExcluded: false }
];

export const DEFAULT_CLASSES: Classroom[] = [
  {
    id: 'cls-12a1',
    name: 'Lớp 12A1',
    subject: 'Khoa Học Tự Nhiên & Vật Lý',
    grade: 'Khối 12',
    students: DEFAULT_STUDENTS,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-20T08:00:00.000Z',
    description: 'Lớp Tự Nhiên mũi nhọn - 18 học sinh'
  },
  {
    id: 'cls-12a2',
    name: 'Lớp 12A2',
    subject: 'Khoa Học Xã Hội & Ngữ Văn',
    grade: 'Khối 12',
    students: STUDENTS_12A2,
    createdAt: '2026-09-02T08:00:00.000Z',
    updatedAt: '2026-09-20T08:00:00.000Z',
    description: 'Lớp Xã Hội năng động - 16 học sinh'
  },
  {
    id: 'cls-11b3',
    name: 'Lớp 11B3',
    subject: 'Tiếng Anh & Ngoại Ngữ',
    grade: 'Khối 11',
    students: STUDENTS_11B3,
    createdAt: '2026-09-05T08:00:00.000Z',
    updatedAt: '2026-09-20T08:00:00.000Z',
    description: 'Lớp Ngoại Ngữ giao lưu - 15 học sinh'
  }
];

export interface SuspenseThemeInfo {
  id: SuspenseTheme;
  name: string;
  shortName: string;
  tagline: string;
  icon: string;
  badge: string;
  description: string;
}

export const SUSPENSE_THEMES: SuspenseThemeInfo[] = [
  {
    id: 'millionaire',
    name: 'Ai Là Triệu Phú (Gameshow Căng Thẳng)',
    shortName: 'Ai Là Triệu Phú',
    tagline: 'Tiếng bass u ám, nhịp đập đếm ngược và cú nổ chấn động khi bốc trúng tên',
    icon: '🏆',
    badge: 'Kịch Tính Đỉnh Cao',
    description: 'Hồi hộp phong cách gameshow truyền hình nghẹt thở, nốt thăng trầm rùng rợn và tiếng nổ âm trầm.'
  },
  {
    id: 'drumroll',
    name: 'Hồi Trống Rung Nghẹt Thở (Dramatic Drumroll)',
    shortName: 'Hồi Trống Rung',
    tagline: 'Tiếng trống dồn dập rền vang tăng tốc đến nghẹt thở & cồng chiêng bùng nổ',
    icon: '🥁',
    badge: 'Cực Kỳ Hồi Hộp',
    description: 'Trống lăn dồn dập (snare & timpani roll) tăng tốc nghẹt thở và cú va chũm chọe (cymbal crash) hoành tráng.'
  },
  {
    id: 'cinematic_heartbeat',
    name: 'Nhịp Tim Bom Tấn (Cinematic Heartbeat)',
    shortName: 'Nhịp Tim Đập',
    tagline: 'Tiếng tim đập dồn dập thình thịch rung chuyển khán phòng & tiếng rít nâng tông',
    icon: '💓',
    badge: 'Đau Tim Thót Tim',
    description: 'Tiếng đập đục thấu tim (Lub-Dub) tăng dần tốc độ cùng hiệu ứng kèn Inception bùng nổ.'
  },
  {
    id: 'squid_suspense',
    name: 'Đồng Hồ Sinh Tử (Countdown Clock & Bell)',
    shortName: 'Đồng Hồ Sinh Tử',
    tagline: 'Tiếng gõ tích tắc đồng hồ cơ dồn dập đếm lùi từng giây sinh tử',
    icon: '⏱️',
    badge: 'Gấp Gáp Hồi Hộp',
    description: 'Tích tắc đồng hồ cơ tăng tốc gắt gao, tiếng chuông đồng hồ báo động nghẹt thở.'
  }
];

