import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        instructor: {
            type: String
        },
        cost: {
            type: Number,
            default: 0
        },
        benefits: [{
            type: String
        }],
        date: {
            type: Date,
            required: true
        },

        location: {
            type: String,
            required: function (this: any) {
                return this.eventType === 'offline' || this.eventType === 'hybrid';
            },
        },

        eventType: {
            type: String,
            enum: ['offline', 'online', 'hybrid'],
            default: 'offline',
        },

        onlineLink: {
            type: String,
            required: function (this: any) {
                return this.eventType === 'online' || this.eventType === 'hybrid';
            },
        },

        gymCenter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'GymCenter',
            required: false,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model('Event', eventSchema);
