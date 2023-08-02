const { validationResult } = require("express-validator");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email: email,
        password: hashedPassword,
        name: name
      });
      console.log("adding to database>>", user);
      return user.save();
    })
    .then((result) => {
      console.log("createdUser", result);
      res
        .status(201)
        .json({ message: "User created sucessfully", userId: result._id });
    })
    .catch((err) => {
      // console.log('signuperror: ',err);
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next();
    });
};

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log("11111>>: ", email, password);

  let loadedUser;
  User.findOne({ email: email })
    .then((user) => {
      console.log("loginuser", user);
      if (!user) {
        const error = new Error("A user with this email is not found.");
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error("wrong password!");
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          /// this jwt.token() will create the new signature and packs that in the new json web token. We can add any dataa i the jwt
          email: loadedUser.email,
          userId: loadedUser._id.toString()
        },
        "somesupersecretsecret",
        { expiresIn: "1h" }
      ); // 'somesupersecretsecret will only be store in the server not stored in the client
 
      res
        .status(200)
        .json({ token: token, userId: loadedUser._id.toString() });
    })
    .catch((err) => {
      console.log('loginerr',err);
      // if (!err.statusCode) {
      //   res.statusCode = 500;
      // }
      // next();
    });
};
