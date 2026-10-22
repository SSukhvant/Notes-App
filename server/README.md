# Notes API

## Local setup

1. Install a supported Node.js LTS release.
2. Run `npm ci` from `server/`.
3. Copy `.env.example` to `.env` and set a private MongoDB URI and a cryptographically random `JWT_SECRET` (at least 32 bytes).
4. Set `CLIENT_ORIGIN` to the exact frontend origin.
5. Run `npm run dev`.

Never commit `.env` or share database credentials. The MongoDB user should have access only to the application database. Configure secrets in the hosting provider's environment settings for production.

## Security note

Before deploying a release with user authentication, migrate existing notes to an explicit owner or export and remove them. Do not silently expose legacy shared notes to newly registered users. Rotate any credential that was ever committed to source control; deleting a file from the current branch does not remove it from Git history.
