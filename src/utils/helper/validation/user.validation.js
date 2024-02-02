import Joi from "joi";

const userValidationSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().pattern(new RegExp('^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_+{}\\[\\]:;<>,.?~\\-]).{8,}$')),
    repeatPassword: Joi.ref("password")
})

const loginValidationSchema = Joi.object(
    {
        email: Joi.string().email().required(),
        password: Joi.string().pattern(new RegExp('^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_+{}\\[\\]:;<>,.?~\\-]).{8,}$'))
    }
)

export { userValidationSchema, loginValidationSchema };