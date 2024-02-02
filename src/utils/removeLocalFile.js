import fs from "fs"

const removeLocalFile = (filePath)=>{
    fs.unlinkSync(filePath)
}

export default removeLocalFile;