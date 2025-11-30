Render deployment instructions

This repo already contains an Express app under `/server`.
To run the app on Render as a Web Service (so your API endpoints work), follow these steps.

1) (Optional) The repo includes `render.yaml` which configures a Web Service called `prefiction-web`.
   - If you connect the repo to Render, Render can read this file and pre-fill the service settings.

2) Create the Web Service in Render (UI):
   - Go to https://dashboard.render.com
   - Click **New +** → **Web Service**
   - Connect your GitHub repo and choose this repository
   - If prompted, use the following settings (render.yaml already encodes these):
     - Name: `prefiction-web`
     - Environment: `Node`
     - Branch: `main`
     - Build Command: `cd server && npm install`
     - Start Command: `node server/server.js` (or `npm start` from `server`)
     - Instance Type / Plan: `Free`
   - Create the service.

3) Add Environment Variables in Render (Settings → Environment):
   - `MONGODB_URI` = your MongoDB Atlas connection string
   - `ADMIN_API_KEY` = `dev-secret` (or your chosen key)
   - `NODE_ENV` = `production`

4) Wait for the build & deploy to complete. When the service is "Live":
   - Health:  `https://<your-render-url>/_health` should return HTTP 200 (or `{ ok: true }`)
   - Admin:   `https://<your-render-url>/admin.html` should load (and `Fetch` should return results)
   - API:     `https://<your-render-url>/api/contact` should accept POST requests

5) Troubleshooting:
   - If API endpoints return 404, confirm the service is a **Web Service** (not a Static Site).
   - Check the Render service logs for startup errors.
   - Ensure `MONGODB_URI` is correct and the Atlas cluster allows connections.

If you prefer, I can:
- Create the Render Web Service for you (requires Render permissions or API key), or
- Walk you through the Render UI steps while you do them.

