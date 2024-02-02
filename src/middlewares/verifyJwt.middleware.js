import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"

const verifyJwt = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "unauthorized request !");
    }
    const decodedTokenInfo = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    const user = await User.findById(decodedTokenInfo?._id).select(
        "-password -refreshToken"
    )

    if (!user) {
        throw new ApiError(401, "Invalid access token !")
    }

    req.user = user;
    next()
})

export default verifyJwt;