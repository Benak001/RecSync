import React from 'react'
import { useRef } from 'react'
import { useNavigate } from 'react-router';

function Register() {
  const nameRef=useRef("");
  const userRef=useRef("");
  const passwordRef=useRef("");
  const navigate=useNavigate();
  const regHandler=async (e)=>{
    try{
    e.preventDefault();
    //  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //  if(!emailRegex.test(userRef.current)){
    //    console("invalid email address")
    //  }
    
     if(userRef.current.length<6){
        console.log('userid should have atleast 6 characters');
     }
     if(passwordRef.current.length<8){
       console.log("password should contain atleast 8 characters ");
     }
     const res=await fetch('http://localhost:8000/users/register', {
     method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ name:nameRef.current.value,email:userRef.current.value, password:passwordRef.current.value }),
  });
  console.log('done');
  if(res.status==201){
    console.log("user registered in successfully");
    navigate('/');
  }else{
    console.log("error while registering the user,try again");
  }
   }catch(err){
    console.log("try again!!!");
   }
  }
  return (
    <div>
      <div>
        Name:
        <input type="text" ref={nameRef} ></input>
        UserId:
        <input type="text" ref={userRef} ></input>
        Password:
        <input type="text" ref={passwordRef} ></input>
        <button type='submit' onClick={regHandler}>Sign in</button>
        <p>already a user?</p><button onClick={()=>navigate('/login')}>sign in</button>
      </div>
    </div>
  )
}

export default Register;




