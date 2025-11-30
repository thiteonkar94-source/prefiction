# PREFICTION — Local development: contact form + DB

This workspace is a static marketing site (HTML + vanilla JS). This change adds a small Express server and SQLite DB to receive and store contact form submissions for local development.

## Quick overview
- Frontend: `index.html`, `script.js` — contact form now POSTs to the API.
- Backend: `server/server.js` — Express API, SQLite (better-sqlite3).
- DB: `server/prefiction.db` (created by migration)
- Admin UI: `http://localhost:3000/admin.html` — view saved submissions (requires API key)

## Run locally (Windows PowerShell)

1. Open a PowerShell window and install dependencies for the server:

```powershell
Set-Location 'D:\PREFICTION-FINAL - Copy (8) - Copy'  # project root
Set-Location './server'
npm install
```

2. Create the DB table (migration):

```powershell
node migrate.js
```

3. Start the server:

```powershell
node server.js
# or 'npm start' from the server folder
```

4. Open the site and admin UI in your browser:

- Main site (served by the server): http://localhost:3000/index.html
- Admin viewer: http://localhost:3000/admin.html

The admin endpoint requires an `x-api-key` header. When running locally the default key is `dev-secret` — set the environment variable `ADMIN_API_KEY` to change it.

## Notes
- The server serves static files from the project root to make local testing easy.
- The contact form uses `http://localhost:3000/api/contact` by default. If you host the site differently you may set `window.PREFICTION_API_BASE` in the page before the script to point to another API base URL.

## Security
- This is a **development** setup. Do not use the default `dev-secret` admin key in production. If you deploy, secure the admin endpoint and the site properly.
