const crypto = require("node:crypto");

function requireAuth(req, res, next) {
  const header = req.get("authorization") || "";
  const match = /^Bearer ([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)$/.exec(header);
  if (!match) return res.status(401).json({ success: false, message: "Authentication required." });
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) return res.status(503).json({ success: false, message: "Authentication is not configured." });
  const encoded = match[1];
  const expected = crypto.createHmac("sha256", secret).update(encoded).digest("base64url");
  const suppliedBuffer = Buffer.from(match[2]);
  const expectedBuffer = Buffer.from(expected);
  if (suppliedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(suppliedBuffer, expectedBuffer)) {
    return res.status(401).json({ success: false, message: "Invalid session." });
  }
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (!payload.sub || !Number.isFinite(payload.exp) || payload.exp <= Date.now()) throw new Error("Expired");
    req.userId = payload.sub;
    return next();
  } catch {
    return res.status(401).json({ success: false, message: "Session expired. Please sign in again." });
  }
}

module.exports = requireAuth;
