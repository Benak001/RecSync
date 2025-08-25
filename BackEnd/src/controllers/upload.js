import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Room from "../models/meeting.js";
import recSession from "../models/session.js";

const storage = multer.diskStorage({
  destination: async (req, file, cb)=>{
    const { roomId } = req.query;
    console.log('attaching folder',roomId)
    const uploadPath = path.join("recordings", roomId);

    if(!fs.existsSync(uploadPath)){
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename:(req, file, cb)=>{
    const sessionId=req.body.sessionId||Date.now().toString();
    cb(null, `${sessionId}.webm`);
  },
});

const upload= multer({ storage });


const uploadHandler= async (req, res)=>{
  try{
    console.log('requested file upload');
    const { roomId, userId=req.user.email, hostId, sessionId } = req.body;
    if (!roomId || !userId || !hostId) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    let room= await Room.findOne({ roomId });
    if(!room){
      room= new Room({
        roomId,
        createdBy: hostId,
        participants: [req.user],
        folderUrl: `/recordings/${roomId}`,
        sessions: [sessionId],
      });
    }else{
      if(!room.participants.includes(req.user)){
        room.participants.push(req.user);
      }
      if(!room.sessions.includes(sessionId)){
        room.sessions.push(sessionId);
      }
    }

    await room.save();
    console.log('file uploaded successfully');
    return res.status(200).json({
      message:"Recording uploaded successfully",
      filePath: `/recordings/${roomId}/${sessionId}.webm`,
    });
  }catch(err){
    console.error("Upload error:", err);
    return res.status(500).json({message: "Upload failed"});
  }
}

export {upload,uploadHandler};
