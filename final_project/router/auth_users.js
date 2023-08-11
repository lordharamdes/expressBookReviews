const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
  {
    username: "user1",
    password: "password1",
  },
  {
    username: "user2",
    password: "password2",
  },
  {
    username: "user3",
    password: "password3",
  },
];

const isValid = (username) => {
  //returns boolean
  //write code to check if username is already present in records.
  return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  //returns boolean
  //write code to check if username and password are present in records.
  return users.some(
    (user) => user.username === username && user.password === password
  );
};

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign(
            {
                data: password,
            },
            "access",
            { expiresIn: 60 * 60 }
        );

        req.session.authorization = {
            accessToken,
            username,
        };
        return res.status(200).send("User successfully logged in");
    } else {
        return res
            .status(208)
            .json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {

    const isbn = req.params.isbn;
    let filtered_book = books[isbn]
    if (filtered_book) {
        let review = req.query.review;
        let reviewer = req.session.authorization['username'];
        if(review) {
            filtered_book['reviews'][reviewer] = review;
            books[isbn] = filtered_book;
        }
        res.send(`The review for the book with ISBN  ${isbn} has been added/updated.`);
    }
    else{
        res.send("Unable to find this ISBN!");
    }
  });

//Delete book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { username } = req.session;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  book.reviews = book.reviews.filter((review) => review.username !== username);
  return res.status(200).json({ message: "Review deleted" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.authenticatedUser = authenticatedUser;