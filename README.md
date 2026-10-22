# Keep Notes

A focused, responsive notes workspace built with React and an Express/MongoDB API. Keep Notes supports personal accounts, private note collections, quick search, color-coded cards, and a distraction-free editor.

## Product highlights

- Email/password registration and sign-in with scrypt password hashing.
- Signed, expiring bearer sessions and server-side note ownership checks.
- Create, search, edit, and delete notes with input validation.
- Responsive note grid, accessible controls, empty/loading/error states, and reduced-motion support.
- API request limits, safe JSON errors, and environment-based configuration.
- GitHub Actions checks for frontend production builds and backend syntax/tests.

## Stack

- Frontend: React 18, JavaScript, Sass, Bootstrap utilities/components.
- API: Node.js, Express, Mongoose.
- Database: MongoDB.
- Automation: GitHub Actions.

## Run locally

Prerequisites: Node.js 20+, npm, and a MongoDB instance.

1. Copy `server/.env.example` to `server/.env`.
2. Set `MONGO_URL` to a private development database and `JWT_SECRET` to a cryptographically random secret of at least 32 characters.
3. From `server/`, run `npm ci` and `npm run dev`.
4. Copy `notes/.env.example` to `notes/.env`.
5. From `notes/`, run `npm ci` and `npm start`.

The frontend runs on `http://localhost:3000` and the API on `http://localhost:3001` by default.

## Production configuration

Set `MONGO_URL`, `JWT_SECRET`, `CLIENT_ORIGIN`, and `PORT` in the backend hosting provider. Set `REACT_APP_API_URL` in the frontend hosting provider to the deployed API origin, then rebuild the frontend. Configure CORS for the exact deployed frontend origin and use TLS.

Never commit real environment files. Rotate any database credential that has ever been committed, even after removing the file. Use a least-privilege MongoDB user and a managed, shared rate limiter if deploying multiple API instances.

## Existing data

Older versions stored notes without an owner. The secured API intentionally does not expose ownerless legacy records to new users. Back up and explicitly migrate any notes you need to preserve before switching a live deployment to this version. Do not assign legacy notes to arbitrary users.

## Checks

- Frontend production build: `cd notes && npm ci && npm run build`
- Backend tests: `cd server && npm ci && npm test`
- Backend syntax: `node --check server/app.js`

## Security model

The API requires authentication for note access and scopes each note query to the authenticated account. Passwords are stored as salted scrypt hashes, never as plaintext. Sessions expire after seven days. This project is an evolving portfolio application; perform deployment-specific security review and end-to-end testing before storing sensitive personal information.
