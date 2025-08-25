import React from 'react'
import { useState } from 'react'
import { useContext } from 'react'
import { useSocket } from './socketContext'
import { useRef } from 'react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router'


function Room() {
  const inputRef=useRef(null);
 // const socket=useRef(null)
  const {socket}=useSocket();
  const navigate=useNavigate();
  useEffect(()=>{
    console.log('socket currentlly on',socket,socket.current);
    if (!socket?.current) return;
    //socket.current=socketCon.current;
    socket.current?.onAny((event, ...args) => {
  console.log("Received event:", event, args);
});
    socket.current.on('createdroom',(roomid)=>{
      console.log('here\'s your id',roomid);
      navigate(`/Chat/${roomid}`);
    });
    // socket.current.on('joinedroom',(id)=>{
    //   navigate(`/Chat/${id}`)
    // });
    return ()=> {socket.current.off('createdroom')};
    
  },[socket]);
  const handleCreate=(e)=>{
    console.log('creating the room');
      e.preventDefault();
      socket.current.emit('createRoom');
  }
  const handlejoin=(e)=>{
     e.preventDefault();
     const roomid=inputRef.current.value.trim();
    if(roomid.length !==6){
      console.log("invalid room number",roomid);
      return;
    }
     navigate(`/Chat/${roomid}`);
  }
  return (
    <div className="bg-blue-500 text-white p-4 rounded-lg">
      <h3>CreateRoom:</h3>
      <div className='flex'>
        <form onSubmit={handleCreate}>
        <button type='submit'>CreateRoom</button>
        </form>
        <br />
        <h3>JoinRoom:</h3>
      <form onSubmit={handlejoin}>
        <input type='text' ref={inputRef}/>
        <button type='submit'>JoinRoom</button>
      </form>
      </div>
      
    </div>
  )
}

export default Room
