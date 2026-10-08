import {
  users, findUserById, findUserByEmail,
  addUser, updateUser, removeUser,
} from "../data/users.js";

// password-ийг rest operator-оор хасаж, хариунд гаргахаас болино
function toSafe(user) {
  const { password, ...safe } = user;
  return safe;
}

export function list(req, res) {
  res.json({
    count: users.length,
    data: users.map(toSafe),
  });
}

export function getOne(req, res) {
  const user = findUserById(Number(req.params.id));
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(toSafe(user));
}

export function create(req, res) {
  const { id: _ignore, ...input } = req.body; // protects id

  if (!input.email) {
    return res.status(400).json({ message: "email is required" });
  }

  if (findUserByEmail(input.email)) {
    return res.status(409).json({ message: "email already exists" });
  }

  const user = addUser(input);
  res.status(201).json(toSafe(user));
}

export function update(req, res) {
  const id = Number(req.params.id);
  const { id: _ignore, ...changes } = req.body; // protects id

  if (changes.email) {
    const existing = findUserByEmail(changes.email);
    if (existing && existing.id !== id) {
      return res.status(409).json({ message: "email already exists" });
    }
  }

  const updated = updateUser(id, changes);

  if (!updated) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(toSafe(updated));
}

export function remove(req, res) {
  const ok = removeUser(Number(req.params.id));

  if (!ok) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(204).send();
}
