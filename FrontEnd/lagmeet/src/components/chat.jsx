import React, { useState } from 'react'
import {io} from 'socket.io-client'
import { useRef } from 'react';
import { Peer } from "peerjs";
import {nanoid} from 'nanoid';
import { useEffect } from 'react';
import { useContext } from 'react';
import { useSocket } from './socketContext';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router';
//const peer = new Peer("pick-an-id");

function Chat() {
  const peer=useRef(null);
  const Peerid=useRef(null);
  const inputRef = useRef(null); 
  const localStream=useRef(null);
  const localVideoRef=useRef(null);
  const remoteStream=useRef(null);
  const RemoteVideoRef=useRef(null);
  const [message,setmessage]=useState("");
  const [res,setres]=useState("");
  const {id}=useParams();
  const {socket}=useSocket();
  const navigate=useNavigate();

  useEffect(()=>{
    console.log(`room id is${id}`);
    if (!socket?.current) return;
  //

   let attempt=0;Z
   let isattached=false;
   const wait=setInterval(()=>{
    if(socket.current&&socket.current.connected){
      ////////////execute
      console.log("Attaching joinedroom listener to:", socket.current?.id);

   socket.current?.onAny((event, ...args) => {
  console.log("Received event:", event, args);
});

   socket.current.on('joinedroom',(id)=>{
      console.log('join room response recieved from the server');
      let attempt=0;
      const tryRtc=()=>{
       if (Peerid.current && socket?.current) {
      rtcConn();
     }else {
      attempt++;
      if (attempt<10) {
        console.log("Waiting for PeerId to retry rtcConn...");
        setTimeout(tryRtc,300);
      } else {
        console.log("rtcConn failed after multiple attempts");
      }
    }
      }
      tryRtc();
    });
  socket.current.on('servermessage',(message)=>{
   setres(message);
   socket.current.emit('join-room',id);
  });

  

  socket.current.on("letMeConnect",(remoteid)=>{
    console.log("offer successfully sent to the other client");
    const conn = peer.current.connect(remoteid);
    conn.on("open", () => {
      conn.send("have fun!");
    });
    
  });
  peer.current=new Peer();
    // socket.current.on("connect", () => {
    // console.log("Connected to socket.current.io server");
    
  // });
  peer.current.on("open",(pid)=>{
    console.log("new peer is created",pid);
    Peerid.current=pid;
    let attempt=0;
      const tryJoin=()=>{
       if (socket?.current) {
        console.log("Socket connected, emitting join-room",socket?.current);
      socket.current.emit('join-room',id);
     }else {
      attempt++;
      if (attempt < 10) {
        console.log("Waiting for PeerId to retry rtcConn...");
        setTimeout(tryJoin, 300);
      } else {
        console.log(" rtcConn failed after multiple attempts");
      }
    }
      }
      tryJoin();
     
  })
  peer.current.on("connection", (conn) => {
    conn.on("data", (data) => {
      console.log(data);
    });
    conn.on("open", () => {
      conn.send("connected back successfully!");
    });
    const call=peer.current.call(conn.peer,localStream.current);
    call.on('stream',(remotesteam)=>{
      remoteStream.current.srcObject=(remotesteam);
    });
    
    
  });
  peer.current.on('call',(call)=>{
    call.answer(localStream.current);
    call.on("stream", (remote) => {
      remoteStream.current.srcObject=(remote);
    });
  });
  
 

      ////////////////
      clearInterval(wait);
      isattached=true;

    }else{
      if(attempt>20){
        console.log('couldnt join room after multiple attempts');
        clearInterval(wait);
        //navigate(-1);
      }
    }
    attempt++;
   },300);


 ////
 
  /////
  return () => {
      clearInterval(wait);
    if(!isattached){
      console.log('couldnt join room');
     // navigate(-1);
    }
      socket.current?.off('joinedroom',id);
      peer.current?.destroy();
    };
  },[]);
  const handlejoinChat=(e)=>{
    e.preventDefault();
    socket.current.emit('join-room',id);
  }
  const handlesubmit=(e)=>{
    e.preventDefault();
    socket.current.emit('message',inputRef.current.value);
    setmessage(inputRef.current.value);
  }
  const rtcConn=()=>{
    console.log("rtcConn() called with peerid:", Peerid.current);
    if (!Peerid.current || !socket?.current) {
    console.warn("Cannot connect: PeerId or socket not ready");
    return;
  }

    socket.current.emit("letMeConnect",Peerid.current);
    console.log("rtc connection is initiated",Peerid.current);
  }
  const setStream=()=>{
    if(!localVideoRef.current.srcObject){
      navigator.mediaDevices.getUserMedia({video:true,audio:true})
      .then((stream) => {
        localStream.current=stream;
        localVideoRef.current.srcObject=stream;
        console.log('streaming localmedia');
      })
      .catch((error) => {
        console.error('Error accessing media devices.', error);
      });
    }else{
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current.srcObject=(null);
      localVideoRef.current.srcObject=null;
      console.log('stream closed');
    }
  }
  

  
  return (
    <div>
      <form onSubmit={handlejoinChat}>
        <button type='submit'>joinRoom</button>
      </form>

      <br />
      <form onSubmit={handlesubmit}>
        <input type='text' ref={inputRef}/>
        <button type='submit'>send</button>
      </form>

      <br/>
      <div>
        user:{message}\
        <br/>
        server:{res}
        <button onClick={setStream}>video</button>
        <button onClick={rtcConn}>video</button>
        <video
      ref={localVideoRef}
      autoPlay
      playsInline
      muted
      
      />
      otherguy
      <video
      ref={remoteStream}
      autoPlay
      playsInline
      muted
      
      />


      </div>
    </div>
  )
}

export default Chat
