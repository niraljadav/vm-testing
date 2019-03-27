const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const CalendarSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  from: {
    type: Date,
    default: Date.now
  },
  to: {
    type: Date
  },
  time: {
    type: Date
  },
  created_date: {
    type: Date,
    default: Date.now
  }
});
module.exports = Calendar = mongoose.model("Calendar", CalendarSchema);
