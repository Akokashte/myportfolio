import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app } from "./app.js"

dotenv.config(
    {
        path: "./.env"
    }
)
connectDB()
    .then(() => {
        const port = process.env.PORT || 8000
        app.listen(port, (req, res) => {
            console.log(`listening at ${port}`)
        })
    })
    .catch((err) => [
        console.log(`mongodb connection failed : ${err}`)
    ])