import { Navigate } from "react-router-dom";

// import { useNavigate } from "react-router-dom";
import AdminLayOut from "../layout/AdminLayout";
import MainLayout from "../layout/MainLayout";
import Forbiden from "../page/forbiden/Forbiden";
import ChinesePracticeUI from "../page/Home/Home";
import Login from "../page/Login/Login";
import Register from "../page/Register/Register";
import VerifyEmail from "../page/VerifyEmail/VerifyEmail";
import PageNotFound from "../page/not-found/PageNotFound";

import ProtectedRoute from "./ProtectedRoute";
import TeacherCourse from "../page/teacher-course/TeacherCourse";
import ManageDocumentLayout from "../layout/ManageDocumentLayout";
import ManageFlashcard from "../page/manage-document/ManageFlashcard";
import FlashcardDetail from "../page/FlashcardDetail/FlashcardDetail";
import CreateFlashcard from "../page/flashcard/CreateFlashcard";
import Vocabularies from "../page/Vocabulary/Vocabularies";
import AddVocabulary from "../page/Vocabulary/AddVocabulary";
import VocabularyDetail from "../page/Vocabulary/VocabularyDetail";
import ManageExam from "../page/manage-document/ManageExam";
import PracticeLayout from "../layout/PracticeLayout";
import Deck from "../page/Practice/flashcard/Deck";
import EditExam from "../page/edit-exam/EditExam";
import Course from "../page/admin/pages/Course/Course";
import CreateAccount from "../page/admin/pages/CreateAccount/CreateAccount";
import NewCourse from "../components/new-course/NewCourse";
import Student from "../page/admin/pages/Student/Student";
import Teacher from "../page/admin/pages/Teacher/Teacher";
import AdminCourseDetail from "../page/admin/pages/Course/AdminCourseDetail";
import ExamReport from "../page/exam-report/ExamReport";
import ExamListPage from "../page/Practice/Exam/examList";
import ExamDetailPage from "../page/Practice/Exam/examDetail";
import ExamDoingPage from "../page/Practice/Exam/examDoing";
import ExamResultPage from "../page/Practice/Exam/examResults";
import Flashcard from "../page/Practice/flashcard/Flashcard";
import VocabularyList from "../page/Practice/Vocabulary/Vocabulary";
import VocabularyDetailStudent from "../page/Practice/VocabularyDetail/VocabularyDetail";
import Translate from "../page/Practice/Translate/Translate";
import Voice from "../page/Practice/Voice";
import EditQuestion from "../page/edit-exam/EditQuestion";
import EditListQuestion from "../page/edit-exam/EditListQuestion";
import EditFlashcard from "../page/EditFlashcard/EditFlashcard";
import ReportDetails from "../page/exam-report/report-details/ReportDetails";
import SetPasswordPage from "../page/ResetPassword/ResetPassword";
import UserLayout from "../layout/ProfileLayout";
import ProfileUser from "../page/Login/ProfileUser";
import PinyinPractice from "../page/Practice/Pinyin/PinyinPractice";
import PinyinLevels from "../page/Practice/Pinyin/PinyinLevels";
import KanjiLayout from "../layout/KanjiLayout";
import Event from "../page/Event/Event";
import MainDash from "../page/admin/pages/DashboardContent/Main";
import ProfilePage from "../page/profile/ProfilePage";
import NotificationManagement from "../page/admin/NotificationManagement";
import MyNotifications from "../page/MyNotifications/MyNotifications";
import CourseCatalogue from "../page/Courses/CourseCatalogue";
import CourseDetailPublic from "../page/Courses/CourseDetailPublic";
import CheckoutPage from "../page/Checkout/CheckoutPage";
import MyClassesPage from "../page/MyClasses/MyClassesPage";
import ClassRoomPage from "../page/ClassRoom/ClassRoomPage";
import CreateQuizPage from "../page/ClassRoom/CreateQuizPage";
import TakeQuizPage from "../page/ClassRoom/TakeQuizPage";
import QuizResultsPage from "../page/ClassRoom/QuizResultsPage";
import PaymentResultPage from "../page/PaymentResult/PaymentResultPage";
import TeacherClassesPage from "../page/TeacherClasses/TeacherClassesPage";

