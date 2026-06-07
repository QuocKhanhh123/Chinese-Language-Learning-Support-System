// src/page/edit-exam/EditExam.jsx
import UploadQuestionsFile from "@/components/edit-exam/UploadQuestionsFile";
import HSKPreview from "./HSK2Preview";
import { useDisclosure } from "@mantine/hooks";
import {
  AlarmOffOutlined,
  AlarmOnOutlined,
  AlignVerticalBottom,
  ArrowBack,
  BookOutlined,
  HourglassBottomTwoTone,
} from "@mui/icons-material";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import ExamModal from "./modal/ExamModal";
import useFetchExamData from "../../hooks/useFetchExamData";
import UploadListeningAudio from "../../components/edit-exam/UploadListeningAudio";

function EditExam() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [opened, { open, close }] = useDisclosure(false);

  const { data: examData, refetch } = useFetchExamData(examId);

  // Nếu exam đã bắt đầu (startTime) thì khoá upload
  const isStartTimeOver = examData?.startTime
    ? dayjs(examData.startTime).isBefore(dayjs())
    : false;

  const allParents = examData?.questions || [];

  return (
    <div className="w-full py-4">
      <ToastContainer
        hideProgressBar
        autoClose={3000}
        style={{ marginTop: "80px" }}
      />

      {/* ====== HEADER ====== */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            className="p-4 pl-0 text-primary rounded-full shadow-sm hover:bg-gray-100"
            onClick={() => navigate("/manage-document/exam")}
            title="Quay lại"
          >
            <ArrowBack />
          </button>
          <div>
            <label className="font-bold text-2xl">Tên thư mục:</label>
            <label className="font-bold text-primary text-2xl ml-2">
              {examData?.title}
            </label>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to={"report"}
            className="rounded-md px-4 py-2 text-sm text-blue-600 border-2 border-solid border-blue-600 duration-150 hover:bg-blue-100"
            onClick={open}
          >
            Thống kê
          </Link>
          <button className="primary-btn" onClick={open}>
            Cài đặt bài thi
          </button>
        </div>
      </div>

      {examData?.description && (
        <p className="my-4 text-gray-500 italic tracking-wider">
          {examData?.description}
        </p>
      )}

      {/* ====== INFO STRIP ====== */}
      <div className="mt-6 w-full flex flex-col justify-center gap-3 items-start">
        <div className="flex justify-center items-center gap-2 text-gray-500">
          <AlarmOnOutlined fontSize="small" />
          Bắt đầu:
          <p className="tracking-wider font-semibold">
            {examData?.scheduleStartAt
              ? dayjs(examData.scheduleStartAt).format("DD/MM/YYYY HH:mm")
              : "Chưa có"}
          </p>
        </div>
        <div className="flex justify-center items-center gap-2 text-gray-500">
          <AlarmOffOutlined fontSize="small" />
          Kết thúc:
          <p className="tracking-wider font-semibold">
            {examData?.scheduleEndAt
              ? dayjs(examData.scheduleEndAt).format("DD/MM/YYYY HH:mm")
              : "Chưa có"}
          </p>
        </div>
        <div className="flex justify-center items-center gap-2 text-gray-500">
          <HourglassBottomTwoTone fontSize="small" />
          Thời gian làm bài:
          <p className="tracking-wider font-semibold">
            {examData?.timeLimitMinutes} phút
          </p>
        </div>
        <div className="flex justify-center items-center gap-2 text-gray-500">
          <BookOutlined fontSize="small" />
          Khóa học:
          <p className="tracking-wider font-semibold">
            {examData?.course?.title}
          </p>
        </div>
        <div className="flex justify-center items-center gap-2 text-gray-500">
          <AlignVerticalBottom fontSize="small" />
          Level:
          <p className="tracking-wider font-semibold">{examData?.level}</p>
        </div>
      </div>

      <hr className="my-6" />

      {/* ====== UPLOAD QUESTIONS + AUDIO ====== */}
      {!isStartTimeOver && (
        <div className="space-y-4">
          {/* Upload audio Nghe (Firebase → URL → BE) */}
          <UploadListeningAudio examId={examId} onUploaded={refetch} />

          {/* Upload câu hỏi từ Word */}
          <div className="border border-gray-300 p-4 rounded shadow bg-white">
            <label className="font-bold text-lg block mb-3">
              Upload câu hỏi từ Microsoft Word (.doc, .docx):
            </label>
            <UploadQuestionsFile onSaveCallback={refetch} />
          </div>
        </div>
      )}

      <hr className="my-8" />

      {/* ====== PREVIEW QUESTIONS – LAYOUT HSK2 ====== */}
      <div>
        <div className="flex justify-between items-center">
          <label className="font-bold text-lg block">Danh sách câu hỏi:</label>
          <Link className="primary-btn " to={"questions"} state={isStartTimeOver}>
            Chỉnh sửa câu hỏi
          </Link>
        </div>

        {allParents.length <= 0 && (
          <div className="text-gray-500 text-sm mt-2">
            Không có câu hỏi nào trong danh sách.
          </div>
        )}

        <HSKPreview
          questions={allParents}
          reading1Images={examData?.reading1Images || []}
          reading2WordBank={examData?.reading2WordBank || []}
          reading4BankFirst={examData?.reading4BankFirst || []}
          reading4BankSecond={examData?.reading4BankSecond || []}
          listeningAudios={examData?.listeningAudios || []} // nếu HSKPreview support
        />
      </div>

      <ExamModal
        opened={opened}
        close={close}
        examData={examData && examData}
        onSubmitCallback={() => {
          refetch();
          toast.success("Cài đặt bài thi đã được lưu!");
        }}
      />
    </div>
  );
}

export default EditExam;