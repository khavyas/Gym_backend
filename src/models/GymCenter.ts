import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const gymCenterSchema = new mongoose.Schema(
    {
        gymId: {
            type: String,
            unique: true,
            default: () => `GYM-${uuidv4()}`,
        },
        name: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        phone: {
            type: String
        },
        email: {
            type: String
        },
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model('GymCenter', gymCenterSchema);
