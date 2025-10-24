import mongoose from 'mongoose';

const consultantSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }, // link to User

        name: {
            type: String,
            required: true
        }, // redundant but helpful for search
        specialty: {
            type: String,
            required: true
        }, // e.g. Dietician, Yoga Trainer
        description: {
            type: String
        },

        yearsOfExperience: {
            type: Number,
            default: 0
        },

        certifications: [{
            type: String
        }], // list of certifications
        badges: [{
            type: String
        }], // e.g. ["Certified", "Top Rated"]

        modeOfTraining: {
            type: String,
            enum: ['online', 'offline', 'hybrid'],
            default: 'online',
        },

        // Pricing structure
        pricing: {
            perSession: {
                type: Number
            }, // single session cost
            perMonth: {
                type: Number
            },
            perWeek: {
                type: Number
            },
            perDay: {
                type: Number
            },
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
                enum: ['Available Now', 'Available Tomorrow', 'Busy'],
                default: 'Available Now',
            },
            nextSlot: {
                type: String
            }, // e.g. "Today 3:00 PM"
            workingDays: [{
                type: String
            }], // ["Mon", "Wed", "Fri"]
            workingHours: {
                start: String,
                end: String
            }, // e.g. "09:00", "17:00"
        },

        contact: {
            phone: {
                type: String
            },
            email: {
                type: String
            },
            website: {
                type: String
            },
            location: {
                type: String
            }, // address if offline/hybrid
        },

        rating: {
            type: Number,
            default: 0
        },
        reviewsCount: {
            type: Number,
            default: 0
        },

        image: {
            type: String
        }, // could be URL or emoji placeholder

        isVerified: {
            type: Boolean,
            default: false
        },
    },
    { timestamps: true }
);

export default mongoose.model('Consultant', consultantSchema);
