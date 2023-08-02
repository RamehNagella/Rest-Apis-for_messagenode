// exports.getPosts = (req, res, next) => {
//   res.status(200).json({
//     posts: [{ title: "First Post", content: "This is the first post" }]
//   });
// };

// exports.createPost = (req, res, next) => {
//   console.log(">>", req.body);
//   const title = req.body.title;
//   const content = req.body.content;

//   console.log(title, content); ///>undefined undefined
//   //create post in db
//   res.status(201).json({
//     message: "Post created successfully",
//     post: {
//       id: new Date().toISOString(),
//       title: title,
//       content: content
//     }
//   });
// };
// //stasusCode>>201:used to tell the client success & a resourse was created. 200 is just success

//WORKING WITH REACT APP and developing serverside code

//

const fs = require("fs");
const path = require("path");

const { validationResult } = require("express-validator");

const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
  // creating pagination and displaying posts in the page

  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;

  Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((posts) => {
      res.status(200).json({
        message: "Fetched posts successfully.",
        posts: posts,
        totalItems: totalItems
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });

  //here retrivind data from database stored in Post database
  //creating logic for gettting all posts
  // Post.find()
  //   .then((posts) => {
  //     console.log("allPosts: ", posts);
  //     if (!posts) {
  //       const error = new Error("Posts not found!");
  //       error.statusCode = 404;
  //       throw error;
  //     }
  //     res
  //       .status(200)
  //       .json({ message: "Fetched posts successfully.", posts: posts });
  //   })
  //   .catch((err) => {
  //     if (!error.statusCode) {
  //       err.statusCode = 500;
  //     }
  //     next(err);
  //   });

  // retriveing dummy dataa
  // res.status(200).json({
  //   posts: [
  //     //this is the dummy data
  //     {
  //       _id: "1",
  //       title: "First Post",
  //       content: "This is the first post",
  //       imageUrl: "images/book.jpg",
  //       creator: {
  //         name: "Maxmilian"
  //       },
  //       createdAt: new Date()
  //     }
  //   ]
  // });
};

exports.createPost = (req, res, next) => {
  console.log("createdPostBody>> ", req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
    // return res.status(422).json({
    //   message: "Validation failed, entered data is incorrect.",
    //   errors: errors.array()
    // });
  }
  if (!req.file) {
    const error = new Error("No image provided");
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;

  const post = new Post({
    title: title,
    imageUrl: imageUrl,
    content: content,
    creator: { name: "Maxmilian" }
  });
  post
    .save()
    .then((result) => {
      console.log("createPostResult : ", result);
      res.status(201).json({
        message: "Post created successfully",
        post: result
      });
    })
    .catch((err) => {
      // console.log(err);
      if (!error.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
  //create post in db
  // res.status(201).json({
  //   message: "Post created successfully",
  //   post: {
  //     id: new Date().toISOString(),
  //     title: title,
  //     content: content,
  //     creator: { name: "Maxmillian" },
  //     createdAt: new Date()
  //   }
  // });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  // console.log("getpostExtractedId", postId);
  Post.findById(postId)
    .then((post) => {
      console.log("getPostData>>", post);
      if (!post) {
        const error = new Error("Could not found Post!");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: "Postfetched.", post: post });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updatePost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }
  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;

  let imageUrl = req.body.image;

  if (req.file) {
    imageUrl = req.file.path;
  }
  if (!imageUrl) {
    const errror = new Error("No file picked");
    error.statusCode = 422;
    throw error;
  }
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error({ message: "Could not found Post!" });
        error.statusCode = 404;
        throw error;
      }
      //udating code for imageurl to add new image
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;

      return post.save();
    })
    .then((result) => {
      console.log("updatedPostResult: ", result);
      res
        .status(200)
        .json({ message: "post updated successfully", post: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      console.log("dltpost>>>", post);
      if (!post) {
        const error = new Error("post not found to delete.");
        error.statusCode = 404;
        throw error;
      }
      //check logged in user
      // if (postId === post._id) {
      //   return post.findByIdAndRemove(postId);
      // } //>>>>>>.. not worked

      clearImage(post.imageUrl);
      return Post.findByIdAndRemove(postId);
    })
    .then((result) => {
      console.log("deletedPost: ", result);
      res.status(200).json({ message: "Post deleted successfully." });
    })
    .catch((err) => {
      if (err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
//we want trigger this clearImage() function whenever we uploaded a image
