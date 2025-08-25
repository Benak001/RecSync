import { urlencoded } from "express"
import cookieParser from "cookie-parser"
import express from 'express'
import cors from 'cors'
import http from 'http';
import {Server}  from 'socket.io';
import {nanoid} from 'nanoid'
import { rooms } from "./controllers/room.js";
import jwt from 'jsonwebtoken';
import User from "./models/user.js";
import cookie from "cookie"


const app=express()
const server = http.createServer(app)
app.use(cors({
  origin: "http://localhost:5173",
  credentials:true,
}));
const io=new Server(server,{
    cors: {
      origin: "http://localhost:5173",
      credentials:true,
      methods: ["GET", "POST"],
      // allowedHeaders: ["Content-Type", "Authorization"],
    }
  });
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

import userRouter from "./routes/userRoutes.js" 
app.use("/users",userRouter);

const room=new rooms();
io.use(async (socket, next) => {
  try{
    console.log('request for authentication');
    const token = socket.request.headers.cookie;
    if(!token){
        console.log('invalid token');
        next(new Error("unauthorized request"));        
    }
    const cookies = cookie.parse(token);
    const decoded=jwt.verify(cookies.accessToken,process.env.ACCESS_TOKEN_SECRET);
    const user=await User.findById(decoded._id);
    if(!user){
       // res.status(400).json({message:"Invalid access token"});
       console.log('unauthorized user');
        next(new Error("Invalid access token"));
    }
    socket.User=user;
    next();
    }catch(err){
      console.log('error while processing auth');
       next(new Error("Invalid access token"));
    }
});
io.on('connection', (socket) => {
    
    console.log('a user connected',socket.id);
    socket.on('message',(message)=>{
      console.log(message);
      const roomid=[...socket.rooms].filter(id=>id!==socket.id)[0];
      socket.to(roomid).emit('servermessage',message);
    })
    socket.on('createRoom',()=>{
       const id=nanoid(6);
       const flag=room.createRoom(socket.id,id);
       if(flag){
         socket.emit('createdroom',id);
         console.log('new room is created',id);
       }else{
         socket.emit('error','error while creating room');
         console.log('new room is not created');
       }       
    });
    socket.on('join-room',(roomid)=>{
        if(!room.exists(roomid)){
            socket.emit('error','room not found');
            console.log('trying to join invalid room',roomid);
            return;
        }
        socket.join(roomid);
        const host=room.joinRoom(socket.id,roomid);
        if(host){
          setTimeout(() => {
            socket.emit('joinedroom',roomid,socket.User.email,host); 
         }, 100);
          
          console.log(`user ${socket.id} joined room ${roomid}`)
        }else{
          socket.emit('error','error while entering room');
        }        
    });
    socket.on('letMeConnect',(peerid)=>{
      console.log("a user requested for media transfer");
       console.log('user initiated connection',peerid);
       console.log(`the current rooms`);
       [...socket.rooms].forEach((id)=>{
        console.log(`${id} \n`);
       })
       const roomid=[...socket.rooms].filter(id=>id!==socket.id)[0];
       console.log(`a user requested for media tranasfer ${roomid}`);
       socket.to(roomid).emit('letMeConnect',peerid);
    });
    
    socket.on('leave-room',()=>{
        const roomid=[...socket.rooms].filter(id=>id!==socket.id)[0];
        if(!room.exists(roomid)){
          socket.emit('error','error while exiting the room');
          return;
        }
        socket.leave(roomid);
        room.leaveRoom(socket.id,roomid);
        socket.emit('leftroom',roomid);
    });
    socket.on('disconnect', () => {
    const roomid=[...socket.rooms].filter(id=>id!==socket.id)[0];
        if(!room.exists(roomid)){
          socket.emit('error','error while exiting the room');
          return;
        }
        socket.leave(roomid);
        room.leaveRoom(socket.id,roomid);
        socket.emit('leftroom',roomid);
        console.log("a socket got disconencted",socket.id);
    });

});

export {app,io,server}