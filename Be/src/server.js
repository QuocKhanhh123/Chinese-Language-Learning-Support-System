require("dotenv").config();
const express = require("express");
const path = require("path");
const { connectDB } = require("./config/db");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");
const ApiRes = require("./res/apiRes");

const app = express();

// 1️⃣ CORS TRƯỚC
const corsOptions = {
  origin: "http://localhost:5173", // hoặc '*' nếu em chưa cần cookie
  // credentials: true,            // bật nếu FE dùng withCredentials
};

app.use(cors(corsOptions));
// ❌ BỎ DÒNG NÀY: app.options("*", cors(corsOptions));
// Express + cors middleware tự handle OPTIONS rồi, không cần tự khai báo

// 2️⃣ JSON + URLENCODED SAU CORS, TĂNG LIMIT BODY
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// 3️⃣ Static uploads
app.use("/static", express.static(path.join(__dirname, "../uploads")));

connectDB();

const { startCronJobs } = require("./services/cronJobs");
startCronJobs();

const routes = require("./routes");
app.use("/api", routes);

// 404
app.use((req, res) => {
  ApiRes.notFound(res, `Cannot ${req.method} ${req.originalUrl}`);
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
