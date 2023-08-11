const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();



// Get the book list available in the shop
public_users.get('/',function (req, res) {
    res.send(JSON.stringify(books,null,4));

});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    res.send(books[isbn])

 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const requestedAuthor = req.params.author;

// Find books by author
    const booksByAuthor = Object.entries(books)
        .filter(([isbn, book]) => book.author === requestedAuthor)
        .map(([isbn, { title, reviews }]) => ({ isbn, title, reviews }));

    if (booksByAuthor.length === 0) {
        return res.status(404).json({ error: "No books found for the given author" });
  }

  res.json(booksByAuthor);
   });


// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const requestedTitle = req.params.title;

  // Find book by title
  const book = Object.entries(books).find(([isbn, book]) => book.title === requestedTitle);

  if (!book) {
    return res.status(404).json({ error: "Book not found" });
  }

  const [isbn, { author, reviews }] = book;
  const bookDetails = { isbn, author, reviews };
  res.json(bookDetails);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const bookKey = req.params.isbn;

  const book = books[bookKey];
  if (!book) {
    return res.status(404).json({ error: "Book not found" });
  }

  const reviews = Object.entries(book.reviews || {}).map(([username, review]) => ({
    author: book.author,
    title: book.title,
    username,
    rating: review.rating,
    comment: review.comment
  }));

  res.json({reviews })
  //res.json({ author: book.author, title: book.title, reviews });

});


//Register New User
const doesExist = (username)=>{
    let userswithsamename = users.filter((user)=>{
      return user.username === username
    });
    if(userswithsamename.length > 0){
      return true;
    } else {
      return false;
    }
  }

public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    
      if (username && password) {
        if (!isValid(username)) { 
          users.push({"username":username,"password":password});
          return res.status(200).json({message: "User " +username+ " successfully registered"});
        } else {
          return res.status(404).json({message: "User " +username+ " already exists!"});    
        }
      } 
      return res.status(404).json({message: "Unable to register user."});
    });

//Promise or async

// Get all books – Using async callback function
function getAllBooks() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(books);
      }, 2000);
  
      return;
    });
  }
  
  // Search by ISBN – Using Promises
  function getBookByISBN(isbn) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const book = books[isbn];
        if (!book) {
          reject("Book not found");
        }
        resolve(book);
      }, 2000);
    });
  }
  
  // Search by author – Using async callback function
  function getBookByAuthor(author) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const booksByAuthor = [];
        for (const key in books) {
          if (books[key].author === author) {
            booksByAuthor.push(books[key]);
          }
        }
        if (booksByAuthor.length === 0) {
          reject("Book not found");
        }
        resolve(booksByAuthor);
      }, 2000);
    });
  }
  
  // Search by title – Using async callback function
  function getBookByTitle(title) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        for (const key in books) {
          if (books[key].title === title) {
            resolve(books[key]);
          }
        }
        reject("Book not found");
      }, 2000);
    });
  }

module.exports.general = public_users;
