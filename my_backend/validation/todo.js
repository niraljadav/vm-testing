const Validator = require("validator");
const isEmpty = require("./is-empty");
module.exports = function validateTodoInput(data) {
  let errors = {};
  // Convert empty fields to an empty string so we can use validator functions
  data.content = !isEmpty(data.content) ? data.content : "";

  // Content checks
  if (Validator.isEmpty(data.content)) {
    errors.content = "Enter somthing here..";
  }
  //Completion check
  //if (Validator.isBoolean(data.completed)) {
  // errors.completed = "Not completed.";
  // }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
