import mongoose from "mongoose";

// const CallHistorySchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   meetingId: { type: mongoose.Schema.Types.ObjectId, ref: "Meeting", required: true },
//   duration: { type: Number, required: true },
//   joinedAt: { type: Date, required: true },
//   leftAt: { type: Date, required: true }
// });

// const CallHistory = mongoose.model("recSession", CallHistorySchema);
// export default CallHistory;



const RecordingSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  startedAt: { type: Date, required: true },
  endedAt: { type: Date },
  status: { type: String, enum: ["recording", "stopped", "uploaded", "failed"], default: "recording" },
  durationMs: { type: Number, default: 0 },
  fileUrl: { type: String }, // link to .webm or S3 path
  timeline: [{
    start: Number, // ms offset
    end: Number,
    fileUrl: String
  }]
}, { timestamps: true });


const recSession = mongoose.model("RecordingSession", RecordingSessionSchema);
export default recSession;

