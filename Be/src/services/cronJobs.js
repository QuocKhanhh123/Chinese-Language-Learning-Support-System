const cron = require("node-cron");
const Class = require("../models/Class.model");

function startCronJobs() {
  // Mỗi ngày lúc 00:00 giờ Việt Nam — tự động đóng các lớp hết hạn đăng ký
  cron.schedule(
    "0 0 * * *",
    async () => {
      try {
        const now = new Date();
        const result = await Class.updateMany(
          { status: "open", registrationDeadline: { $lt: now } },
          { $set: { status: "closed" } }
        );
        console.log(`[CRON] Auto-closed ${result.modifiedCount} class(es) at ${now.toISOString()}`);
      } catch (err) {
        console.error("[CRON] Auto-close classes error:", err);
      }
    },
    { timezone: "Asia/Ho_Chi_Minh" }
  );

  console.log("[CRON] Cron jobs started.");
}

module.exports = { startCronJobs };
