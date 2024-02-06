import { Project } from "../models/project.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import uploadOnCloudinary from "../utils/cloudinary.js";
import { deleteFromCloudinary } from "../utils/deleteFromCloudinary.js";
import removeLocalFile from "../utils/removeLocalFile.js";
import projectSchema from "../utils/helper/validation/project.validation.js"

const createProject = asyncHandler(async (req, res) => {
    // validation of user data using Joi
    const validationResponse = await projectSchema.validateAsync(req.body);

    // fetch valid data and store it into variables
    const { projectName, category, year, description, gitLink, websiteLiveLink } = validationResponse

    // get thumbnail image locally stored path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    // if thumbnai is missing in local storage public/temp folder then throw error
    if (!thumbnailLocalPath) {
        removeLocalFile(thumbnailLocalPath);
        throw new ApiError(400, "thumbnail file is mandatory !")
    }

    // check for extension
    const thumbnailExtension = thumbnailLocalPath.split('.').pop();
    const thumbnailExtensions = ["jpg", "jpeg", "png", "webp"]
    if (!thumbnailExtensions.includes(thumbnailExtension)) {
        removeLocalFile(thumbnailLocalPath)
        throw new ApiError(500, "Image should be either jpg,jpeg,png,webp");
    }

    // if thumbnail path successfully got then upload thumbnail to cloudinary
    const thumbnailImageUploaded = await uploadOnCloudinary(thumbnailLocalPath, "projects")

    // if thumbnail doesnt gets uploaded to cloudinary due to network reason then throw error
    if (!thumbnailImageUploaded) {
        throw new ApiError(400, "Error while uploading file to cloudinary !");;
    }

    // after uploading thumbnail to cloudinary successfully store its url and project information in database
    const myProject = await Project.create(
        {
            projectName,
            category,
            year,
            description,
            thumbnail: thumbnailImageUploaded.url,
            thumbnailPublicId: thumbnailImageUploaded.public_id,
            gitLink,
            websiteLiveLink
        }
    )

    // if data doesnt gets stored into database then throw error
    if (!myProject) {
        throw new ApiError(500, "Error while creating a project !")
    }

    // after storing data into database send response
    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                myProject,
                "Project created successfully !"
            )
        )

})

const updateProject = asyncHandler(async (req, res) => {
    // input data validation
    const validatedProjectData = await projectSchema.validateAsync(req.body)
    // destructure the data
    const { projectName, category, year, description, gitLink, websiteLiveLink } = validatedProjectData

    const { _id } = req.query
    // storing uploaded local file path into variable
    const thumbnailLocalPath = req.file?.path

    // if there is issue while local file being uploaded by user then throw error
    if (!thumbnailLocalPath) {
        removeLocalFile(thumbnailLocalPath)
        throw new ApiError(400, "thumbnail is required !")
    }

    // check for extension
    const thumbnailExtension = thumbnailLocalPath.split('.').pop();
    const thumbnailExtensions = ["jpg", "jpeg", "png", "webp"]
    if (!thumbnailExtensions.includes(thumbnailExtension)) {
        removeLocalFile(thumbnailLocalPath)
        throw new ApiError(500, "Image should be either jpg,jpeg,png,webp");
    }

    // upload thumbnail to cloudinary
    const thumbnailImage = await uploadOnCloudinary(thumbnailLocalPath, "projects");

    // if there is any issue while uploading file then throw error
    if (!thumbnailImage) {
        throw new ApiError(400, "Error while uploading file to cloudinary !")
    }
    // find current thumbnail before upadting it
    const oldThumbnail = await Project.findById({ _id }).select("thumbnailPublicId")

    if (!oldThumbnail) {
        throw new ApiError(500, "Error while fetching old thumbnail from database !")
    }

    // delete thumbnail from cloudinary in order to save new one
    const isThumbnailDeletedFromCloudinary = await deleteFromCloudinary(oldThumbnail.thumbnailPublicId)

    // throw error if there are issues while deletion of thumbnail from cloudinary
    if (!isThumbnailDeletedFromCloudinary) {
        throw new ApiError(500, "Error while deletion of old thumbnail from cloudinary !")
    }

    // modify project
    const modifiedProject = await Project.findByIdAndUpdate(
        _id,
        {
            $set: {
                projectName,
                category,
                year,
                description,
                thumbnail: thumbnailImage.url,
                thumbnailPublicId: thumbnailImage.public_id,
                gitLink,
                websiteLiveLink
            }
        },
        {
            new: true
        }
    )

    if (!modifiedProject) {
        throw new ApiError(400, "Error while updating project information !")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                modifiedProject,
                "Project details updated successfully !"
            )
        )
})

const fetchAllProjects = asyncHandler(async (req, res) => {
    const allProjects = await Project.find();
    if (!allProjects) {
        throw new ApiError(400, "Error while fetching data from database !")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                allProjects,
                "data fetched successfully !"
            )
        )

})

const deleteProject = asyncHandler(async (req, res) => {
    // get _id of project
    const { _id } = req.body

    // fetch data from database using _id
    const dataDeletingImageId = await Project.findById({ _id }).select("thumbnailPublicId")

    // if issues while accessing project then throw error
    if (!dataDeletingImageId) {
        throw new ApiError(404, "project does not exist !")
    }

    // delete project
    const deletedData = await Project.deleteOne({ _id })
    // issues while deletion then throw error 
    if (!deletedData) {
        throw new ApiError(409, "Error while deletion of project !")
    }
    // thumbnail deletion from cloudinary
    if (deletedData.deletedCount === 1) {
        await deleteFromCloudinary(dataDeletingImageId.thumbnailPublicId)
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "",
                "project deleted successfully !"
            )
        )
})

export { createProject, updateProject, fetchAllProjects, deleteProject }