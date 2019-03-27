const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Load Validation
const validateExpenseInput = require("../../validation/expense");

//Load expense model
const Expense = require("../../models/Expense");
//Load User model
const User = require("../../models/User");
//Load Profile model
const Profile = require("../../models/Profile");

//@route GET api/expense
//@desc  GET cuurent users planner
//@access Private

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Expense.find({ user: req.user.id }).then(expense => {
      if (!expense) {
        errors.noexpense = "There is no planner created by user.";
        return res.status(404).json(errors);
      }
      res.json(expense);
    });
  }
);
//@route GET api/expense/user/:user_id
//@desc Get planner by user ID
//@access Public

router.get("/user/:user_id", (req, res) => {
  const errors = {};
  Expense.find({ user: req.params.user_id })
    .then(expense => {
      if (!expense) {
        errors.noplanner = "user does not created any planner.";
        res.status(404).json(errors);
      }
      res.json(expense);
    })
    .catch(err => res.status(404).json(err));
});

//@route GET api/expense
//@desc  Create planner in expense
//@access Private

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateExpenseInput(req.body);
    //Check Validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    //Get fields
    const expenseFields = {};
    expenseFields.user = req.user.id;
    if (req.body.description) expenseFields.description = req.body.description;
    if (req.body.amount) expenseFields.amount = req.body.amount;
    if (req.body.month) expenseFields.month = req.body.month;

    Expense.find({ user: req.user.id }).then(expense => {
      //create
      //save planner in expense
      new Expense(expenseFields).save().then(expense => res.json(expense));
    });
  }
);

// @route   Update api/expense/:id
// @desc    Update planner
// @access  Private
router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateExpenseInput(req.body);
    //check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    //Get fields
    const expenseFields = {};
    expenseFields.user = req.user.id;
    if (req.body.description) expenseFields.description = req.body.description;
    if (req.body.amount) expenseFields.amount = req.body.amount;
    if (req.body.month) expenseFields.month = req.body.month;

    Expense.findByIdAndUpdate(req.params.id, expenseFields).then(
      expenseFields => res.json(expenseFields)
    );
  }
);

// @route   DELETE api/expense/:id
// @desc    Delete planner
// @access  Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Expense.findById(req.params.id)
        .then(expense => {
          // Check for post owner
          if (expense.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ notauthorized: "User not authorized" });
          }

          // Delete
          expense.remove().then(() => res.json({ success: true }));
        })
        .catch(err =>
          res.status(404).json({ enentnotfound: "No planner found" })
        );
    });
  }
);

module.exports = router;
