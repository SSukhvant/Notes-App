require("dotenv").config();
const crypto = require("node:crypto");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const NotesModel = require("./model/NotesModel");
const UserModel = require("./model/UserModel");
const requireAuth = require("./middleware/auth");

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const CLIENT_ORIGINS = [...new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://s-notes-app.netlify.app",
  ...(process.env.CLIENT_ORIGIN || "").split(","),
  ...(process.env.CLIENT_ORIGINS || "").split(","),
].map((origin) => origin.trim().replace(/\/+$/, "")).filter(Boolean))];
const COLORS = new Set(["#fab1a0", "#ffeaa7", "#74b9ff", "#a29bfe", "#55efc4", "#dfe6e9", "#ffffff"]);

app.disable("x-powered-by");
app.use(cors({ origin(origin, callback) { if (!origin || CLIENT_ORIGINS.includes(origin.replace(/\/+$/, ""))) return callback(null, true); return callback(new Error("Origin is not allowed by CORS.")); }, methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], allowedHeaders: ["Content-Type", "Authorization"] }));

// Keep liveness checks independent of MongoDB so deployment health can be
// distinguished from database connectivity failures.
app.get("/health", (req, res) => res.json({ success: true, status: "ok" }));
app.use(express.json({ limit: "32kb" }));
const rateBuckets = new Map();
function rateLimit({ windowMs, limit }) {
  return (req, res, next) => {
    const key = req.ip + ":" + req.path;
    const now = Date.now();
    const bucket = rateBuckets.get(key);
    if (!bucket || now - bucket.startedAt >= windowMs) rateBuckets.set(key, { startedAt: now, count: 1 });
    else if (++bucket.count > limit) return res.status(429).json({ success: false, message: "Too many requests. Try again later." });
    next();
  };
}
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));
const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

