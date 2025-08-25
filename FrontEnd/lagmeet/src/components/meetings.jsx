import React from 'react'
import { useEffect,useState } from 'react'

function Meetings() {
  const [meetings,setMeetings]=useState(null);
  useEffect(()=>{
     list();
  },[])
  const list=async ()=>{
    try{
        const res=await fetch(`http://localhost:8000/users/meetings`, {
            method:"GET",
            credentials:"include",
            headers: {
              "Content-Type": "application/json"
            }
          });
          if(res.status===401){
            console.log('error');
          }
          const data=await res.json();
          setMeetings(data);
    }catch(err){
       console.log('Error while fetching data');
    }
  }
  return (
    <div>
     My meetings
     <div>
        {meetings.map((m,index) => (
          <div key={index}>
            m.roomid
            <div>download</div>
          </div>
        ))}
     </div>
    </div>
  )
}

export default Meetings
