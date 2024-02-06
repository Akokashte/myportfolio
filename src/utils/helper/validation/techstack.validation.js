import Joi from "joi";

const techstackValidationSchema = Joi.object(
    {
        technologyName:Joi.string().required().lowercase(),
        description:Joi.string().required(),
        technologyIcon:Joi.string(),
        technologyIconPublicId:Joi.string(),
        projects:Joi.allow("")
    }
)

export default techstackValidationSchema;