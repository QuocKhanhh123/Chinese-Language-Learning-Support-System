# C-Learning

C-Learning là dự án web hỗ trợ học tiếng Trung, gồm giao diện học tập cho học viên, công cụ quản lý cho giáo viên/admin và backend API xử lý người dùng, khóa học, lớp học, từ vựng, flashcard, bài kiểm tra, thanh toán, thông báo và chấm phát âm.

## Công Nghệ Sử Dụng

- Frontend: React, Vite, React Router, Mantine, MUI, Tailwind CSS, Axios, Zustand.
- Backend: Node.js, Express, MongoDB/Mongoose, JWT, Nodemailer, ZaloPay, Google Generative AI.
- Dịch vụ phát âm tùy chọn: Python FastAPI/Uvicorn và Whisper.

## Cấu Trúc Thư Mục

```text
.
|-- Be/   # Backend Express API
|-- Fe/   # Frontend React/Vite
```

## Yêu Cầu Cài Đặt

- Node.js 18 trở lên
- npm
- MongoDB đang chạy local hoặc MongoDB Atlas
- Python 3.10+ nếu muốn dùng tính năng chấm phát âm bằng Whisper

## Cài Đặt Backend

Di chuyển vào thư mục backend và cài dependency:

```bash
cd Be
npm install
```

Tạo file `.env` trong thư mục `Be`:

```env
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/c-learning

JWT_ACCESS_SECRET=your_access_secret
JWT_ACCESS_EXPIRES=1d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES=7d

CLIENT_URL=http://localhost:5173
APP_FE_URL=http://localhost:5173

MAIL_USER=your_email@gmail.com
MAIL_APP_PASS=your_google_app_password
APP_NAME=C-learning

GEMINI_API_KEY=your_gemini_api_key

ZALOPAY_APP_ID=
ZALOPAY_KEY1=
ZALOPAY_KEY2=
ZALOPAY_CALLBACK_URL=

WHISPER_SERVICE_URL=http://127.0.0.1:8000/transcribe
```

Chạy backend:

```bash
npm start
```

Backend mặc định chạy tại:

```text
http://localhost:4000
```

Có thể seed dữ liệu từ vựng bằng lệnh:

```bash
npm run seed:vocab
```

## Cài Đặt Frontend

Mở terminal mới, di chuyển vào thư mục frontend và cài dependency:

```bash
cd Fe
npm install
```

Chạy frontend:

```bash
npm run dev
```

Frontend mặc định chạy tại:

```text
http://localhost:5173
```

Frontend đang gọi API tới:

```text
http://localhost:4000/api
```

## Chạy Dịch Vụ Whisper

Phần này chỉ cần nếu dùng tính năng chấm điểm phát âm.

Từ thư mục `Be`, cài Python dependency:

```bash
pip install -r scripts/requirements-whisper.txt
```

Chạy Whisper service:

```bash
uvicorn scripts.whisper_service:app --host 127.0.0.1 --port 8000 --reload
```

Một số biến môi trường tùy chọn trong `Be/.env`:

```env
WHISPER_MODEL_SIZE=small
WHISPER_DEVICE=cpu
WHISPER_COMPUTE_TYPE=int8
HF_HUB_DISABLE_SYMLINKS_WARNING=1
HF_TOKEN=hf_your_token
```

## Lệnh Thường Dùng

Backend:

```bash
cd Be
npm start
npm run seed:vocab
```

Frontend:

```bash
cd Fe
npm run dev
npm run build
npm run lint
npm run preview
```

## Quy Trình Chạy Dự Án

1. Chạy MongoDB.
2. Tạo và cấu hình `Be/.env`.
3. Chạy backend bằng `npm start` trong thư mục `Be`.
4. Chạy frontend bằng `npm run dev` trong thư mục `Fe`.
5. Nếu cần chấm phát âm, chạy thêm Whisper service ở cổng `8000`.

## Ghi Chú

- Backend cấu hình CORS cho frontend tại `http://localhost:5173`.
- File upload được phục vụ qua đường dẫn `/static`.
- Các khóa dịch vụ như Gmail, Gemini, ZaloPay nên được quản lý trong `.env` và không commit lên Git.
