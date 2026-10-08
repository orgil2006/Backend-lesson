export const books = [
  { id: 1, title: "Clean Code", price: 45000, isAvailable: true },
  { id: 2, title: "JavaScript: The Good Parts", price: 38000, isAvailable: true },
  { id: 3, title: "Node.js Basics", price: 30000, isAvailable: true },
];

let nextId = 4;

export function findBookById(id) {
  return books.find((book) => book.id === id);
}

export function addBook(input) {
  const book = {
    id: nextId++,
    isAvailable: true,
    ...input,
  };
  books.push(book);
  return book;
}

export function updateBook(id, changes) {
  const book = findBookById(id);
  if (!book) return null;

  Object.assign(book, changes);
  return book;
}

export function removeBook(id) {
  const index = books.findIndex((book) => book.id === id);
  if (index === -1) return false;

  books.splice(index, 1);
  return true;
}
