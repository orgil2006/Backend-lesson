import {
  books, findBookById, addBook,
  updateBook, removeBook,
} from "../data/books.js";

export function list(req, res) {
  res.json({
    count: books.length,
    data: books,
  });
}

export function getOne(req, res) {
  const book = findBookById(Number(req.params.id));
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  res.json(book);
}

export function create(req, res) {
  const { title, price } = req.body;

  if (!title) {
    return res.status(400).json({ message: "title is required" });
  }

  const book = addBook({ title, price });
  res.status(201).json(book);
}

export function update(req, res) {
  const { id: _ignore, ...changes } = req.body; // protects id
  const updated = updateBook(Number(req.params.id), changes);

  if (!updated) {
    return res.status(404).json({ message: "Book not found" });
  }
  res.json(updated);
}

export function remove(req, res) {
  const ok = removeBook(Number(req.params.id));

  if (!ok) {
    return res.status(404).json({ message: "Book not found" });
  }
  res.status(204).send();
}
