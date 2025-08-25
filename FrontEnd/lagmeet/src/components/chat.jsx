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
import useLocalRecorder from '../utils/localRecord';


function Chat() {
  const peer=useRef(null);
  const Peerid=useRef(null);
  const inputRef=useRef(null);
  const localStream=useRef(null);
  const localVideoRef=useRef(null);
  const remoteStream =useRef(null);
  const RemoteVideoRef=useRef(null);
  const [message,setmessage]=useState("");
  const [res, setres]=useState("");
  const {id}=useParams();
  const {socket}=useSocket();
  const navigate=useNavigate();
  const [hostId,setHostId]=useState(null)
  const [userId,setUserId]=useState(null)

  const {
    startRecording,
    stopRecording,
    uploadAllPending,
  }=useLocalRecorder({roomId:id,userId,hostId}); 
  const [isRecording,setIsRecording]=useState(false);

  useEffect(() => {
    console.log(`room id is ${id}`);
    if(!socket?.current) return;
    let attempt=0;
    let isattached=false;
    const wait=setInterval(() => {
      if(socket.current&&socket.current.connected) {
        console.log("Attaching joinedroom listener to:", socket.current?.id);
        socket.current?.onAny((event, ...args) => {
          console.log("Received event:",event, args);
        });

        socket.current.on("joinedroom",(id,userId,hostId) =>{

          console.log("join room response recieved from the server");
          setHostId(hostId);
          setUserId(userId);
          let attempt=0;
          const tryRtc=()=>{
            if(Peerid.current && socket?.current){
              rtcConn();
            }else{
              attempt++;
              if(attempt<10) {
                console.log("Waiting for PeerId to retry rtcConn...");
                setTimeout(tryRtc, 300);
              }else{
                console.log("rtcConn failed after multiple attempts");
              }
            }
          };
          tryRtc();
        });

        socket.current.on("servermessage", (message)=>{
          setres(message);
          socket.current.emit("join-room", id);
        });

        socket.current.on("letMeConnect", (remoteid) => {
          console.log("offer successfully sent to the other client");
          const conn=peer.current.connect(remoteid);
          conn.on("open", ()=>{
            conn.send("have fun!");
          });
        });

        peer.current=new Peer();
        peer.current.on("open", (pid) =>{
          console.log("new peer is created", pid);
          Peerid.current=pid;
          let attempt=0;
          const tryJoin=()=>{
            if(socket?.current){
              console.log("Socket connected, emitting join-room", socket?.current);
              socket.current.emit("join-room", id);
            }else{
              attempt++;
              if(attempt < 10){
                console.log("Waiting for PeerId to retry rtcConn...");
                setTimeout(tryJoin, 300);
              }else{
                console.log(" rtcConn failed after multiple attempts");
              }
            }
          };
          tryJoin();
        });

        peer.current.on("connection",(conn)=>{
          conn.on("data",(data) =>{
            console.log(data);
          });
          conn.on("open", () => {
            conn.send("connected back successfully!");
          });
          const call=peer.current.call(conn.peer, localStream.current);
          call.on("stream", (remotesteam) => {
            remoteStream.current.srcObject=remotesteam;
          });
        });

        peer.current.on("call", (call)=>{
          call.answer(localStream.current);
          call.on("stream", (remote)=>{
            remoteStream.current.srcObject=remote;
          });
        });

        clearInterval(wait);
        isattached=true;
      }else{
        if(attempt>20){
          console.log("couldnt join room after multiple attempts");
          clearInterval(wait);
        }
      }
      attempt++;
    }, 300);

    return ()=>{
      clearInterval(wait);
      if(!isattached){
        console.log("couldnt join room");
      }
      socket.current?.off("joinedroom", id);
      peer.current?.destroy();
    };
  }, []);

  const handlejoinChat =(e)=>{
    e.preventDefault();
    socket.current.emit("join-room", id);
  };

  const handlesubmit=(e)=>{
    e.preventDefault();
    socket.current.emit("message", inputRef.current.value);
    setmessage(inputRef.current.value);
  };

  const rtcConn=()=>{
    console.log("rtcConn() called with peerid:",Peerid.current);
    if(!Peerid.current || !socket?.current){
      console.warn("Cannot connect: PeerId or socket not ready");
      return;
    }
    socket.current.emit("letMeConnect", Peerid.current);
    console.log("rtc connection is initiated", Peerid.current);
  };

  const setStream = ()=>{
    if(!localVideoRef.current.srcObject){
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream)=>{
          localStream.current=stream;
          localVideoRef.current.srcObject=stream;
          console.log("streaming localmedia");
        })
        .catch((error) =>{
          console.error("Error accessing media devices.", error);
        });
    }else{
      localStream.current.getTracks().forEach(track => track.stop());
      localVideoRef.current.srcObject=null;
      console.log("stream closed");
    }
  };

  useEffect(() =>{
    const handleBeforeUnload=async()=>{
      if(isRecording){
        await stopRecording();
        await uploadAllPending();
      }
    };
    window.addEventListener("beforeunload",handleBeforeUnload);
    return()=>{
      window.removeEventListener("beforeunload",handleBeforeUnload);
    };
  },[isRecording,stopRecording,uploadAllPending]);
 
  const handleStartRecording=()=>{
    if(!isRecording && localStream.current){
      console.log('recording start')
      startRecording(localStream.current,userId);
      setIsRecording(true);
    }
  };


  const handleStopRecording=async()=>{
    if(isRecording){
      await stopRecording();
      await uploadAllPending(id,userId,hostId);
      setIsRecording(false);
    }
  };

  return (
    <div>
      <form onSubmit={handlejoinChat}>
        <button type="submit">joinRoom</button>
      </form>

      <br />
      <form onSubmit={handlesubmit}>
        <input type="text" ref={inputRef} />
        <button type="submit">send</button>
      </form>

      <br />
      <div>
        user: {message}
        <br />
        server: {res}
        <button onClick={setStream}>video</button>
        <button onClick={rtcConn}>video</button>
        <button onClick={handleStartRecording} disabled={isRecording}>
          Start Recording
        </button>
        <button onClick={handleStopRecording} >
          Stop 
        </button>
        <video ref={localVideoRef} autoPlay playsInline muted />
        otherguy
        <video ref={remoteStream} autoPlay playsInline />
      </div>
    </div>
  );
}



export default Chat
