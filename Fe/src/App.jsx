import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css' // 👈 NHỚ IMPORT CSS Ở ĐÂY
import './App.css'
import { LoadingProvider } from './contexts/LoadingProvider'
import Router from './route/router'
import ChatBot from './components/chatbot/ChatBot'

function App() {
  return (
    <>
      <LoadingProvider>
        <Router />
      </LoadingProvider>

      {/* ToastContainer GLOBAL, chỉ 1 cái duy nhất ở đây */}
      <ToastContainer
        hideProgressBar
        autoClose={3000}
        position="top-right"
        limit={3}
      />

      {/* ChatBot GLOBAL, hiển thị trên mọi trang */}
      <ChatBot />
    </>
  )
}

export default App