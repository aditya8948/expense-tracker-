const User = require("../models/user");

const authenticate = async (req, res, next)=>{
    try{
        const userId = req.headers["user-id"] || req.query?.userId || req.body?.userId;
        const email =  req.headers["user-email"] || req.params?.email || req.body?.email;

        let user = null;

        if(userId){
            user = await User.findByPk(userId);
        }else if(email){
            user = await User.findOne({where:{email}});
        }

        if(!user){
            return res.status(401).json({message:"User not authenticated. first log in."});
        }

        req.user = user ;
        next();
    }catch(err){
        console.error("Authentication error:", err);
        return res.status(500).json({error: "Authentication failed "});
    }
}

module.exports = authenticate;