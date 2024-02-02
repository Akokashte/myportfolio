import { Project } from "../models/project.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import uploadOnCloudinary from "../utils/cloudinary.js";
import { deleteFromCloudinary } from "../utils/deleteFromCloudinary.js";
import removeLocalFile from "../utils/removeLocalFile.js";

const createProject = asyncHandler(async (req, res) => {
    const { projectName, category, year, description, gitLink, websiteLiveLink } = req.body

    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    if (!thumbnailLocalPath) {
        removeLocalFile(thumbnailLocalPath);
        throw new ApiError(400, "thumbnail file is mandatory !")
    }

    const thumbnailImageUploaded = await uploadOnCloudinary(thumbnailLocalPath)

    if (!thumbnailImageUploaded) {
        throw new ApiError(400, "Error while uploading file to cloudinary !");;
    }

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
    if (!myProject) {
        throw new ApiError(500, "Error while creating a project !")
    }

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
    const { _id, projectName, category, year, description, gitLink, websiteLiveLink } = req.body

    const thumbnailLocalPath = req.file?.path

    if (!thumbnailLocalPath) {
        removeLocalFile(thumbnailLocalPath)
        throw new ApiError(400, "thumbnail is required !")
    }

    const thumbnailImage = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnailImage) {
        throw new ApiError(400, "Error while uploading file to cloudinary !")
    }
    const oldThumbnail = await Project.findById({ _id }).select("thumbnailPublicId")

    if (!oldThumbnail) {
        throw new ApiError(400, "Error while fetching old thumbnail from database !")
    }

    console.log('hi',oldThumbnail)
    const isThumbnailDeletedFromCloudinary = await deleteFromCloudinary(oldThumbnail.thumbnailPublicId)

    if (!isThumbnailDeletedFromCloudinary) {
        throw new ApiError(400, "Error while deletion of old thumbnail from cloudinary !")
    }

    const modifiedProject = await Project.findByIdAndUpdate(
        _id,
        {
            $set: {
                projectName,
                category,
                year,
                description,
                thumbnail: thumbnailImage.url,
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
    console.log('victory')
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
    const { _id } = req.body
    const dataDeletingImageId = await Project.findById({_id}).select("thumbnailPublicId")
    console.log(dataDeletingImageId)
    
    if(!dataDeletingImageId){
        throw new ApiError(404,"project does not exist !")
    }


    const deletedData = await Project.deleteOne({ _id })
    if (!deletedData) {
        throw new ApiError(409, "Error while deletion of project !")
    }

    if(deletedData.deletedCount===1){
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