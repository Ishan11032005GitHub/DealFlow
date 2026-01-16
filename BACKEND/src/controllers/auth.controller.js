import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export async function login(req, res) {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: "username and password required" });
  }

  if (!env.JWT_SECRET) {
    return res.status(500).json({ message: "JWT_SECRET missing in .env" });
  }

  const ok = username === env.ADMIN_USER && password === env.ADMIN_PASS;
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { role: "admin", username },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.json({ token });
}
