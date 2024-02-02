import { Router } from "express";
// import controllers here
import { registerUser, updateProfileImage, updateResumeFile } from "../controllers/user.controllers.js";
import { loginUser } from "../controllers/user.controllers.js";
import { logoutUser } from "../controllers/user.controllers.js";
import { sendOtp } from "../controllers/userverification.controllers.js";

// import middelwares here
import { upload } from "../middlewares/multer.middleware.js";
import verifyJwt from "../middlewares/verifyJwt.middleware.js";
import { verifyOtp } from "../middlewares/verifyOtp.middleware.js";

// defining routes here
const router = Router()

router.route("/send/otp").post(sendOtp)
router.route("/register")
.post(
  upload.fields(
    [
      {
        name:"resumeLink",
        maxCount:1
      },
      {
        name:"profileImage",
        maxCount:1
      }
    ]
    ),
 verifyOtp,
 registerUser
)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJwt,logoutUser)
router.route("/project").post()
router.route("/profile").patch(verifyJwt,upload.single("profileImage"),updateProfileImage)
router.route("/resume").patch(verifyJwt,upload.single("resumeLink"),updateResumeFile)

// export router

export default router;