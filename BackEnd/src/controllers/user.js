import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import bcrypt from 'bcrypt';

const  registerUser=async(req,res)=>{
   try{
    const {name,email,password} =req.body;
    if(!email||!name||!password){
        return res.status(401).json({message:"fields cannot be empty"});
    }
    const exists=await User.findOne({email:"benak@gmail.com"});
    if(exists){
        return res.status(400).json({message:"email  already exists"});
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newuser=await User.create({
        name,
        email,
        password:hashedPassword
    })
    if(!newuser){
        return res.status(401).json({message:'something went wrong'});
    }
    console.log('new',newuser);
    const Access=jwt.sign(
    {
       _id:newuser._id,
       email:newuser.email,
       name:newuser.name,
    }, 
    process.env.ACCESS_TOKEN_SECRET
     ,
    {
         expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
    );
    const Refresh=jwt.sign(
        {
           _id:newuser._id,
        }, 
        process.env.REFRESH_TOKEN_SECRET,
        {
             expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
     res.cookie("refreshToken",Refresh,{httpOnly:true,secure:true,samesite:true});
     res.cookie("accessToken",Access,{httpOnly:true,secure:true,samesite:true});
     return res.status(201).json({message:"user registered successfully"});
   }catch(err){
       console.log('error:',err)
       return res.status(401).json({message:"something went wrong while registering user"});
   }
};

const login=async(req,res)=>{
    try{
        const {email,password}=req.body;
        if(!email||!password){
            return res.status(401).json({message:"fields cannot be empty"});
        }
        const olduser=await User.findOne({email});
        if(!olduser){
            return res.status(401).json({message:"user doesn't exist"});
        }
        const match = await bcrypt.compare(password, olduser.password);
        if(!match){
            return res.status(401).json({message:"password doesn't match"});
        }
        const Access=jwt.sign(
            {
               _id:olduser._id,
               email:olduser.email,
               name:olduser.name,
            }, 
            process.env.ACCESS_TOKEN_SECRET
             ,
            {
                 expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
            }
        );
        const Refresh=jwt.sign(
                {
                   _id:olduser._id,
                }, 
                process.env.REFRESH_TOKEN_SECRET,
                {
                     expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
                }
        );
        res.cookie("refreshToken",Refresh,{httpOnly:true,secure:true});
        res.cookie("accessToken",Access,{httpOnly:true,secure:true});
        return res.status(201).json({message:"user logged in successfully"});
    }
    catch(err){
        return res.status(401).json({message:"something went wrong while logging in"});
    }
   
};
const logout=async(req,res)=>{
    const options={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json({message:"user logged out successfully"});
}

const refreshAccessToken=async(req,res)=>{
    try{
        const token=req.cookies?.refreshToken||req.body.refreshToken
        if(!token){
           return res.status(401).json("no refresh token");
        }
        const decoded=jwt.verify(token,process.env.REFRESH_TOKEN_SECRET);
        const user=await User.findById(decoded?._id);
        if(!user){
            return res.status(400).json({message:"invalid user refresh token"});
        }
        const Access=jwt.sign(
            {
               _id:user._id,
               email:user.email,
               name:user.name,
            }, 
            process.env.ACCESS_TOKEN_SECRET
             ,
            {
                 expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
            }
        );
         return res.status(201).cookie("accessToken",Access,{httpOnly:true,secure:true}).json({message:"Access token refreshed"});

    }catch(err){
        res.status(401).json({message:"invalid refresh token"});
    }
    
}

export {login,registerUser,logout,refreshAccessToken}