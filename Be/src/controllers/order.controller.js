const asyncHandler = require("../middleware/asyncHandler");
const Class = require("../models/Class.model");
const Order = require("../models/Order.model");
const Enrollment = require("../models/Enrollment.model");
const Notification = require("../models/Notification.model");
const NotificationRecipient = require("../models/NotificationRecipient.model");
const ApiRes = require("../res/ApiRes");
const { NotFoundError, BadRequestError, ConflictError } = require("../res/AppError");
const {
  createZaloPayOrder,
  verifyCallbackPayload,
  queryZaloPayTransaction,
} = require("../services/zalopay.service");

// Gửi thông báo nội bộ cho học viên sau khi ghi danh thành công
async function sendEnrollmentNotification(studentId, cls, order) {
  try {
    const SYSTEM_USER_ID = process.env.SYSTEM_USER_ID || studentId;
    const notification = await Notification.create({
      title: "Đăng ký lớp học thành công",
      message: `Bạn đã đăng ký thành công lớp "${cls.name}". Lớp khai giảng vào ${new Date(cls.startDate).toLocaleDateString("vi-VN")}. Chúc bạn học tốt!`,
      type: "course",
      scope: "individual",
      targetUser: studentId,
      priority: "high",
      status: "published",
      createdBy: SYSTEM_USER_ID,
      stats: { totalRecipients: 1, readCount: 0 },
    });
    await NotificationRecipient.create({
      notification: notification._id,
      user: studentId,
      isRead: false,
    });
  } catch (err) {
    console.error("[Enrollment Notification] Lỗi gửi thông báo:", err.message);
  }
}

async function finalizeEnrollment(orderId, classId, studentId) {
  await Order.findByIdAndUpdate(orderId, {
    status: "paid",
    paymentMethod: "zalopay",
    paidAt: new Date(),
  });

  const cls = await Class.findByIdAndUpdate(
    classId,
    { $addToSet: { studentIds: studentId } },
    { new: true }
  ).populate("course", "title targetLevel");

  if (cls && cls.studentIds.length >= cls.maxStudents) {
    cls.status = "closed";
    await cls.save();
  }

  // Tạo Enrollment record (upsert để tránh trùng)
  if (cls?.course?._id) {
    await Enrollment.findOneAndUpdate(
      { user: studentId, course: cls.course._id },
      { user: studentId, course: cls.course._id, enrolledAt: new Date() },
      { upsert: true, new: true }
    );
  }

  // Gửi thông báo cho học viên
  await sendEnrollmentNotification(studentId, cls, { _id: orderId });
}

function getBackendBaseUrl(req) {
  return process.env.BE_URL || process.env.API_URL || `${req.protocol}://${req.get("host")}`;
}

function getFrontendBaseUrl() {
  return process.env.APP_FE_URL || process.env.CLIENT_URL || "http://localhost:5173";
}

// Học viên tạo đơn đăng ký + tạo giao dịch ZaloPay
exports.createOrder = asyncHandler(async (req, res) => {
  const { classId } = req.body;
  if (!classId) throw new BadRequestError("classId là bắt buộc");

  const cls = await Class.findById(classId).populate("course", "price targetLevel title");
  if (!cls) throw new NotFoundError("Lớp học không tồn tại");

  // 1. Lớp còn mở không?
  if (cls.status !== "open")
    throw new BadRequestError("Lớp học đã đóng, không thể đăng ký");

  // 2. Chưa quá hạn đăng ký không?
  if (new Date() > new Date(cls.registrationDeadline))
    throw new BadRequestError("Đã quá hạn đăng ký lớp học này");

  // 3. Học viên đã trong lớp chưa?
  if (cls.studentIds.map(String).includes(req.user.id))
    throw new ConflictError("Bạn đã đăng ký lớp học này rồi");

  // 4. Còn chỗ không?
  if (cls.studentIds.length >= cls.maxStudents)
    throw new BadRequestError("Lớp học đã đầy");

  // 5. Không có đơn trùng?
  const existingOrder = await Order.findOne({
    student: req.user.id,
    class: classId,
    status: { $in: ["pending", "paid"] },
  });
  if (existingOrder) throw new ConflictError("Bạn đã có đơn đăng ký cho lớp này");

  // 6. Kiểm tra đã đăng ký lớp cùng cấp HSK chưa?
  if (cls.course) {
    const targetLevel = cls.course.targetLevel;
    const sameLevel = await Class.findOne({
      studentIds: req.user.id,
      course: {
        $in: await require("../models/Course.model")
          .find({ targetLevel })
          .distinct("_id"),
      },
    });
    if (sameLevel)
      throw new ConflictError(
        `Bạn đã đăng ký một lớp ${targetLevel} rồi. Mỗi cấp HSK chỉ đăng ký 1 lớp.`
      );
  }

  // Tạo đơn hàng
  const order = await Order.create({
    student: req.user.id,
    class: classId,
    course: cls.course._id,
    amount: cls.course.price || 0,
    paymentMethod: "zalopay",
  });

  // Miễn phí thì hoàn tất trực tiếp, không qua gateway
  if (Number(order.amount) <= 0) {
    await finalizeEnrollment(order._id, classId, req.user.id);
    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Đăng ký thành công (miễn phí)",
      data: {
        orderId: order._id,
        status: "paid",
        paymentUrl: null,
      },
    });
  }

  const backendBaseUrl = getBackendBaseUrl(req);
  const frontendBaseUrl = getFrontendBaseUrl();
  const callbackUrl =
    process.env.ZALOPAY_CALLBACK_URL || `${backendBaseUrl}/api/orders/zalopay/callback`;
  const redirectUrl = `${frontendBaseUrl}/payment-result?orderId=${order._id}`;

  try {
    const { appTransId, response } = await createZaloPayOrder({
      orderId: order._id,
      studentId: req.user.id,
      classId,
      amount: order.amount,
      callbackUrl,
      redirectUrl,
    });

    if (Number(response?.return_code) !== 1 || !response?.order_url) {
      await Order.findByIdAndDelete(order._id);
      throw new BadRequestError(response?.return_message || "Không tạo được giao dịch ZaloPay");
    }

    await Order.findByIdAndUpdate(order._id, {
      gatewayOrderId: appTransId,
      gatewayData: response,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Tạo đơn thành công, chuyển hướng sang ZaloPay",
      data: {
        orderId: order._id,
        status: "pending",
        paymentUrl: response.order_url,
        appTransId,
      },
    });
  } catch (error) {
    await Order.findByIdAndDelete(order._id);
    throw error;
  }
});

