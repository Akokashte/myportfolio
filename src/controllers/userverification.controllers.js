import { sendMailToUser } from "../utils/helper/mail/sendMailToUser.js"
import { generateOtp } from "../utils/helper/mail/generateOtp.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Otp } from "../models/otp.models.js"
import bcrypt from 'bcrypt';

const sendOtp = asyncHandler(async (req, res) => {
    const otp = generateOtp()
    if (!otp) {
        throw new ApiError(400, "Error while generating otp !")
    }
    const { email } = req.body
    const isEmailSent = await sendMailToUser(email, "Email verification", otp)
    
    if (!isEmailSent) {
        throw new ApiError(404, "Email does not exist !")
    }
    bcrypt.hash(otp,10);
    const isOtpSaved = await Otp.create({
        email,
        otp
    })
    await isOtpSaved.save()
    
    if (!isOtpSaved) {
        throw new ApiError(500, "Something went wrong while storing otp !")
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, "Otp sent successfully !")
        )
})

export {sendOtp}