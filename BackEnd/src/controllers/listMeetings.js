import express from "express";
import Room from "../models/meeting.js";

const listMeetings=async(req,res)=>{
  try{
    const user=req.user;
    if(!user){
        console.log('unauthorised request')
        return res.status(401).json({message:"user not found,please login again"});
    }
    const meetings = await Room.find({
      participants: user,
      sessions: { $exists: true, $not: { $size: 0 } }
    }).select("roomId folderUrl");
    console.log('meetings fetched successfully');
    return res.status(200).json({ meetings });
  }catch(err){
      console.log('error:',err)
       return res.status(401).json({message:"something went wrong while fetching meetings"});
  }
}

export default listMeetings
