const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Load model
const Journal = require("../../models/Journal");
//Load User model
const User = require("../../models/User");
//Load Profile model
const Profile = require("../../models/Profile");

//Load Validation
const validateJournalInput = require("../../validation/journal");

//@route GET api/journals
//@desc  GET journals
//@access Public
router.get("/", (req, res) => {
  Journal.find()

    .then(journal => res.json(journal))
    .catch(err => res.status(404).json({ nopostfound: "noposts found." }));
});

//@route GET api/journals/:id
//@desc  GET journals by id
//@access Public
router.get("/:id", (req, res) => {
  Journal.findById(req.params.id)
    .sort({ date: -1 })
    .then(journal => res.json(journal))
    .catch(err =>
      res.status(404).json({ nopostfound: "nopost found with that id." })
    );
});

//@route GET api/journal
//@desc  GET cuurent users journal
//@access Private

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Journal.find({ user: req.user.id }).then(journal => {
      if (!journal) {
        errors.nojournal = "There is no article found.";
        return res.status(404).json(errors);
      }
      res.json(journal);
    });
  }
);

//@route GET api/journal/user/:user_id
//@desc Get journal by user ID
//@access Public

router.get("/user/:user_id", (req, res) => {
  const errors = {};
  Journal.find({ user: req.params.user_id })
    .then(journal => {
      if (!journal) {
        errors.nojournal = "user does not created any journal.";
        res.status(404).json(errors);
      }
      res.json(journal);
    })
    .catch(err => res.status(404).json(err));
});

//@route GET api/journal
//@desc  Create articles in journal
//@access Private

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateJournalInput(req.body);
    //Check Validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    //Get fields
    const journalFields = {};
    journalFields.user = req.user.id;
    if (req.body.title) journalFields.title = req.body.title;
    if (req.body.content) journalFields.content = req.body.content;

    Journal.find({ user: req.user.id }).then(journal => {
      //create
      //save article in journal
      new Journal(journalFields).save().then(journal => res.json(journal));
    });
  }
);

// @route   Update api/journal/:id
// @desc    Update article
// @access  Private
router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateJournalInput(req.body);
    //check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    //Get fields
    const journalFields = {};
    journalFields.user = req.user.id;
    if (req.body.title) journalFields.title = req.body.title;
    if (req.body.content) journalFields.content = req.body.content;

    Journal.findByIdAndUpdate(req.params.id, journalFields).then(
      journalFields => res.json(journalFields)
    );
  }
);

// @route   DELETE api/journal/:id
// @desc    Delete article
// @access  Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Journal.findById(req.params.id)
        .then(journal => {
          // Check for post owner
          if (journal.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ notauthorized: "User not authorized" });
          }

          // Delete
          journal.remove().then(() => res.json({ success: true }));
        })
        .catch(err =>
          res.status(404).json({ enentnotfound: "No article found" })
        );
    });
  }
);

module.exports = router;
