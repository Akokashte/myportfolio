import { Otp } from "../models/otp.models.js"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// middleware for verification of otp before user registers actual data
const verifyOtp = asyncHandler(async (req, res, next) => {
    const { email, otp } = req.query

    const otpSaved = await Otp.findOne({ email }).select("otp")
    const isOtpCorrect = await otpSaved.compareOtp(otp, otpSaved.otp)

    if (!isOtpCorrect) {
        await Otp.deleteOne({ email })
        throw new ApiError(401, "Invalid Otp !")
    }
    next();
})
export { verifyOtp }