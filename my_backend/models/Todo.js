const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const TodoSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },

  content: {
    type: String,
    required: true
  },
  created_date: {
    type: Date,
    default: Date.now
  },
  completed: {
    type: Boolean
  }
});
module.exports = Todo = mongoose.model("Todo", TodoSchema);