// Public routes không cần bảo vệ
export const publicRoutes = [
  {
    path: "/",
    element: <MainLayout isFullWidth={true} />,
    children: [{ index: true, element: <ChinesePracticeUI /> },],
  },
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "register",
    element: <Register />,
  },
  {
    path: "verify-email",
    element: <VerifyEmail />,
  },
  {
    path: "set-password",
    element: <SetPasswordPage />,
  },
  {
    path: "not-allowed",
    element: <Forbiden />,
  },
  {
    path: "*",
    element: <PageNotFound />,
  },
];

// Admin routes, chỉ cho role ADMIN
export const adminRoutes = [
  {
    path: "/admin",
    element: (
      <ProtectedRoute element={<AdminLayOut />} allowedRoles={["admin"]} />
    ),
    children: [
      {
        index: true,
        element: <Navigate to="courses" replace />,
      },
      {
        path: 'main',
        element: <MainDash />,
      },
      {
        path: "students",
        element: <Student />,
      },
      {
        path: "teachers",
        element: <Teacher />,
      },
      {
        path: "courses",
        element: <Course />,
      },
      {
        path: "create-account",
        element: <CreateAccount />,
      },
      {
        path: "notifications",
        element: <NotificationManagement />,
      },
      {
        path: "courses/:courseId",
        element: <AdminCourseDetail />,
      },
      {
        path: "new-course",
        element: <NewCourse isEditMode={false} />,
      },
      {
        path: "edit/:courseId",
        element: <NewCourse isEditMode={true} />,
      },
    ],
  },
];

// // Teacher routes, chỉ cho role TEACHER
export const teacherRoutes = [


  {
    path: "/manage-document",
    element: (
      <ProtectedRoute
        element={<MainLayout isFooter={false} />}
        allowedRoles={["teacher"]}
      />
    ),
    children: [
      {
        path: "",
        element: <ManageDocumentLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="flashcard" replace />,
          },
          { path: "flashcard", element: <ManageFlashcard /> },
          {
            path: "flashcard/create-flashcard",
            element: <CreateFlashcard />,
          },
          {
            path: 'flashcard/edit/:deckId',
            element: <EditFlashcard />,
          },
          {
            path: "flashcard/study/:deckId",
            element: <FlashcardDetail />,
          },
          { path: "exam", element: <ManageExam /> },
          { path: "exam/edit/:examId", element: <EditExam /> },
          {
            path: 'exam/edit/:examId/report',
            element: <ExamReport />,
          },
          {
            path: 'exam/edit/:examId/report/:studentId',
            element: <ReportDetails />,
          },
          {
            path: 'exam/edit/:examId/:questionId',
            element: <EditQuestion />,
          },
          { path: "vocab", element: <Vocabularies /> },
          {
            path: "vocab/create-vocab",
            element: <AddVocabulary />,
          },
          {
            path: "vocab/study/:id",
            element: <VocabularyDetail />,
          },
          //   {
          //       path: 'vocab/edit/:id',
          //       element: <EditFlashcard />,
          //   },
          //   { path: 'kanji', element: <Kanji /> },
          //   {
          //       path: 'kanji/create-kanji',
          //       element: <AddKanji />,
          //   },
        ],
      },
      {
        path: 'exam/edit/:examId/questions',
        element: <EditListQuestion />,
      },
    ],
  },
];

