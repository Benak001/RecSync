import { useCallback, useEffect, useRef, useState } from "react";
import { openDB } from "idb";

const DB_NAME = "recorderDB";
const STORE_NAME ="sessions";


async function getDB(){
  return openDB(DB_NAME, 1, {
    upgrade(db){
      if(!db.objectStoreNames.contains(STORE_NAME)){
        db.createObjectStore(STORE_NAME,{keyPath: "sessionId"});
      }
    },
  });
}

export default function useLocalRecorder({roomId, userId ,hostId}){
  const mediaRecorderRef=useRef(null);
  const chunksRef=useRef([]);
  const [currentSession,setCurrentSession]=useState(null);

  
  const startRecording=(stream,userId)=>{
    console.log('initializing for room',roomId);

    if(!stream) return;
    console.log('valid stream');
    const sessionId=`${roomId}:${userId}:${Date.now()}`;
    chunksRef.current= [];
    mediaRecorderRef.current= new MediaRecorder(stream,{ mimeType: "video/webm" });

    mediaRecorderRef.current.ondataavailable=(e) =>{
      if(e.data.size > 0){
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorderRef.current.start(2000);
    setCurrentSession({ sessionId, roomId, userId, hostId, startedAt: Date.now(), status: "recording"});
  };

 
  const stopRecording= async ()=>{
    return new Promise((resolve) =>{
      if(!mediaRecorderRef.current) return resolve(null);

      mediaRecorderRef.current.onstop= async ()=>{
        const blob= new Blob(chunksRef.current, { type: "video/webm" });

        const db=await getDB();
        await db.put(STORE_NAME,{
          ...currentSession,
          endedAt: Date.now(),
          status: "stopped",
          file: blob,
        });

        setCurrentSession(null);
        resolve(blob);
      };

      mediaRecorderRef.current.stop();
    });
  };

  const uploadAllPending=async (roomid,userid,hostid)=>{
    const db=await getDB();
    const all=await db.getAll(STORE_NAME);

    for (const session of all) {
      if (session.status==="stopped") {
        try{
           console.log('the room id before uploading',session.roomId,roomid);
          const formData = new FormData();
          formData.append("file",session.file,`${session.sessionId}.webm`);
          formData.append("roomId",session.roomId);
          formData.append("userId",session.userId);
          formData.append("hostId",session.hostId);
          formData.append("sessionId",session.sessionId);

          const res=await fetch(`http://localhost:8000/users/upload?roomId=${session.roomId}`, {
            method:"POST",
            body:formData,
            credentials:"include",
          });

          if(res.status===200) {
            await db.delete(STORE_NAME, session.sessionId);
            console.log("Uploaded and removed from DB:",session.sessionId);
          }else{
            console.log("Upload failed, will retry:",session.sessionId);
          }
        }catch(err){
          console.error("Upload error:", err);
        }
      }
    } 
  };

  return {startRecording, stopRecording, uploadAllPending};
}
