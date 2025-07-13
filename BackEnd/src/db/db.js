import mongoose from 'mongoose';
import {DB_NAME} from "../constants.js";
import dotenv from 'dotenv';

dotenv.config(); 

const ConnectDb=async()=>{
  try{
    const ConnectionInstance= await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`)
    console.log(`\n mongoDB connection successful ${ConnectionInstance.connection.host}`);
  }catch(err){
     console.log('mongoDB connection failed:DB error',err);
     process.exit(1);
  }
}
export default ConnectDb;