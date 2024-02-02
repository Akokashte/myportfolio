import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { loginValidationSchema,userValidationSchema } from "../utils/helper/validation/user.validation.js";
import removeLocalFile from '../utils/removeLocalFile.js'
import uploadOnCloudinary from "../utils/cloudinary.js"
import { deleteFromCloudinary } from "../utils/deleteFromCloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { Otp } from "../models/otp.models.js";

const generateAccessAndRefreshToken = async (user) => {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false })
    return { accessToken, refreshToken };
}

const registerUser = asyncHandler(async (req, res) => {
    // user Credential validation
    const response = await userValidationSchema.validateAsync(req.body)
    const { email, password } = response

    // check email is verified or not 
    const isEmailVerified = await Otp.findOne({email}).select("isVerified")

    if(!isEmailVerified){
        throw new ApiError(401,"Unauthorized access such email doesnt exist !")
    }

    // check email already exists or not
    const isEmailAlreadyExist = await User.findOne({ email })

    if (isEmailAlreadyExist) {
        throw new ApiError(403, "email already registered !")
    }

    const resumeLocalPath = req.files?.resumeLink[0]?.path;
    const profileImageLocalPath = req.files?.profileImage[0]?.path;

    if (!resumeLocalPath || !profileImageLocalPath) {
        removeLocalFile(resumeLocalPath);
        removeLocalFile(profileImageLocalPath);
        throw new ApiError(400, "resume and profile files are required !")
    }

    // check for extension of resume it should be .pdf otherwise show error
    const extension = resumeLocalPath.split('.').pop();
    if(extension!=="pdf"){
        removeLocalFile(resumeLocalPath);
        removeLocalFile(profileImageLocalPath);
        throw new ApiError(400,`Inappropriate file extension '${extension}', only .pdf extension files are accepted !`)
    }

    const resume = await uploadOnCloudinary(resumeLocalPath);
    const profile = await uploadOnCloudinary(profileImageLocalPath);

    // remove files stored in local temp folder after being uploaded to cloudinary
    removeLocalFile(resumeLocalPath);
    removeLocalFile(profileImageLocalPath);
    
    if (!resume || !profile) {
        throw new ApiError(400, "Error while uploading file to cloud")
    }

    // create user object - create entry in db
    const user = await User.create({
        email,
        resumeLink: resume.url,
        resumeLinkPublicId: resume.public_id,
        profileImage: profile.url,
        profileImagePublicId: profile.public_id,
        password: password,
        isVerified:true
    })

    // check for user created or not if not then show error
    if (!user) {
        throw new ApiError(500, "Something went wrong during user registration !")
    }

    const isOtpDeleted = await Otp.deleteOne({email})
    if(!isOtpDeleted){
        throw new ApiError(400,"Error while deletion of otp !")
    }

    // generate access and refreshToken
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user)
    const options = {
        httpOnly: true,
        secure: true
    }
    // if user entry successfully saved in db then return success message along with data
    return res.
        status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                201,
                {
                    email: user.email,
                    resumeLink: user.resumeLink,
                    profileImage: user.profileImage,
                },
                "User registered successfully !"
            )
        )
})

const loginUser = asyncHandler(async (req, res) => {
    const validatedResponse = await loginValidationSchema.validateAsync(req.body)

    const { email, password } = validatedResponse;

    // check if email exist or not 
    const user = await User.findOne({ email })

    if(!user.isVerified){
        throw new ApiError(401,"unauthorized access: email is not verified")
    }

    if (!user) {
        throw new ApiError(404, "User does not exists !")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password, user.password);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid credentials!")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user)

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    email: user.email
                },
                "logged in successfully !"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                refreshToken: undefined,
            }
        },
        {
            new: true,
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "logged out successfully !"
            )
        )
})

const updateProfileImage = asyncHandler(async (req, res) => {
    const profileImagePath = req.file?.path;

    // check whether file is uploaded successfully or not if not then show error
    if (!profileImagePath) {
        throw new ApiError(401, "profile image is missing !")
    }

    // if files stored in public temp folder locally then upload it to cloudinary
    const updatedProfile = await uploadOnCloudinary(profileImagePath)

    // if updation of profile fails then show error
    if (!updatedProfile) {
        throw new ApiError(400, "Error while uploading profile image to cloud !")
    }

    // deletion of old profile image from cloudinary
    const deletedResponse = await deleteFromCloudinary(req.user?.profileImagePublicId);

    // if deletion of image fails then show error
    if (!deletedResponse) {
        throw new ApiError(400, "Error while deletion of old profile Image !")
    }

    // if deletion of image succeed then update new entry of profileImage and public_id to database
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                profileImage: updatedProfile.url,
                profileImagePublicId: updatedProfile.public_id,
            }
        },
        {
            new: true,
        }
    ).select(
        "-password -refreshToken"
    )

    if (!user) {
        throw new ApiError(400, "Something went wrong while updating profile data !")
    }


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "profile updated successfully !"
            )
        )

})

const updateResumeFile = asyncHandler(async (req, res) => {
    const resumeFilePath = req.file?.path;

    // check whether file is uploaded successfully or not if not then show error
    if (!resumeFilePath) {
        throw new ApiError(401, "Resume file is missing !")
    }
    const extension = resumeFilePath.split('.').pop();

    if(extension!=="pdf"){
        throw new ApiError(400,`Inappropriate file extension ${extension} only .pdf extension files are accepted !`)
    }

    // if files stored in public temp folder locally then upload it to cloudinary
    const updatedResume = await uploadOnCloudinary(resumeFilePath)

    // if updation of profile fails then show error
    if (!updatedResume) {
        throw new ApiError(400, "Error while uploading resume file to cloud !")
    }

    // deletion of old resume file from cloudinary
    const deletedResponse = await deleteFromCloudinary(req.user?.resumeLinkPublicId);

    // if deletion of resume file fails then show error
    if (!deletedResponse) {
        throw new ApiError(400, "Error while deletion of old resume file !")
    }

    // if deletion of resume file succeed then update new entry of profileImage and public_id to database
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                resumeLink: updatedResume.url,
                resumeLinkPublicId: updatedResume.public_id,
            }
        },
        {
            new: true,
        }
    ).select(
        "-password -refreshToken"
    )

    if (!user) {
        throw new ApiError(400, "Something went wrong while updating resume file data !")
    }


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "Resume updated successfully !"
            )
        )

})


export {
    registerUser,
    loginUser,
    logoutUser,
    updateProfileImage,
    updateResumeFile
}