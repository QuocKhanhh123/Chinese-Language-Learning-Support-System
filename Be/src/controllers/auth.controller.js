const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User.model");
const Session = require("../models/Session.model");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");
const asyncHandler = require("../middleware/asyncHandler");
const ApiRes = require("../res/apiRes");
// ✅ FIX PATH: vì bạn để utils/email/mailer.js
const { sendVerifyEmail } = require("../utils/email/mailer");

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const generateOtp6 = () => String(Math.floor(100000 + Math.random() * 900000));

// REGISTER + SEND VERIFY EMAIL
exports.register = async (req, res) => {
  try {
    const { email, phone, password, name } = req.body;

    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      return res.status(400).json({ message: "Email or phone already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // create OTP (raw) + hash store in DB
    const otp = generateOtp6();
    const verifyHash = hashToken(otp);
    const expiresInMinutes = 15;
    const expires = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    const user = await User.create({
      email,
      phone,
      password: hashed,
      name,
      role: "student",
      status: "pending",
      email_verify_token_hash: verifyHash,
      email_verify_expires_at: expires,
    });

    await sendVerifyEmail({ to: email, name, otp, expiresInMinutes });

    return res.json({
      message: "User registered. Please check email for OTP to verify.",
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// VERIFY OTP ENDPOINT
exports.verifyOtp = async (req, res) => {
  try {
    const { otp, email } = req.body;
    if (!otp || !email) {
      return res.status(400).json({ message: "Missing otp/email" });
    }

    const user = await User.findOne({
      email,
      email_verify_token_hash: hashToken(String(otp).trim()),
      email_verify_expires_at: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.status = "active";
    user.email_verify_token_hash = null;
    user.email_verify_expires_at = null;
    user.email_verified_at = new Date();
    await user.save();

    return res.json({
      message: "Email verified successfully. You can login now.",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// RESEND OTP
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Missing email" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.status === "active") {
      return res.status(400).json({ message: "Account already activated" });
    }

    const otp = generateOtp6();
    const verifyHash = hashToken(otp);
    const expiresInMinutes = 15;
    const expires = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    user.email_verify_token_hash = verifyHash;
    user.email_verify_expires_at = expires;
    await user.save();

    await sendVerifyEmail({
      to: user.email,
      name: user.name,
      otp,
      expiresInMinutes,
    });

    return res.json({ message: "OTP resent. Please check your email." });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// LOGIN (chặn nếu chưa active)
exports.login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    const user = await User.findOne(email ? { email } : { phone });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (user.status !== "active") {
      return res
        .status(403)
        .json({ message: "Account not activated. Please verify email." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const payload = {
      id: user._id,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken({
      sid: crypto.randomUUID(),
      ...payload,
    });

    const { exp } = verifyRefreshToken(refreshToken);

    await Session.create({
      user_id: user._id,
      refresh_token_hash: hashToken(refreshToken),
      ip: req.ip,
      ua: req.headers["user-agent"],
      expires_at: new Date(exp * 1000),
    });

    return res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.refresh = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return res.status(400).json({ message: "Missing refresh_token" });
    }

    const decoded = verifyRefreshToken(refresh_token);
    const tokenHash = hashToken(refresh_token);

    const session = await Session.findOne({
      user_id: decoded.id,
      refresh_token_hash: tokenHash,
      is_revoked: false,
      expires_at: { $gt: new Date() },
    });

    if (!session) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    session.is_revoked = true;
    await session.save();

    const payload = {
      id: decoded.id,
      email: decoded.email,
      phone: decoded.phone,
      role: decoded.role,
    };

    const newAccess = signAccessToken(payload);
    const newRefresh = signRefreshToken({
      sid: crypto.randomUUID(),
      ...payload,
    });

    const { exp } = verifyRefreshToken(newRefresh);

    await Session.create({
      user_id: decoded.id,
      refresh_token_hash: hashToken(newRefresh),
      ip: req.ip,
      ua: req.headers["user-agent"],
      expires_at: new Date(exp * 1000),
    });

    return res.json({ access_token: newAccess, refresh_token: newRefresh });
  } catch (err) {
    return res.status(401).json({ message: "Invalid/expired refresh token" });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return res.status(400).json({ message: "Missing refresh_token" });
    }

    await Session.updateOne(
      { refresh_token_hash: hashToken(refresh_token) },
      { $set: { is_revoked: true } }
    );

    return res.json({ message: "Logged out" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.adminOnly = async (req, res) => {
  return res.json({ message: "Welcome Admin!", user: req.user });
};

exports.promoteToTeacher = async (req, res) => {
  try {
    const { userId } = req.query;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = "teacher";
    await user.save();

    return res.json({
      message: "User promoted to teacher",
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.demoteToStudent = async (req, res) => {
  try {
    const { userId } = req.query;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = "student";
    await user.save();

    return res.json({
      message: "User demoted to student",
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");

  if (!user) {
    return ApiRes.unauthorized(res, "User not found");
  }

  return ApiRes.success(res, "Get profile success", user);
});
