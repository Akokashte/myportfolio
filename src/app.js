import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'


const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
//It is the process of converting a JSON string to a JSON object for data manipulation
app.use(express.json())
// used to deal with urls
app.use(express.urlencoded({ extended: true }))
// configuration for static files such as images and other files
app.use(express.static("public"))
// used to perform crud operations on cookie data
app.use(cookieParser())

import userRouter from './routes/user.route.js'

app.use("/api/v1/user",userRouter)


export { app }