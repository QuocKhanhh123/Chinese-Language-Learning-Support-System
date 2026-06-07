import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useExamById, useStartExam } from '@/hooks/useExam';

const ExamStartPage = () => {
  const { exam_id } = useParams();
  const { data: exam, isLoading } = useExamById(exam_id);
  const { mutate: startExam, isLoading: isStarting } = useStartExam();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  if (isLoading) return <div>Đang tải thông tin bài thi...</div>;
  if (!exam) return <div>Không tìm thấy thông tin bài thi</div>;

  const handleStartExam = () => {
    if (!exam_id) {
      setError('Không tìm thấy ID bài thi');
      return;
    }

    console.log('Starting exam with ID:', exam_id);
    setError(null);
    startExam(exam_id, {
      onSuccess: (res) => {
        console.log('Start exam response:', res);
        if (res?.attemptId) {
          const targetUrl = `/practice/exam/doing/${res.attemptId}`;
          console.log('Navigating to:', targetUrl);
          navigate(targetUrl);
        } else {
          setError('Phản hồi từ server không chứa attemptId. Vui lòng thử lại.');
        }
      },
      onError: (error) => {
        console.error('Start exam error:', error);
        setError(error.message || 'Có lỗi xảy ra khi bắt đầu bài thi');
      },
    });
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Bắt đầu bài thi</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">{exam.title}</h2>
        <p className="text-gray-600 mb-6">{exam.description}</p>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between">
            <span className="text-gray-600">Thời gian:</span>
            <span className="font-medium">{exam.time_limit} phút</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Điểm đạt:</span>
            <span className="font-medium">{exam.passingScore} điểm</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Số câu hỏi:</span>
            <span className="font-medium">
              {exam.sections.reduce((total, section) => total + (section.questions?.length || 0), 0)} câu
            </span>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4">Lưu ý:</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Bạn không thể thoát khỏi bài thi sau khi bắt đầu</li>
            <li>Hệ thống sẽ tự động nộp bài khi hết thời gian</li>
            <li>Đảm bảo kết nối internet ổn định trong quá trình làm bài</li>
          </ul>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={() => navigate(`/practice/exam/detail/${exam_id}`)}
            className="px-6 py-2 border rounded hover:bg-gray-50"
          >
            Quay lại
          </button>
          <button
            onClick={handleStartExam}
            disabled={isStarting}
            className={`px-6 py-2 rounded ${
              isStarting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            } text-white`}
          >
            {isStarting ? 'Đang xử lý...' : 'Bắt đầu làm bài'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamStartPage;