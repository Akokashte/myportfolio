import mongoose,{Schema} from "mongoose";

const techstackSchema = new Schema(
    {
        technologyName:{
            type:String,
            required:[true,"technology field is required"]
        },
        description:{
            type:String,
            required:[true,"description field is required !"]
        },
        technologyIcon:{
            type:String,
            required:[true,"technology icon is required field"],
            unique:true
        },
        technologyIconPublicId:{
            type:String,
        },
        projects:{
            type:[String],
        }
    },
    {
        timestamps:true
    }
)

export const Techstack =  mongoose.model("Techstack",techstackSchema);