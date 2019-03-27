const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Load Validation
const validateCalendarInput = require("../../validation/calendar");

//Load calendar model
const Calendar = require("../../models/Calendar");
//Load profile model
const Profile = require("../../models/Profile");
//Load User model
const User = require("../../models/User");

//@route GET api/calendar
//@desc  GET calendar events
//@access Public
router.get("/", (req, res) => {
  Calendar.find()

    .then(calendar => res.json(calendar))
    .catch(err => res.status(404).json({ noeventfound: "noevents found." }));
});

//@route GET api/calendar/test
//@desc Test calendar route
//@access Public

router.get("/test", (req, res) => res.json({ msg: "profile work" }));

//@route GET api/calendar/:id
//@desc  GET calendar by id
//@access Public
router.get("/:id", (req, res) => {
  Calendar.findById(req.params.id)
    .sort({ date: -1 })
    .then(calendar => res.json(calendar))
    .catch(err =>
      res.status(404).json({ noeventfound: "noevent found with that id." })
    );
});

//@route GET api/calendar
//@desc  GET cuurent users calendar
//@access Private

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Calendar.find({ user: req.user.id }).then(calendar => {
      if (!calendar) {
        errors.nocalendar = "There is no events created by user.";
        return res.status(404).json(errors);
      }
      res.json(calendar);
    });
  }
);

//@route GET api/calendar/user/:user_id
//@desc Get calendar by user ID
//@access Public

router.get("/user/:user_id", (req, res) => {
  const errors = {};
  Calendar.find({ user: req.params.user_id })
    .then(calendar => {
      if (!calendar) {
        errors.nocalendar = "user does not created any event.";
        res.status(404).json(errors);
      }
      res.json(calendar);
    })
    .catch(err => res.status(404).json(err));
});

//@route GET api/calendar
//@desc  Create events in calendar
//@access Private

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateCalendarInput(req.body);
    //Check Validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    //Get fields
    const calendarFields = {};
    calendarFields.user = req.user.id;
    if (req.body.title) calendarFields.title = req.body.title;
    if (req.body.description) calendarFields.description = req.body.description;

    Calendar.find({ user: req.user.id }).then(calendar => {
      //create
      //save calendar event
      new Calendar(calendarFields).save().then(calendar => res.json(calendar));
    });
  }
);

// @route   Update api/calendar/:id
// @desc    Update event
// @access  Private
router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateCalendarInput(req.body);
    //check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    //Get fields
    const calendarFields = {};
    calendarFields.user = req.user.id;
    if (req.body.title) calendarFields.title = req.body.title;
    if (req.body.description) calendarFields.description = req.body.description;

    Calendar.findByIdAndUpdate(req.params.id, calendarFields).then(
      calendarFields => res.json(calendarFields)
    );
  }
);

// @route   DELETE api/calendar/:id
// @desc    Delete event
// @access  Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Calendar.findById(req.params.id)
        .then(calendar => {
          // Check for post owner
          if (calendar.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ notauthorized: "User not authorized" });
          }

          // Delete
          calendar.remove().then(() => res.json({ success: true }));
        })
        .catch(err =>
          res.status(404).json({ enentnotfound: "No event found" })
        );
    });
  }
);

module.exports = router;
