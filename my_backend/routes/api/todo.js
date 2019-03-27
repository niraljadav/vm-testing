const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Load Validation
const validateTodoInput = require("../../validation/todo");

//Load Todo model
const Todo = require("../../models/Todo");
//Load profile model
const Profile = require("../../models/Profile");
//Load User model
const User = require("../../models/User");

//@route GET api/todo
//@desc  GET todo lists
//@access Public
router.get("/", (req, res) => {
  Todo.find()

    .then(todo => res.json(todo))
    .catch(err => res.status(404).json({ nolistfound: "nolists found." }));
});

//@route GET api/todo/user/:user_id
//@desc Get todo by user ID
//@access Public

router.get("/user/:user_id", (req, res) => {
  const errors = {};
  Todo.find({ user: req.params.user_id })
    .then(todo => {
      if (!todo) {
        errors.notodo = "user does not created any todolist.";
        res.status(404).json(errors);
      }
      res.json(todo);
    })
    .catch(err => res.status(404).json(err));
});

//@route GET api/todo
//@desc  GET cuurent users todolist
//@access Private

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Todo.findOne({ user: req.user.id }).then(todo => {
      if (!todo) {
        errors.notodo = "There is no todolist created by user.";
        return res.status(404).json(errors);
      }
      res.json(todo);
    });
  }
);

//@route GET api/todo
//@desc  Create events in todo
//@access Private

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateTodoInput(req.body);
    //Check Validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    //Get fields
    const todoFields = {};
    todoFields.user = req.user.id;
    if (req.body.content) todoFields.content = req.body.content;
    if (req.body.completed) todoFields.completed = req.body.completed;

    Todo.find({ user: req.user.id }).then(todo => {
      //create
      //save todo event
      new Todo(todoFields).save().then(todo => res.json(todo));
    });
  }
);

// @route   Update api/todo/:id
// @desc    Update event
// @access  Private
router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateTodoInput(req.body);
    //check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    //Get fields
    const todoFields = {};
    todoFields.user = req.user.id;
    if (req.body.content) todoFields.content = req.body.content;
    if (req.body.completed) todoFields.completed = req.body.completed;
    Todo.findByIdAndUpdate(req.params.id, todoFields).then(todoFields =>
      res.json(todoFields)
    );
  }
);

// @route   DELETE api/todo/:id
// @desc    Delete event
// @access  Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Todo.findById(req.params.id)
        .then(todo => {
          // Check for post owner
          if (todo.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ notauthorized: "User not authorized" });
          }

          // Delete
          todo.remove().then(() => res.json({ success: true }));
        })
        .catch(err =>
          res.status(404).json({ enentnotfound: "No event found" })
        );
    });
  }
);

module.exports = router;
