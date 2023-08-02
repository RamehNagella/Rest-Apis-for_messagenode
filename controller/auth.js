const { validationResult } = require("express-validator");

const User = require("../models/user");

const bcrypt = require("bcryptjs");

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  console.log("1111vvv", errors);
  if (!errors.isEmpty) {
    const error = new Error("validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;

  console.log(">>>", email, name, password);

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email: email,
        password: hashedPassword,
        name: name
      });
      console.log("adding to usermodel>>", user);
      return user.save();
    })
    .then((result) => {
      console.log("createdUser", result);
      res
        .statusCode(201)
        .json({ message: "User created sucessfully", userId: result._id });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next();
    });
};
