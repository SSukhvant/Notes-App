# Notes API

## Local setup

1. Install a supported Node.js LTS release.
2. Run `npm ci` from `server/`.
3. Copy `.env.example` to `.env` (or `.env.local`) and set a private MongoDB URI and a cryptographically random `JWT_SECRET` (at least 32 bytes). The server loads `server/.env.local` before `server/.env`.
4. Set `CLIENT_ORIGIN` to the exact frontend origin.
5. Ensure MongoDB is running at the configured URI, then run `npm run dev`. The API does not start listening until its MongoDB connection succeeds; if startup reports `ECONNREFUSED`, start or correct the database service before retrying.

Never commit `.env` or share database credentials. The MongoDB user should have access only to the application database. Configure secrets in the hosting provider's environment settings for production.

## Security note

Before deploying a release with user authentication, migrate existing notes to an explicit owner or export and remove them. Do not silently expose legacy shared notes to newly registered users. Rotate any credential that was ever committed to source control; deleting a file from the current branch does not remove it from Git history.
