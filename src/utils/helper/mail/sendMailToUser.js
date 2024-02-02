import nodemailer from 'nodemailer'
import { ApiError } from "../../ApiError.js";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
    },
})

const sendMailToUser = async (receiverEmail, mailSubject, data ) => {
    try {
        const template = {
            from: process.env.EMAIL, // sender address
            to: receiverEmail, // list of receivers
            subject: `${mailSubject} ✔`, // Subject line
            text: mailSubject, // plain text body
            html: `<h1>${mailSubject} : ${data}</h1>`, // html body
        }

        const response = await transporter.sendMail(template)
        return response;

    } catch (error) {
        throw new ApiError(400, "Something went wrong while sending mail")
    }

}

export {sendMailToUser};