const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const JournalSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  create_date: {
    type: Date,
    default: Date.now
  },
  post_date: {
    type: Date
  }
});
module.exports = Journal = mongoose.model("Journal", JournalSchema);
