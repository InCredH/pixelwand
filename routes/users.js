const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // User model
const validator = require('validator');

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
            res.json({
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

      const sessUser = { id: user.id, name: user.name, email: user.email };
      req.session.user = sessUser; // Auto saves session data in mongo store

      res.json({ msg: " Logged In Successfully", sessUser }); // sends cookie with sessionID automatically in response
    });
  });
});

router.delete("/logout", (req, res) => {
  req.session.destroy((err) => {
    //delete session data from store, using sessionID in cookie
    if (err) throw err;
    res.clearCookie("session-id"); // clears cookie containing expired sessionID
    res.send("Logged out successfully");
  });
});

router.get("/authchecker", (req, res) => {
  const sessUser = req.session.user;
  if (sessUser) {
    return res.json({ msg: " Authenticated Successfully", sessUser });
  } else {
    return res.status(401).json({ msg: "Unauthorized" });
  }
});

module.exports = router;