// Vercel imports this module as a serverless handler, so the local start()
// function does not run there. Ensure MongoDB is connected before any route
// accesses a model, while reusing the connection across warm invocations.
let mongoConnectionPromise;
async function ensureMongoConnection() {
  if (mongoose.connection.readyState === 1) return;
  if (!process.env.MONGO_URL) throw new Error("MONGO_URL is required.");
  if (!mongoConnectionPromise) {
    mongoConnectionPromise = mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 10000,
    }).catch((error) => {
      mongoConnectionPromise = undefined;
      throw error;
    });
  }
  await mongoConnectionPromise;
}
app.use(asyncRoute(async (req, res, next) => {
  await ensureMongoConnection();
  next();
}));
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10 });
const validId = (id) => mongoose.isValidObjectId(id);
const clean = (value, max) => typeof value === "string" ? value.trim().slice(0, max) : "";
const hashPassword = (password, salt = crypto.randomBytes(16).toString("hex")) => new Promise((resolve, reject) => {
  crypto.scrypt(password, salt, 64, (error, key) => error ? reject(error) : resolve({ salt, hash: key.toString("hex") }));
});
const verifyPassword = async (password, user) => {
  const key = await new Promise((resolve, reject) => crypto.scrypt(password, user.passwordSalt, 64, (error, derived) => error ? reject(error) : resolve(derived)));
  const expected = Buffer.from(user.passwordHash, "hex");
  return expected.length === key.length && crypto.timingSafeEqual(expected, key);
};
const createToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error("JWT_SECRET must contain at least 32 characters.");
  const payload = Buffer.from(JSON.stringify({ sub: String(userId), exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return payload + "." + signature;
};


app.post("/auth/register", authLimiter, asyncRoute(async (req, res) => {
  const name = clean(req.body?.name, 80);
  const email = clean(req.body?.email, 254).toLowerCase();
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 12 || password.length > 128) {
    return res.status(422).json({ success: false, message: "Enter a name, valid email, and password of 12–128 characters." });
  }
  if (await UserModel.exists({ email })) return res.status(409).json({ success: false, message: "An account with this email already exists." });
  const { salt, hash } = await hashPassword(password);
  const user = await UserModel.create({ name, email, passwordSalt: salt, passwordHash: hash });
  return res.status(201).json({ success: true, token: createToken(user._id), user: { id: user._id, name: user.name, email: user.email } });
}));

app.post("/auth/login", authLimiter, asyncRoute(async (req, res) => {
  const email = clean(req.body?.email, 254).toLowerCase();
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const user = await UserModel.findOne({ email }).select("+passwordHash +passwordSalt");
  if (!user || !await verifyPassword(password, user)) return res.status(401).json({ success: false, message: "Invalid email or password." });
  return res.json({ success: true, token: createToken(user._id), user: { id: user._id, name: user.name, email: user.email } });
}));

app.get("/auth/me", requireAuth, asyncRoute(async (req, res) => {
  const user = await UserModel.findById(req.userId).select("name email");
  if (!user) return res.status(401).json({ success: false, message: "Account not found." });
  return res.json({ success: true, user: { id: user._id, name: user.name, email: user.email } });
}));

app.use("/read", requireAuth);
app.get("/read", asyncRoute(async (req, res) => {
  const data = await NotesModel.find({ owner: req.userId }).sort({ updatedAt: -1 }).lean();
  return res.json({ success: true, data });
}));

app.get("/search", requireAuth, asyncRoute(async (req, res) => {
  const query = clean(req.query.q, 100).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const filter = { owner: req.userId };
  if (query) filter.$or = [{ title: { $regex: query, $options: "i" } }, { note: { $regex: query, $options: "i" } }];
  const data = await NotesModel.find(filter).sort({ updatedAt: -1 }).limit(100).lean();
  return res.json({ success: true, data });
}));

app.post("/insert", requireAuth, asyncRoute(async (req, res) => {
  const title = clean(req.body?.title, 160);
  const note = clean(req.body?.note, 20000);
  const color = clean(req.body?.color, 7) || "#ffffff";
  if (!title || !note || !COLORS.has(color)) return res.status(422).json({ success: false, message: "Enter a title and note, and choose a valid color." });
  const created = await NotesModel.create({ owner: req.userId, title, note, color });
  return res.status(201).json({ success: true, data: created });
}));

app.put("/update/:id", requireAuth, asyncRoute(async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid note ID." });
  const updates = {};
  if (Object.hasOwn(req.body || {}, "title")) updates.title = clean(req.body.title, 160);
  if (Object.hasOwn(req.body || {}, "note")) updates.note = clean(req.body.note, 20000);
  if (Object.hasOwn(req.body || {}, "color")) updates.color = clean(req.body.color, 7) || "#ffffff";
  if (!Object.keys(updates).length || (updates.title !== undefined && !updates.title) || (updates.note !== undefined && !updates.note) || (updates.color !== undefined && !COLORS.has(updates.color))) {
    return res.status(422).json({ success: false, message: "Provide valid note fields to update." });
  }
  const updated = await NotesModel.findOneAndUpdate({ _id: req.params.id, owner: req.userId }, { $set: updates }, { new: true, runValidators: true });
  if (!updated) return res.status(404).json({ success: false, message: "Note not found." });
  return res.json({ success: true, data: updated });
}));

app.delete("/delete/:id", requireAuth, asyncRoute(async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid note ID." });
  const deleted = await NotesModel.findOneAndDelete({ _id: req.params.id, owner: req.userId });
  if (!deleted) return res.status(404).json({ success: false, message: "Note not found." });
  return res.json({ success: true, message: "Note deleted." });
}));

app.use((req, res) => res.status(404).json({ success: false, message: "Route not found." }));
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) return res.status(400).json({ success: false, message: "Invalid JSON body." });
  if (err?.name === "ValidationError") return res.status(422).json({ success: false, message: "Please check the supplied fields." });
  if (err?.code === 11000) return res.status(409).json({ success: false, message: "An account with this email already exists." });
  console.error("API request failed:", err.message);
  return res.status(500).json({ success: false, message: "Unexpected server error." });
});

async function start() {
  if (!process.env.MONGO_URL) throw new Error("MONGO_URL is required.");
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error("JWT_SECRET must contain at least 32 characters.");
  await mongoose.connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 10000 });
  app.listen(PORT, () => console.log("Notes API listening on port " + PORT));
}
if (require.main === module) start().catch((error) => { console.error("Unable to start Notes API:", error.message); process.exit(1); });
module.exports = app;
