import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


const userSchema = new Schema(
    {
        email: {
            type: String,
            required: [true, "Email is required field !"],
            unique: true,
            lowercase: true,
        },
        resumeLink: {
            type: String,
            required: [true, "Resume link is required !"],
        },
        resumeLinkPublicId:{
            type:String,
            default:""
        },
        profileImage: {
            type: String,
            required: [true, "Password is required !"]
        },
        profileImagePublicId:{
            type:String,
            default:""
        },
        password: {
            type: String,
            required: [true, "Password is required !"],
            unique: true,
        },
        isVerified:{
            type:Boolean,
            default:false
        },
        refreshToken: {
            type: String,
            default:""
        }
    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    )
}

export const User = mongoose.model("User", userSchema)