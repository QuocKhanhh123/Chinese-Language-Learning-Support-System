const crypto = require("crypto");
const axios = require("axios");

const APP_ID = process.env.ZALOPAY_APP_ID;
const KEY1 = process.env.ZALOPAY_KEY1;
const KEY2 = process.env.ZALOPAY_KEY2;
const CREATE_ENDPOINT =
    process.env.ZALOPAY_CREATE_ENDPOINT || "https://sb-openapi.zalopay.vn/v2/create";
const QUERY_ENDPOINT =
    process.env.ZALOPAY_QUERY_ENDPOINT || "https://sb-openapi.zalopay.vn/v2/query";

function assertConfig() {
    if (!APP_ID || !KEY1 || !KEY2) {
        throw new Error("Thiếu cấu hình ZaloPay trong .env");
    }
}

function hmacSHA256(data, key) {
    return crypto.createHmac("sha256", key).update(data).digest("hex");
}

function formatYYMMDD(date = new Date()) {
    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yy}${mm}${dd}`;
}

function generateAppTransId(orderId) {
    return `${formatYYMMDD()}_${String(orderId)}`;
}

async function createZaloPayOrder({ orderId, studentId, classId, amount, callbackUrl, redirectUrl }) {
    assertConfig();

    const appTransId = generateAppTransId(orderId);
    const appTime = Date.now();
    const appUser = String(studentId);
    const embedData = JSON.stringify({
        orderId: String(orderId),
        classId: String(classId),
        redirecturl: redirectUrl,
    });
    const item = JSON.stringify([
        {
            orderId: String(orderId),
            classId: String(classId),
            amount: Number(amount),
        },
    ]);

    const macData = `${APP_ID}|${appTransId}|${appUser}|${amount}|${appTime}|${embedData}|${item}`;
    const mac = hmacSHA256(macData, KEY1);

    const payload = {
        app_id: APP_ID,
        app_user: appUser,
        app_time: appTime,
        amount: Number(amount),
        app_trans_id: appTransId,
        embed_data: embedData,
        item,
        description: `Thanh toán đơn hàng #${orderId}`,
        bank_code: "",
        callback_url: callbackUrl,
        mac,
    };

    const form = new URLSearchParams(payload);
    const { data } = await axios.post(CREATE_ENDPOINT, form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 20000,
    });

    return { appTransId, response: data };
}

function verifyCallbackPayload({ data, mac }) {
    assertConfig();
    if (!data || !mac) return { isValid: false, payload: null };

    const expectedMac = hmacSHA256(data, KEY2);
    if (expectedMac !== mac) {
        return { isValid: false, payload: null };
    }

    return { isValid: true, payload: JSON.parse(data) };
}

async function queryZaloPayTransaction(appTransId) {
    assertConfig();
    const macData = `${APP_ID}|${appTransId}|${KEY1}`;
    const mac = hmacSHA256(macData, KEY1);

    const form = new URLSearchParams({
        app_id: APP_ID,
        app_trans_id: appTransId,
        mac,
    });

    const { data } = await axios.post(QUERY_ENDPOINT, form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 20000,
    });

    return data;
}

module.exports = {
    createZaloPayOrder,
    verifyCallbackPayload,
    queryZaloPayTransaction,
};
