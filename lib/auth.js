const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Hash password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Compare password
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Middleware to authenticate JWT
const authenticateToken = (req) => {
  // Support both Node.js (authorization) and Next.js (get) header APIs
  let authHeader;
  if (req.headers.get) {
    // Next.js API route (NextRequest)
    authHeader = req.headers.get("authorization");
  } else {
    // Node.js/Express style
    authHeader = req.headers.authorization;
  }
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return null;
  }
  return verifyToken(token);
};

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  authenticateToken,
};
