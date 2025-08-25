import React from 'react'
import { useEffect,useRef } from 'react';
import {io} from 'socket.io-client'
import { createContext, useContext} from 'react';
import App from '../App';

const SocketContext = createContext();
export function SocketProvider({children}) {
  const sockets=useRef(null);
  useEffect(()=>{
    sockets.current=io('http://localhost:8000',{
      withCredentials: true,
    });
    sockets.current.on("connect", () => {
    console.log("Connected to socket.current.io server");    
  });

  return () => {
      sockets.current?.disconnect();
    };
  },[]);
  return (
    <div>
      <SocketContext.Provider value={{socket:sockets}}>
      {children}
      </SocketContext.Provider>
    </div>
  )
}

export function useSocket() {
  return useContext(SocketContext);
}


