const { GoogleGenerativeAI } = require("@google/generative-ai");
const asyncHandler = require("../middleware/asyncHandler");
const ApiRes = require("../res/apiRes");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `Bạn là một giáo viên dạy tiếng Trung chuyên nghiệp, thân thiện và kiên nhẫn tên là "C-learning Assistant". 
Nhiệm vụ của bạn là giúp học viên Việt Nam học tiếng Trung Quốc.

Khi học viên hỏi về một từ vựng tiếng Trung, bạn PHẢI trả lời theo cấu trúc sau:
1. **Từ vựng**: Chữ Hán - Pinyin - Nghĩa tiếng Việt
2. **Phân tích chữ**: Giải thích cấu tạo từng chữ Hán (nếu có)
3. **Ngữ cảnh sử dụng**: Giải thích khi nào dùng từ này, ngữ cảnh phù hợp
4. **Ví dụ câu**: Đưa ra 2-3 câu ví dụ bằng tiếng Trung kèm Pinyin và dịch sang tiếng Việt
5. **Từ liên quan**: Liệt kê 2-3 từ đồng nghĩa hoặc liên quan

Khi học viên hỏi về ngữ pháp, hãy:
- Giải thích cấu trúc ngữ pháp rõ ràng
- Đưa ra công thức dễ nhớ
- Kèm ví dụ minh họa có Pinyin và dịch nghĩa
- So sánh với cấu trúc tương tự nếu có

Quy tắc:
- Luôn trả lời bằng tiếng Việt là chính, kèm tiếng Trung khi cần thiết
- Luôn kèm Pinyin cho mọi chữ Hán
- Giải thích đơn giản, dễ hiểu cho người mới học
- Khuyến khích và động viên học viên
- Nếu học viên hỏi ngoài phạm vi tiếng Trung, hãy nhẹ nhàng nhắc họ quay lại chủ đề học tiếng Trung
- Có thể dùng emoji phù hợp để tạo không khí thân thiện
- Định dạng câu trả lời dễ đọc với markdown`;

const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"];

exports.chat = asyncHandler(async (req, res) => {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
        return ApiRes.badRequest(res, "Vui lòng nhập câu hỏi");
    }

    const chatHistory = history.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
    }));

    let lastError = null;

    for (const modelName of MODELS) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });

            const chat = model.startChat({
                history: [
                    { role: "user", parts: [{ text: "Hãy đóng vai trò giáo viên tiếng Trung theo hướng dẫn." }] },
                    { role: "model", parts: [{ text: SYSTEM_PROMPT }] },
                    ...chatHistory,
                ],
            });

            const result = await chat.sendMessage(message.trim());
            const reply = result.response.text();

            return ApiRes.success(res, "OK", { reply });
        } catch (err) {
            lastError = err;
            if (err.message?.includes("429")) {
                console.log(`Model ${modelName} quota exceeded, trying next...`);
                continue;
            }
            throw err;
        }
    }

    // All models exhausted
    return res.status(429).json({
        success: false,
        message: "Hệ thống AI đang quá tải. Vui lòng thử lại sau 1 phút.",
    });
});
