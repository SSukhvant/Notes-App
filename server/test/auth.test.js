const test = require("node:test");
const assert = require("node:assert/strict");
const requireAuth = require("../middleware/auth");

function invokeAuth(header) {
  const req = { get: (name) => name.toLowerCase() === "authorization" ? header : undefined };
  const res = {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
  let nextCalled = false;
  requireAuth(req, res, () => { nextCalled = true; });
  return { req, res, nextCalled };
}

test("rejects requests without a bearer token", () => {
  const { res, nextCalled } = invokeAuth(undefined);
  assert.equal(res.statusCode, 401);
  assert.equal(nextCalled, false);
});

test("rejects malformed bearer tokens", () => {
  const { res, nextCalled } = invokeAuth("Bearer definitely-not-a-token");
  assert.equal(res.statusCode, 401);
  assert.equal(nextCalled, false);
});

test("fails closed when the session secret is not configured", () => {
  const original = process.env.JWT_SECRET;
  delete process.env.JWT_SECRET;
  const { res, nextCalled } = invokeAuth("Bearer abc.def");
  if (original !== undefined) process.env.JWT_SECRET = original;
  assert.equal(res.statusCode, 503);
  assert.equal(nextCalled, false);
});
