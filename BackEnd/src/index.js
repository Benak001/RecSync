import dotenv from 'dotenv';

dotenv.config(); 
import ConnectDb from './db/db.js';
import express from 'express';
import { app ,io,server} from './app.js';
// import http from 'http';
// import {Server}  from 'socket.io';


ConnectDb();
const PORT=process.env.PORT||5000;
// const server = http.createServer(app)
// const io=new Server(server);

app.get('/',(req,res)=>{
    res.json("app is runnning successfully");
}
);
io.on('connection', (socket) => {
    console.log('a user connected');
});
  

server.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});



