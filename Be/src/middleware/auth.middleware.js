const jwt = require("jsonwebtoken");
const ApiRes = require("../res/apiRes");
const User = require("../models/User.model");

/**
 * Auth middleware
 * - Verify JWT
 * - Load user from DB
 * - Check status (block only)
 * - Check role
 */
const auth = (roles = []) => {
  return async (req, res, next) => {
    try {
      let token;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      } else if (req.query && req.query.token) {
        token = req.query.token;
      }

      if (!token) {
        return ApiRes.unauthorized(res, "Không có token được cung cấp");
      }

      // 1️⃣ Verify token
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      // 2️⃣ Load user từ DB
      const user = await User.findById(decoded.id).select(
        "_id role status email"
      );

      if (!user) {
        return ApiRes.unauthorized(res, "Người dùng không tồn tại");
      }

      // 3️⃣ Chỉ CHẶN user bị BLOCKED
      if (user.status === "blocked") {
        return ApiRes.unauthorized(res, "Tài khoản đã bị khóa");
      }

      // 4️⃣ Check role nếu có
      if (roles.length && !roles.includes(user.role)) {
        return ApiRes.forbidden(res, "Không đủ quyền truy cập");
      }

      // 5️⃣ Gán user cho request
      req.user = {
        id: user._id.toString(),
        role: user.role,
        status: user.status,
        email: user.email,
      };

      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return ApiRes.unauthorized(res, "Token đã hết hạn");
      }
      if (err.name === "JsonWebTokenError") {
        return ApiRes.unauthorized(res, "Token không hợp lệ");
      }

      console.error("Auth middleware error:", err);
      return ApiRes.unauthorized(res, "Xác thực thất bại");
    }
  };
};

module.exports = auth;
