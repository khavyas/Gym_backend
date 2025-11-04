import mongoose from 'mongoose';

const membershipSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        gymCenter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'GymCenter',
            required: true,
        },
        membershipType: {
            type: String,
            enum: ['basic', 'premium', 'vip', 'trial'],
            default: 'basic',
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'suspended', 'expired', 'cancelled'],
            default: 'active',
        },
        startDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        endDate: {
            type: Date,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        features: [
            {
                type: String,
            },
        ],
        // Track who created/modified this membership
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        notes: {
            type: String,
        },
    },
    { timestamps: true }
);

// Unique index to prevent multiple active memberships for the same user at the same gym
membershipSchema.index({ user: 1, gymCenter: 1 }, {
    unique: true,
    partialFilterExpression: { status: 'active' }
});

// Compound index to ensure a user can have only one active membership per gym at a time
membershipSchema.index({ user: 1, gymCenter: 1, status: 1 });

// Index for querying memberships by gym
membershipSchema.index({ gymCenter: 1, status: 1 });

// Index for querying memberships by user
membershipSchema.index({ user: 1, status: 1 });

// Index for querying expiring memberships
membershipSchema.index({ endDate: 1, status: 1 });

type Membership = mongoose.InferSchemaType<typeof membershipSchema>;

export default mongoose.model<Membership>('Membership', membershipSchema);
