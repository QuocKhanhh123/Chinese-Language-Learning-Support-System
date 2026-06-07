const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    refresh_token_hash: { type: String, required: true },
    ip: String,
    ua: String,
    is_revoked: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    expires_at: { type: Date, index: { expires: 0 } }
});

module.exports = mongoose.model("Session", SessionSchema);