// Học viên xem lịch sử đơn hàng
exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ student: req.user.id })
    .populate("class", "name startDate schedule status")
    .populate("course", "title targetLevel thumbnail")
    .sort({ createdAt: -1 });

  return ApiRes.success(res, "Lấy lịch sử đơn hàng thành công", orders);
});

// Callback server-to-server từ ZaloPay
exports.zalopayCallback = async (req, res) => {
  try {
    const { isValid, payload } = verifyCallbackPayload(req.body || {});
    if (!isValid) {
      return res.status(200).json({ return_code: -1, return_message: "invalid mac" });
    }

    const appTransId = payload?.app_trans_id;
    if (!appTransId) {
      return res.status(200).json({ return_code: 0, return_message: "missing app_trans_id" });
    }

    const order = await Order.findOne({ gatewayOrderId: appTransId });
    if (!order) {
      // Trả về success để ZaloPay không retry vô hạn với giao dịch không còn tồn tại
      return res.status(200).json({ return_code: 1, return_message: "success" });
    }

    if (order.status !== "paid") {
      await finalizeEnrollment(order._id, order.class, order.student);
    }

    await Order.findByIdAndUpdate(order._id, {
      gatewayData: {
        ...(order.gatewayData || {}),
        callback: payload,
      },
    });

    return res.status(200).json({ return_code: 1, return_message: "success" });
  } catch (error) {
    console.error("[ZaloPay Callback] error:", error);
    return res.status(200).json({ return_code: 0, return_message: "failed" });
  }
};

// Giữ compatibility với route cũ
exports.zalopayWebhook = exports.zalopayCallback;

exports.verifyZaloPayPayment = asyncHandler(async (req, res) => {
  const { appTransId, orderId } = req.query;

  if (!appTransId && !orderId) {
    throw new BadRequestError("Thiếu appTransId hoặc orderId để kiểm tra giao dịch");
  }

  const order = orderId
    ? await Order.findById(orderId)
    : await Order.findOne({ gatewayOrderId: appTransId });

  if (!order) throw new NotFoundError("Không tìm thấy đơn hàng");
  if (String(order.student) !== String(req.user.id)) {
    throw new BadRequestError("Không có quyền truy cập đơn hàng này");
  }

  const transId = appTransId || order.gatewayOrderId;
  if (!transId) {
    return ApiRes.success(res, "Đã kiểm tra trạng thái", {
      orderId: order._id,
      appTransId: null,
      status: order.status,
      paidAt: order.paidAt,
      gateway: null,
    });
  }

  const gateway = await queryZaloPayTransaction(transId);
  const isPaid = Number(gateway?.return_code) === 1 && Number(gateway?.sub_return_code) === 1;

  if (isPaid && order.status !== "paid") {
    await finalizeEnrollment(order._id, order.class, order.student);
  }

  const refreshed = await Order.findById(order._id);

  return ApiRes.success(res, "Đã kiểm tra trạng thái", {
    orderId: refreshed._id,
    appTransId: transId,
    status: refreshed.status,
    paidAt: refreshed.paidAt,
    gateway,
  });
});

module.exports.finalizeEnrollment = finalizeEnrollment;
