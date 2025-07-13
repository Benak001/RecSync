import mongoose from "mongoose";

const CallHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  meetingId: { type: mongoose.Schema.Types.ObjectId, ref: "Meeting", required: true },
  duration: { type: Number, required: true },
  joinedAt: { type: Date, required: true },
  leftAt: { type: Date, required: true }
});

const CallHistory = mongoose.model("callhistory", CallHistorySchema);
export default CallHistory;