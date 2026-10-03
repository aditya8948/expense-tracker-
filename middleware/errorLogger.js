const fs = require("fs");
const path = require("path");

const errorLogger = (err, req, res, next)=>{
    const errorDetails = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${err.message} \n`;

    fs.appendFile(path.join(__dirname, "../error.log"), errorDetails,(fsErr)=>{
        if(fsErr){
            console.error("Failed to write error.log", fsErr)
        }
    });

    res.status(err.status || 500).json({
        error: err.message || "internal server error",
    });
}

module.exports = errorLogger ;