import axiosInstance from "@/network/httpRequest";

// ✅ Tạo 1 câu hỏi đơn cho exam (nếu vẫn muốn dùng form lẻ)
const createQuestionExam = async (examId, parentQuestion) => {
  // parentQuestion phải có dạng giống 1 phần tử trong newQuestions:
  // {
  //   parentQuestion: string,
  //   paragraph: string,
  //   imgUrl: string,
  //   audioUrl: string,
  //   childQuestions: [
  //     { content, type, correctAnswer, options: [{id,text}, ...] }
  //   ]
  // }
  return await axiosInstance.post(`/exams/${examId}/questions`, {
    newQuestions: [parentQuestion],
  });
};

// ✅ Update 1 câu hỏi trong exam (tuỳ BE bạn có route này hay không)
const updateQuestionExam = async (examId, questionId, data) => {
  // data cũng là 1 "parentQuestion" đã map đúng format
  return await axiosInstance.put(
    `/exams/${examId}/questions/${questionId}`,
    data
  );
};

// ✅ Renshuu (giữ nguyên như cũ)
const createQuestionRevision = async (data) => {
  return await axiosInstance.post(`/renshuu`, data);
};

const updateQuestionRevision = async (data) => {
  return await axiosInstance.put(`/renshuu/question`, data);
};

// ✅ Hàm dùng trong UploadQuestionsFile – GỬI ĐÚNG newQuestions
const saveQuestions = (examId, body) => {
  const payload = Array.isArray(body) ? { newQuestions: body } : body;
  return axiosInstance.post(`/exams/${examId}/questions`, payload);
};

export const getExamQuestions = (examId) => {
  return axiosInstance.get(`/exams/${examId}/questions`);
};
export {
  createQuestionExam,
  createQuestionRevision,
  saveQuestions,
  updateQuestionExam,
  updateQuestionRevision,
};
