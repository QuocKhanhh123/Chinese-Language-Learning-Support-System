const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const orderController = require("../controllers/order.controller");

router.post("/create", auth(["student"]), orderController.createOrder);
router.get("/my-orders", auth(["student"]), orderController.getMyOrders);
router.post("/zalopay/callback", orderController.zalopayCallback);
router.post("/zalopay-webhook", orderController.zalopayWebhook); // legacy
router.get("/zalopay/verify", auth(["student"]), orderController.verifyZaloPayPayment);

module.exports = router;
