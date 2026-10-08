export const users = [
  { id: 1, name: "Bat", email: "bat@example.com", password: "secret123" },
  { id: 2, name: "Sara", email: "sara@example.com", password: "pass456" },
];

let nextId = 3;

export function findUserById(id) {
  return users.find((user) => user.id === id);
}

export function findUserByEmail(email) {
  return users.find((user) => user.email === email);
}

export function addUser(input) {
  const user = { id: nextId++, ...input };
  users.push(user);
  return user;
}

export function updateUser(id, changes) {
  const user = findUserById(id);
  if (!user) return null;

  Object.assign(user, changes);
  return user;
}

export function removeUser(id) {
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) return false;

  users.splice(index, 1);
  return true;
}
