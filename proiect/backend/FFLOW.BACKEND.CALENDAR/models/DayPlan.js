import mongoose from 'mongoose';

const dayPlanSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: true
        },
        dayHash: {
            type: String,
            required: true,
            unique: true
        },
        activities: [
            {
                title: String,
                startTime: {
                    type: Date,
                    required: true
                },
                endTime: {
                    type: Date,
                    required: true
                },
                activityType: {
                    type: String,
                    enum: ['event', 'task'],
                    required: true
                },
                referenceId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true
                }
            }
        ],
        commutes: [
            {
                fromActivity: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true
                },
                toActivity: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true
                },
                distance: {
                    type: Number,
                    required: true
                },
                walkingTimeEstimation: {
                    type: Number,
                    required: true
                },
                walkingRecommended: {
                    type: Boolean,
                    required: true
                },
                walkingTimeToLeave: {
                    type: Date,
                    required: true
                },
                busTimeEstimation: {
                    type: Number,
                    required: true
                },
                busRecommended: {
                    type: Boolean,
                    required: true
                },
                busTimeToLeave: {
                    type: Date,
                    required: true
                },
                drivingTimeEstimation: {
                    type: Number,
                    required: true
                },
                drivingRecommended: {
                    type: Boolean,
                    required: true
                },
                drivingTimeToLeave: {
                    type: Date,
                    required: true
                }
            }
        ],
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        }
    },
    {
        timestamps: true,
        collection: 'calendar.dayplans'
    }
);

const DayPlan = mongoose.model('DayPlan', dayPlanSchema);

export default DayPlan;
