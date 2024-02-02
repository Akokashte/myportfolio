import { Router } from "express";

// import controllers here
import { createProject, deleteProject, fetchAllProjects, updateProject } from "../controllers/project.controllers.js";

// import middlewares here
import { upload } from "../middlewares/multer.middleware.js";

// creating router
const router = Router()

// routes for project
router.route("/create/project")
.post(
    upload.fields(
      [
        {
          name: "thumbnail",
          maxCount: 1
        },
      ]
    ),
    createProject
  )
  
  router.route("/update/project").patch(upload.single("thumbnail"), updateProject)
  router.route("/get/projects").get(fetchAllProjects)
  router.route("/delete/project").delete(deleteProject)

  export default router;