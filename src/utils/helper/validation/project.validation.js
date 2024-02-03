import Joi from "joi";

const projectValidationSchema = Joi.object({
    projectName: Joi.string().min(3).max(50).lowercase().required(),
    category: Joi.array().items(Joi.string().lowercase().min(3).max(20)).required(),
    year: Joi.string().required(),
    description: Joi.string().min(10).max(100).required(),
    thumbnail: Joi.string(),
    thumbnailPublicId: Joi.string(),
    gitLink: Joi.string().required(),
    websiteLiveLink: Joi.string().allow("")
})

export default projectValidationSchema;