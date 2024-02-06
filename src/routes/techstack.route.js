import { Router } from "express";

// controllers here
import { addTechnology, deleteTechnology, fetchAllTechnology, updateTechnology } from "../controllers/techStack.controllers.js";

// middlewares here
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/add/technology")
    .post(
        upload.fields(
            [
                {
                    name: "technologyIcon",
                    maxCount: 1
                }
            ]
        ),
        addTechnology
    )
router.route("/update/technology").patch(upload.single("technologyIcon"),updateTechnology)
router.route("/getall/technology").get(fetchAllTechnology)
router.route("/delete/technology").delete(deleteTechnology)

export default router;