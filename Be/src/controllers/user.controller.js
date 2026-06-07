const User = require("../models/User.model");
const ApiRes = require("../res/apiRes");
const asyncHandler = require("../middleware/asyncHandler");
const { NotFoundError, ConflictError } = require("../res/AppError");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const { sendAccountCreatedEmail } = require("../utils/email/mailer");

function generateSecurePassword(length = 12) {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+";
  const bytes = crypto.randomBytes(length);
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset[bytes[i] % charset.length];
  }
  return password;
}

const hashToken = (t) => crypto.createHash("sha256").update(t).digest("hex");

// ✅ ADMIN CREATE USER: gửi mật khẩu tạm + link đổi mk lần đầu
exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, role, date_of_birth, sex, phone } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new ConflictError("Email already in use");

  const tempPassword = generateSecurePassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  // token cho đổi mk lần đầu
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 60 phút

  const newUser = new User({
    name,
    email,
    role,
    password: hashedPassword,
    status: "active",
    date_of_birth,
    sex,
    phone,
    password_reset_token_hash: tokenHash,
    password_reset_expires_at: expires,
  });

  await newUser.save();

  const link = `${
    process.env.CLIENT_URL
  }/set-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

  // gửi mail
  await sendAccountCreatedEmail({
    to: email,
    name,
    role,
    password: tempPassword,
    link,
  });

  // response KHÔNG trả password plaintext
  const userResponse = newUser.toObject();
  delete userResponse.password;

  return ApiRes.created(
    res,
    "User created & email sent successfully",
    userResponse
  );
});

// ✅ USER SET FIRST PASSWORD (không cần login)
exports.setFirstPassword = asyncHandler(async (req, res) => {
  const { token, email, newPassword } = req.body;

  if (!token || !email || !newPassword) {
    throw new ConflictError("Missing token/email/newPassword");
  }

  const user = await User.findOne({
    email,
    password_reset_token_hash: hashToken(token),
    password_reset_expires_at: { $gt: new Date() },
  });

  if (!user) throw new ConflictError("Invalid or expired link");

  user.password = await bcrypt.hash(newPassword, 10);
  user.password_reset_token_hash = null;
  user.password_reset_expires_at = null;

  await user.save();

  return ApiRes.success(res, "Đặt mật khẩu lần đầu thành công");
});

exports.getUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 10 } = req.query;
  const filter = {};
  if (role) filter.role = role;

  const users = await User.find(filter)
    .skip((page - 1) * limit)
    .limit(limit)
    .select("-password");

  const totalUsers = await User.countDocuments(filter);

  return ApiRes.success(res, "Danh sách người dùng", {
    users,
    page,
    limit,
    total: totalUsers,
  });
});

exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) throw new NotFoundError("User not found");

  return ApiRes.success(res, "User retrieved successfully", user);
});

exports.changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User not found");

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new ConflictError("Current password is incorrect");

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return ApiRes.success(res, "Đổi mật khẩu thành công");
});

exports.updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  delete updates.password;

  const user = await User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) throw new NotFoundError("User not found");

  return ApiRes.updated(res, "Cập nhật người dùng thành công", user);
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params; // ✅ FIX theo route /delete-user/:userId
  const user = await User.findByIdAndDelete(userId).select("-password");

  if (!user) throw new NotFoundError("User not found");

  return ApiRes.deleted(res, "Người dùng đã bị xóa thành công", {
    deletedUserId: userId,
  });
});

exports.filterUsers = asyncHandler(async (req, res) => {
  const { role, status } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;

  const users = await User.find(filter).select("-password");

  return ApiRes.success(res, "Danh sách người dùng đã được lọc", {
    users,
    total: users.length,
    filters: { role, status },
  });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const updates = req.body;

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) throw new NotFoundError("User not found");

  return ApiRes.success(res, "Cập nhật hồ sơ thành công", user);
});
// ✅ ADMIN: update status active/blocked/pending
exports.updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allow = ["active", "blocked", "pending"];
  if (!allow.includes(status)) throw new ConflictError("Invalid status");

  const user = await User.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) throw new NotFoundError("User not found");
  return ApiRes.updated(res, "Cập nhật trạng thái thành công", user);
});
exports.updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const allowFields = ["name", "phone", "sex", "date_of_birth", "avatar"];
  const updates = {};

  allowFields.forEach((field) => {
    // ❗ BỎ QUA undefined và chuỗi rỗng
    if (req.body[field] !== undefined && req.body[field] !== "") {
      updates[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) throw new NotFoundError("User not found");

  return ApiRes.success(res, "Cập nhật hồ sơ thành công", user);
});
