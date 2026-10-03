const checkPremium = (req, res, next)=>{
    if(!req.user || !req.user.isPremiumUser){
        return res.status(403).json({message: "Access denied . premium membrshp required"});
    }
    next();
}
module.exports = checkPremium;