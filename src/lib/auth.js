import jwt from "jsonwebtoken";

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, perfil: user.perfil, loja_id: user.loja_id },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}
