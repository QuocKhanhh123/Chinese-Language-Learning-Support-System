const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;

const DeckSchema = new Schema({
    createdBy: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    title : { type: String, required: true, trim: true, maxLength: 200 },
    description: { type: String, default: '' },
    tags : { type: [String], default: [] },

    stat : {
        flashCardCount: { type: Number, default: 0 },
    },  

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = model('Deck', DeckSchema);
