import mongoose, { Schema } from "mongoose";

const projectSchema = new Schema(
    {
        projectName: {
            type: String,
            required: [true, "Project Name is required field !"],
        },
        category: {
            type: [String],
            required: [true, "Project category is required field"]
        },
        year: {
            type: String,
            required: [true, "Year of completion is required !"],
        },
        description: {
            type: String,
            required: [true, "Description of project is required !"],
        },
        thumbnail: {
            type: String,
            required: [true, "thumbnail is required field !"]
        },
        thumbnailPublicId:{
            type:String,
        },
        gitLink: {
            type: String,
            required: [true, "github link of project is required !"],
        },
        websiteLiveLink: {
            type: String,
            default:""
        }
    },
    {
        timestamps: true,
    }
)

export const Project = mongoose.model("Project", projectSchema)