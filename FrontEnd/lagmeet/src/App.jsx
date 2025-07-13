import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Chat from './components/chat'
import Room from './components/room'
import { BrowserRouter,Route,Routes } from 'react-router'
import { useNavigate } from 'react-router'

function App() {
const  [sen,setsen]=useState("");
useEffect(()=>{
  functioname();
},[]);
async function functioname(){
  const res=await fetch('http://localhost:8000', {
    method: 'GET',
  });
  const data=await res.json();
  setsen(data);
}
  return (
    <>
    {sen}
    <Routes>
        
        <Route path="/" element={<Room/>} />
        <Route path="/Chat/:id" element={<Chat/>} />
      </Routes>
    </>
  )
}

export default App
