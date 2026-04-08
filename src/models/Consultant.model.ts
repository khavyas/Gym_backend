import mongoose from 'mongoose';

// Custom validators
const phoneValidator = val => /^[6-9]\d{9}$/.test(val); // Indian 10-digit
const emailValidator = val => /\S+@\S+\.\S+/.test(val);

const consultantSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // link to User
        gym: { type: mongoose.Schema.Types.ObjectId, ref: 'GymCenter' },
        domain: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Domain' }],
        specialty: { type: String }, // e.g. Dietician, Yoga Trainer
        description: { type: String },
        meetingLink: { type: String },

        yearsOfExperience: { type: Number, default: 0, min: 0, max: 50 },

        certifications: [{ type: String }], // list of certifications
        badges: [{ type: String }], // e.g. ["Certified", "Top Rated"]

        qualification: [
            {
                degree: String,
                board: String,
                year: Number,
                field: String
            }
        ],

        modeOfTraining: {
            type: String,
            enum: ["online", "offline", "hybrid"],
            default: "online",
        },

        // Pricing structure
        pricing: {
            perSession: { type: Number, min: 0 }, // single session cost
            perMonth: { type: Number, min: 0 },
            perWeek: { type: Number, min: 0 },
            perDay: { type: Number, min: 0 },
            currency: { type: String, default: "INR" },
            packages: [
                {
                    title: String,   // e.g. "3-Month Transformation Plan"
                    duration: String, // e.g. "3 months"
                    price: Number,
                },
            ],
        },

        availability: {
            status: {
                type: String,
                enum: ["Available Now", "Available Tomorrow", "Busy"],
                default: "Available Now",
            },
            nextSlot: { type: String }, // e.g. "Today 3:00 PM"
            workingDays: [{ type: String }], // ["Mon", "Wed", "Fri"]
            workingHours: { start: String, end: String }, // e.g. "09:00", "17:00"
        },

        contact: {
            website: { type: String },
            location: {
                street: String,
                city: String,
                state: String,
                pincode: String
            },
        },

        rating: { type: Number, default: 0, min: 0, max: 5 },
        reviewsCount: { type: Number, default: 0, min: 0 },

        image: { type: String }, // could be URL or emoji placeholder

        isVerified: { type: Boolean, default: false },

        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    { timestamps: true }
);

export default mongoose.model("Consultant", consultantSchema);
