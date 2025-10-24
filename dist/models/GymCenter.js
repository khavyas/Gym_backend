const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const gymCenterSchema = mongoose.Schema({
    gymId: {
        type: String,
        unique: true,
        default: () => `GYM-${uuidv4()}`,
    },
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });
module.exports = mongoose.model('GymCenter', gymCenterSchema);
