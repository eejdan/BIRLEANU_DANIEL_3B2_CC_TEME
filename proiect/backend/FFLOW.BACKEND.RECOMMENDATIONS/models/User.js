import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: String,
        email: String,
        plan: String
    },
    {
        timestamps: true,
        collection: 'auth.users'
    }
);

const User = mongoose.models.RecommendationUser || mongoose.model('RecommendationUser', userSchema);

export default User;
