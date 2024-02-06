import { Techstack } from "../models/techstack.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { deleteFromCloudinary } from "../utils/deleteFromCloudinary.js";
import techstackValidationSchema from "../utils/helper/validation/techstack.validation.js";
import removeLocalFile from "../utils/removeLocalFile.js";

const addTechnology = asyncHandler(async (req, res) => {
    // validation of technology data
    const validationResponse = await techstackValidationSchema.validateAsync(req.body)
    const { technologyName, description, projects } = validationResponse;

    // accessing uploaded file from req
    const technologyIconLocalPath = req.files?.technologyIcon[0]?.path;

    // throw error if file doesnt gets uploaded to local directory temp
    if (!technologyIconLocalPath) {
        throw new ApiError(404, "Image upload failed local image not found !")
    }

    const technologyIconExtension = technologyIconLocalPath.split('.').pop();
    const technologyExtensions = ["jpg", "jpeg", "png", "webp"]
    if (!technologyExtensions.includes(technologyIconExtension)) {
        removeLocalFile(technologyIconLocalPath)
        throw new ApiError(500, "Image should be either jpg,jpeg,png,webp");
    }

    // upload local file to cloudinary
    const technologyIconUploaded = await uploadOnCloudinary(technologyIconLocalPath, "techstack");

    // throw error if something wents wrong while uploading file to cloudinary
    if (!technologyIconUploaded) {
        throw new ApiError(422, "Unable to upload file on cloudinary !")
    }

    // store technology into database
    const technology = await Techstack.create(
        {
            technologyName,
            description,
            technologyIcon: technologyIconUploaded.url,
            technologyIconPublicId: technologyIconUploaded.public_id,
            projects
        }
    )

    // throw error if technology doesnt gets stored in database
    if (!technology) {
        throw new ApiError(500, "Something went wrong while adding new technology !")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                technology,
                "technology created successfully"
            )
        )
})

const updateTechnology = asyncHandler(async (req, res) => {
    const validationResponse = await techstackValidationSchema.validateAsync(req.body)

    const { technologyName, description, projects } = validationResponse;

    const { _id } = req.query

    const technologyIconLocalPath = req.file?.path;

    // throw error if file gets uploading error
    if (!technologyIconLocalPath) {
        throw new ApiError(404, "error while uploading file");
    }

    // check for file extension
    const technologyIconExtension = technologyIconLocalPath.split('.').pop();
    const technologyExtensions = ["jpg", "jpeg", "png", "webp"]
    if (!technologyExtensions.includes(technologyIconExtension)) {
        removeLocalFile(technologyIconLocalPath)
        throw new ApiError(500, "Image should be either jpg,jpeg,png,webp");
    }

    // upload updated icon to cloudinary
    const technologyIconUploaded = await uploadOnCloudinary(technologyIconLocalPath, "techstack")

    // throw error if icon doesnt uploaded successfully
    if (!technologyIconUploaded) {
        throw new ApiError(500, "Something went wrong while uploading file to cloudinary !")
    }

    // fetch old icon from database for deletion of icon image from cloudinary
    const oldTechnologyIcon = await Techstack.findById({ _id }).select("technologyIconPublicId")

    // throw error if we unable to fetch old icon from db due to some error
    if (!oldTechnologyIcon) {
        throw new ApiError(500, "Error while fetching data from database !")
    }

    // delete oldtechnology icon from cloudinary
    const isOldTechnologyIconDeleted = await deleteFromCloudinary(oldTechnologyIcon.technologyIconPublicId)

    // if error while deletion of technology icon from cloudinary then throw error
    if (!isOldTechnologyIconDeleted) {
        throw new ApiError(500, "Error while deleting technology icon from cloudinary !")
    }

    // update data in db and store latest updated data in variable
    const updatedTechStack = await Techstack.findByIdAndUpdate(
        _id,
        {
            $set: {
                technologyName,
                description,
                technologyIcon: technologyIconUploaded.url,
                technologyIconPublicId: technologyIconUploaded.public_id,
                projects,
            }
        },
        {
            new: true,
        }
    )

    // throw error if data doesnt saved in db
    if (!updatedTechStack) {
        throw new ApiError(500, "Error while updating technology stack data to database !")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedTechStack,
                "techstack updated successfully !"
            )
        )

})


const fetchAllTechnology = asyncHandler(async (req, res) => {
    const technologyData = await Techstack.find()

    // throw error if we are unable to fetch data from database
    if (!technologyData) {
        throw new ApiError(500, "Error while fetching data from database !");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                technologyData,
                "data fetched successfully !"
            )
        )

})

const deleteTechnology = asyncHandler(async (req, res) => {
    const { _id } = req.query
    // fetch public id of technology icon and store it into variable
    const technologyDataToDelete = await Techstack.findById({ _id }).select("technologyIconPublicId");

    // if error while fetching public_id then throw error
    if (!technologyDataToDelete) {
        throw new ApiError(500, "error while fetching data from database !")
    }

    // deletion of _id record from database
    const deleteTechnology = await Techstack.deleteOne({ _id })

    // throw error if there is issue while deletion of technology
    if (!deleteTechnology) {
        throw new ApiError(500, "Error while deletion of technology from database !")
    }

    // upload technology icon to cloudinary
    const technologyIconDeletedFromCloudinary = await deleteFromCloudinary(technologyDataToDelete.technologyIconPublicId)

    // if there is any issue while uploading file to cloudinary then throw error
    if (!technologyIconDeletedFromCloudinary) {
        throw new ApiError(500, "Error while deletion of file from cloudinary !")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "technology deleted successfully !"
            )
        )

})


export {
    addTechnology,
    updateTechnology,
    fetchAllTechnology,
    deleteTechnology
}