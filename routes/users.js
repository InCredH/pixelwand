const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // User model
const Session = require('../models/Sessions'); // Session model
const validator = require('validator');
const { v4: uuidv4 } = require('uuid');

const passwordValidator = (password) => {
  // Regular expressions for uppercase, lowercase, and numbers
  const uppercaseRegex = /[A-Z]/;
  const lowercaseRegex = /[a-z]/;
  const numberRegex = /[0-9]/;

  // Check if the password meets the criteria
  const hasUppercase = uppercaseRegex.test(password);
  const hasLowercase = lowercaseRegex.test(password);
  const hasNumber = numberRegex.test(password);

  return hasUppercase && hasLowercase && hasNumber;
};

router.post("/register", (req, res) => {
  console.log(req.body)
  const { name, email, password } = req.body;

  // Check required fields
  if (!name || !email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ msg: 'Invalid email format' });
  }

  // Check password length
  if (password.length < 6) {
    return res
      .status(400)
      .json({ msg: "Password should be at least 6 characters long" });
  }

  if (!passwordValidator(password)) {
    return res.status(400).json({ msg: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' });
  }

  User.findOne({ email: email }).then((user) => {
    if (user) return res.status(400).json({ msg: "User already exists" });

    // New User created
    const newUser = new User({
      name,
      email,
      password,
    });

    // Password hashing
    bcrypt.genSalt(12, (err, salt) => {
      if (err) throw err;

      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;

        newUser.password = hash;
        // Save user
        newUser
          .save()
          .then(() =>
            res.status(200).json({
              msg: "Successfully Registered",
            })
          )
          .catch((err) => console.log(err));
      });
    });
  });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // basic validation
  if (!email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }
  //check for existing user
  User.findOne({ email }).then((user) => {
    if (!user) return res.status(400).json({ msg: "User does not exist" });

    // Validate password
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

      const newSession = new Session({
        userId: user.id,
        token: uuidv4()
      });

      //save the session in session store
      newSession.save().then(() => {
        console.log('Session saved');
        res.status(200).json({ msg: "Logged In Successfully", newSession }); 
      }).catch((err) => {
        console.log(err);
      });

    });
  });
});

router.delete('/logout/:sessionId', (req, res) => {
  sessionId = req.params.sessionId;

  Session.findOne({ token: sessionId }).then((session) => {
    if (!session) return res.status(400).json({ msg: "Session does not exist" });

    Session.deleteOne({ token: sessionId }).then(() => {
      res.json({ msg: "Logged Out Successfully" }); 
    }).catch((err) => {
      console.log(err);
    });
  });
});

router.get("/protectedRoute", (req, res) => {
  var sessionId = req.headers.authorization;
  //remove bearer from token
  sessionId = sessionId.slice(7, sessionId.length);
  console.log(sessionId);

  Session.findOne({ token: sessionId }).then((session) => {
    if (!session) return res.status(401).json({ msg: "Unauthorized" });

    User.findOne({ _id: session.userId }).then((user) => {
      if (!user) return res.status(401).json({ msg: "Unauthorized" });

      res.json({ msg: " Authenticated Successfully", user });
    });
  });
});

module.exports = router;
