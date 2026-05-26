import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true
        },
        passwordHash: {
            type: String,
            required: true
        },
        plan: {
            type: String,
            enum: ['free', 'premium'],
            default: 'free'
        }
    },
    {
        timestamps: true,
        collection: 'auth.users'
    }
);

userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);

export default User;
