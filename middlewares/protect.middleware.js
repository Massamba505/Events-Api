const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const authenticate = async(req,res,next)=>{
    try {
        const token = req.cookies.jwt; // needs cookie parser
        if(!token){
            return res.status(401).json({error:"Unuathorized - No Token Provided"});
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({error:"Unuathorized - No Token Provided"});
        }

        console.log(decoded);

        const user = await User.findById(decoded.userId); //it is called userId because of jwt.sign(*{userId}*
        if(!user){
            return res.status(401).json({error:"User not found"});
        }

        req.user = user;
        next();

    } catch (error) {
        console.log("error at middleware protect route",error.message);
        res.status(500).json({error:"Internal server error"});
    }
}

module.exports = {
    authenticate
}