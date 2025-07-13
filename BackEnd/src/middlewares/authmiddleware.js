import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export const verifyJwt=async(req,res,next)=>{
    try{
    const token=req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer ","");
    if(!token){
        return res.status(400),json({message:"unauthorized request"});
    }
    const decoded=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    const user=await User.findById(decoded._id);
    if(!user){
        res.status(400).json({message:"Invalid access token"});
    }
    req.user=user;
    next();
    }catch(err){
       res.status(400).json({message:"Invalid access token"});
    }
}

