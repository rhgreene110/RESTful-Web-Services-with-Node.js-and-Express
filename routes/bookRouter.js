/* eslint-disable no-param-reassign */
const express = require ('express');
const booksController = require ('../controllers/booksController');

function routes (Book) {
  const bookRouter = express.Router ();
  const controller = booksController (Book);
  bookRouter.route ('/books').post (controller.post).get (controller.get);
  bookRouter.use ('/books/:bookId', (req, res, next) => {
    Book.findById (req.params.bookId, (err, book) => {
      if (err) {
        return res.send (err);
      }
      if (book) {
        req.book = book;
        return next ();
      }
      return res.sendStatus (404);
    });
  });
  bookRouter
    .route ('/books/:bookId')
    //
    // GET (read) an existing document from a mongo database
    .get ((req, res) => res.json (req.book))
    //
    // PUT (write) a new document into the mongo database
    .put ((req, res) => {
      const {book} = req;
      book.title = req.body.title;
      book.author = req.body.author;
      book.genre = req.body.genre;
      book.read = req.body.read;
      req.book.save (err => {
        if (err) {
          return res.send (err);
        }
        return res.json (book);
      });
    })
    //
    // PATCH (update) a document in an mongo database
    .patch ((req, res) => {
      const {book} = req;
      // eslint-disable-next-line no-underscore-dangle

      // This "if" statements prevents a key overwrite
      // by deleting the body._id field before the write.
      if (req.body._id) {
        // eslint-disable-next-line no-underscore-dangle
        delete req.body._id;
      }
      Object.entries (req.body).forEach (item => {
        const key = item[0];
        const value = item[1];
        book[key] = value;
      });
      req.book.save (err => {
        if (err) {
          return res.send (err);
        }
        return res.json (book);
      });
    })
    //
    // DELETE a document from a mongo database
    .delete ((req, res) => {
      req.book.remove (err => {
        if (err) {
          return res.send (err);
        }
        return res.sendStatus (204);
      });
    });
  return bookRouter;
}

module.exports = routes;
