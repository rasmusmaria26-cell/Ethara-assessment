import jwt from 'jsonwebtoken';

/**
 * verifyJWT middleware
 * Expects: token in req.cookies.token
 * Attaches req.user = { id, email, name }
 */
export function verifyJWT(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, email: payload.email, name: payload.name };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
