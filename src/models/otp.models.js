import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt';

const otpSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
        },
        otp: {
            type: String,
            required: true,
            unique: true
        }
    }
    , {
        timestamps: true
    }
)

otpSchema.pre("save", async function (next) {
    if (!this.isModified("otp")) return next();
    this.otp = await bcrypt.hash(this.otp, 10)
    next()
})

otpSchema.methods.compareOtp = async function (userOtp){
    return await bcrypt.compare(userOtp, this.otp);
}

export const Otp = mongoose.model("Otp", otpSchema);
