import mongoose from "mongoose";

const emailRegexPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(value) {
                return emailRegexPattern.test(value);
            }
        },
        unique: true
    },
    role: {
        type: Number,
        default: 0,
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        public_id: String,
        url: String
    },
}, {timestamps: true},)


const userModel = mongoose.model("users", userSchema);
export default userModel;