import React from 'react'
import { useRef } from 'react'
import { useNavigate } from 'react-router';

function Login() {
  const userRef=useRef("");
  const passwordRef=useRef("");
  const navigate=useNavigate();
  const loginHandler=async (e)=>{
    try{
    e.preventDefault();
     if((userRef.current)==""||passwordRef.current==""){
       console("invalid email address")
     }
     const res=await fetch('http://localhost:8000/users/login', {
     method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({email:userRef.current.value, password:passwordRef.current.value}),
  });
  if(res.status==201){
    console.log("logged in successfully");
    navigate('/');
  }else{
    console.log("error while logging in,try again");
  }
   }catch(err){
    console.log("try again!!!");
   }
  }
  return (
    <div>
      <div>
        email:
        <input type="text" ref={userRef} ></input>
         <div></div>
         password:
        <input type="text" ref={passwordRef} ></input>
        <button type='submit' onClick={loginHandler}>Sign in</button>
        <p>not a user?</p><button onClick={()=>navigate('/register')}>sign up</button>
      </div>
    </div>
  )
}

export default Login
