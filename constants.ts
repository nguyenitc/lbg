import { Question, RiskLevel, ScoringResult } from './types';

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Dự án đã có sổ đỏ/hồng chưa?",
    type: 'radio',
    options: [
      { label: "Yes (Đã có)", value: "yes" },
      { label: "No (Chưa có)", value: "no" }
    ]
  },
  {
    id: 2,
    text: "Đất có đang thế chấp không?",
    type: 'radio',
    options: [
      { label: "Không", value: "no" },
      { label: "Có (Đang thế chấp)", value: "yes" }
    ]
  },
  {
    id: 3,
    text: "Tổng vốn cần huy động là bao nhiêu?",
    subText: "Quy đổi ra USD nếu cần (1 USD ≈ 25,000 VND)",
    type: 'number',
    suffix: "Triệu USD",
    placeholder: "Nhập số tiền (Triệu USD)"
  },
  {
    id: 4,
    text: "Đã giải ngân bao nhiêu %?",
    type: 'number',
    suffix: "%",
    placeholder: "0-100"
  },
  {
    id: 5,
    text: "Mục tiêu gọi vốn là gì?",
    type: 'radio',
    options: [
      { label: "Equity / M&A", value: "equity" },
      { label: "Vay ngân hàng", value: "bank" }
    ]
  },
  {
    id: 6,
    text: "Loại hình dự án:",
    type: 'radio',
    options: [
      { label: "Dân cư / Thương mại", value: "residential" },
      { label: "Resort / KCN (Khu công nghiệp)", value: "resort_industrial" }
    ]
  },
  {
    id: 7,
    text: "Vị trí cụ thể của dự án?",
    type: 'radio',
    options: [
      { label: "Gần Metro / Sân bay / Trung tâm", value: "near" },
      { label: "Nông thôn / Vùng xa", value: "far" }
    ]
  },
  {
    id: 8,
    text: "Quy mô dự án (Tổng số căn hoặc diện tích)?",
    subText: "Chọn mức quy mô gần đúng nhất",
    type: 'radio',
    options: [
      { label: "≤ 300 căn hoặc ≤ 100 ha", value: "small" },
      { label: "≥ 500 căn hoặc ≥ 200 ha", value: "large" },
      { label: "Trung bình (Khoảng giữa)", value: "medium" } 
    ]
  },
  {
    id: 9,
    text: "Có kế hoạch ESG không?",
    subText: "Năng lượng xanh, lao động địa phương, v.v.",
    type: 'radio',
    options: [
      { label: "Có", value: "yes" },
      { label: "Không", value: "no" },
      { label: "Đang lên kế hoạch", value: "planning" }
    ]
  },
  {
    id: 10,
    text: "Thời gian cần vốn (áp lực thời gian):",
    type: 'radio',
    options: [
      { label: "Thoải mái (> 30 ngày)", value: "relaxed" },
      { label: "Gấp (< 30 ngày)", value: "urgent" }
    ]
  }
];

export const calculateRiskScore = (answers: { [key: number]: string | number }): number => {
  let score = 0;

  // Q1: Yes (0), No (+10) * 2 = 20
  if (answers[1] === 'no') score += 20;

  // Q2: No (0), Yes (+5) * 1 = 5
  if (answers[2] === 'yes') score += 5;

  // Q3: <= 20M (0), > 50M (+5) * 1. 
  // Note: PDF implies logic for high amount is risk.
  const capital = Number(answers[3] || 0);
  if (capital >= 50) score += 5;

  // Q4: >= 50% (0), < 30% (+5) * 1
  const disbursed = Number(answers[4] || 0);
  if (disbursed < 30) score += 5;

  // Q5: Equity/M&A (0), Bank (+2) * 1
  if (answers[5] === 'bank') score += 2;

  // Q6: Residential (0), Resort/KCN (+3) * 1
  if (answers[6] === 'resort_industrial') score += 3;

  // Q7: Near (0), Far (+5) * 1
  if (answers[7] === 'far') score += 5;

  // Q8: Small (0), Large/Risk (+5) * 1
  if (answers[8] === 'large') score += 5;

  // Q9: Yes (0), No (+3) * 1. "Planning" fits loosely between, but usually strict ESG requires "Yes". 
  // PDF says "No -> +3".
  if (answers[9] === 'no') score += 3;

  // Q10: 30 days (0), <30 days (+5) * 1
  if (answers[10] === 'urgent') score += 5;

  return score;
};

export const getResultClassification = (score: number): ScoringResult => {
  const maxScore = 58; // Derived from sum of max risks

  if (score <= 15) {
    return {
      score,
      maxScore,
      level: RiskLevel.GO,
      confidence: "85-100%",
      message: "Dự án khả thi. Vui lòng gửi brief cho LBG.",
      action: "Thư gửi mời KH gửi brief tự động",
    };
  } else if (score <= 24) {
    return {
      score,
      maxScore,
      level: RiskLevel.CAUTION,
      confidence: "70-84%",
      message: "Dự án chưa khả thi ngay. Vui lòng đăng ký lịch gặp team LBG để tư vấn thêm.",
      action: "Kèm link Calendar để KH đăng ký lịch gặp",
    };
  } else if (score <= 35) {
    return {
      score,
      maxScore,
      level: RiskLevel.NO_GO_SOFT,
      confidence: "50-69%",
      message: "Dự án có rủi ro. Nên hoàn thiện lại hồ sơ trước - 6 tháng sau tái đánh giá.",
      action: "Thư gửi KH cảnh báo mức độ rủi ro",
      emailTemplate: {
        subject: "Cảm ơn anh/chị — Gợi ý để dự án sẵn sàng gọi vốn",
        body: `Kính gửi [Tên],\n\nCảm ơn anh/chị đã chia sẻ thông tin về dự án.\n\nSau khi đánh giá sơ bộ, chúng tôi nhận thấy dự án có tiềm năng, nhưng cần hoàn thiện thêm 2–3 yếu tố để đạt chuẩn gọi vốn quốc tế:\n1. Pháp lý: ________\n2. Tài chính: ________\n3. Thị trường: ________\n\n→ Gợi ý: Anh/chị có thể:\n- Hoàn tất hồ sơ PCCC trong 30 ngày\n- Bổ sung dữ liệu occupancy từ Savills\n- Liên hệ luật sư để làm rõ điều khoản chuyển nhượng`
      }
    };
  } else {
    return {
      score,
      maxScore,
      level: RiskLevel.NO_GO_HARD,
      confidence: "< 50%",
      message: "Dự án rủi ro cao. Chưa đủ điều kiện để LBG hỗ trợ hiệu quả.",
      action: "Thư từ chối lịch sự từ LBG",
    };
  }
};