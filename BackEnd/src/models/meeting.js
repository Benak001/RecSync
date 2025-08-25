import mongoose from "mongoose";

// const MeetingSchema =  new mongoose.Schema({
//     meetingId: { type: String, required: true, unique: true },
//     host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     participants: [
//       {
//         userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//         joinedAt: { type: Date, default: Date.now }
//       }
//     ],
//     startTime: { type: Date, required: true },
//     //endTime: { type: Date },
//     isActive: { type: Boolean, default: true }
//   }); 
const RoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true }, 
  createdBy: { type: String,required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  folderUrl: { type: String },
  sessions:[{type:String}],
}, { timestamps: true });
  
  const Room = mongoose.model("room",RoomSchema);
  export default Room;