// Profile routes, mọi user đã đăng nhập đều có thể truy cập, bạn có thể mở rộng kiểm soát roles nếu cần
export const profileRoutes = [
  {
    path: '/profile',
    element: (
      <ProtectedRoute
        element={<UserLayout />}
        allowedRoles={['admin', 'teacher', 'student']}
      />
    ),
    children: [
      {
        index: true,
        element: <ProfilePage />
      },
    ],
  },
  {
    path: '/notifications',
    element: (
      <ProtectedRoute
        element={<MainLayout />}
        allowedRoles={['admin', 'teacher', 'student']}
      />
    ),
    children: [
      {
        index: true,
        element: <MyNotifications />
      },
    ],
  },
]

// Event routes
export const eventRoutes = [
  {
    path: '/event',
    element: <KanjiLayout />,
    children: [
      {
        index: true,
        element: <Event />,
      },
    ],
  },
]

// // Practice routes, tùy bạn có thể add role protection nếu muốn
export const practiceRoutes = [
  {
    path: "/practice",
    element: <MainLayout />,
    children: [
      {
        path: "",
        element: <PracticeLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="flashcard" replace />,
          },
          { path: "flashcard", element: <Deck /> },
          { path: 'flashcard/:deckId', element: <Flashcard /> },
          { path: 'vocabulary', element: <VocabularyList /> },
          { path: 'vocabulary/:id', element: <VocabularyDetailStudent /> },
          {
            path: "pinyin",
            children: [
              { index: true, element: <PinyinLevels /> },
              { path: ":level", element: <PinyinPractice /> }
            ]
          },

          // { path: 'memory', element: <MemoryCardGame /> },
          // { path: 'mini-rpg', element: <MiniRPGGame /> },

          { path: 'voice', element: <Voice /> },
          // { path: 'renshuu', element: <Renshuu /> },
          { path: 'translate', element: <Translate /> },

          {
            path: 'exam',
            children: [
              {
                index: true,
                element: <ExamListPage />,
              },
              {
                path: ':exam_id',
                element: <ExamDetailPage />,
              },
              // // {
              // //     path: 'doing/:attemptId',
              // //     element: <ExamDoingPage />,
              // // },
              {
                path: 'result/:attemptId',
                element: <ExamResultPage />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: 'practice/exam/doing/:exam_id',
    element: <ExamDoingPage />,
  },
];

// Routes khóa học & lớp học — dành cho student và teacher
export const courseClassRoutes = [
  {
    path: "/courses",
    element: (
      <ProtectedRoute element={<MainLayout />} allowedRoles={["student"]} />
    ),
    children: [
      { index: true, element: <CourseCatalogue /> },
      { path: ":courseId", element: <CourseDetailPublic /> },
    ],
  },
  {
    path: "/checkout",
    element: (
      <ProtectedRoute element={<MainLayout />} allowedRoles={["student"]} />
    ),
    children: [{ index: true, element: <CheckoutPage /> }],
  },
  {
    path: "/my-classes",
    element: (
      <ProtectedRoute element={<MainLayout />} allowedRoles={["student"]} />
    ),
    children: [{ index: true, element: <MyClassesPage /> }],
  },
  {
    path: "/payment-result",
    element: (
      <ProtectedRoute element={<MainLayout />} allowedRoles={["student"]} />
    ),
    children: [{ index: true, element: <PaymentResultPage /> }],
  },
  {
    path: "/class/:classId",
    element: (
      <ProtectedRoute
        element={<MainLayout />}
        allowedRoles={["student", "teacher"]}
      />
    ),
    children: [
      { index: true, element: <ClassRoomPage /> },
      { path: "create-quiz", element: <CreateQuizPage /> },
      { path: "quiz/:quizId/take", element: <TakeQuizPage /> },
      { path: "quiz/:quizId/results", element: <QuizResultsPage /> },
    ],
  },
  {
    path: "/my-teaching",
    element: (
      <ProtectedRoute element={<MainLayout />} allowedRoles={["teacher"]} />
    ),
    children: [{ index: true, element: <TeacherClassesPage /> }],
  },
];
