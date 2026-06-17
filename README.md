# TextPortal

TextPortal is a secure, temporary text-sharing service designed to quickly transfer text between devices using temporary short codes or direct URLs.

## Features

- **Send & Receive Texts**: Share text easily using a 4-character short code.
- **Auto-expiration**: Texts expire automatically after 5 minutes.
- **Direct URLs**: Quickly receive texts via `https://textportal.netlify.app/r/XXXX`.
- **QR Code Generation**: Instantly scan to open the text on your mobile device.
- **IP Rate Limiting**: Secure against brute-forcing codes (blocks IP after 3 failed attempts).
- **Dual Storage Providers**: Uses Memory for local development, and Upstash Redis for production.

## Architecture

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router v6.
- **Backend**: Netlify Functions (stateless functions handling API logic).
- **Storage**: Pluggable storage system (Memory & Upstash Redis).
- **Styling**: Tailwind CSS with custom variables for a modern, futuristic dark theme.

## Local Development Setup

To run TextPortal locally:

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the local development server**
   ```bash
   npm run dev
   # OR with Netlify CLI to test functions:
   netlify dev
   ```

3. **Open the app**
   Visit `http://localhost:5173` (or `http://localhost:8888` if using `netlify dev`).

## Environment Variables

### Frontend

- `VITE_APP_URL`: The base URL of your application. E.g., `http://localhost:5173` or `https://textportal.netlify.app`. Used to generate the direct receive URL and QR Code.

### Backend

Create a `.env` file in the root with the following variables:

- `STORAGE_PROVIDER`: Set to `memory` (default) for local dev, or `redis` for production.
- `UPSTASH_REDIS_REST_URL`: The REST URL provided by Upstash.
- `UPSTASH_REDIS_REST_TOKEN`: The REST Token provided by Upstash.

## Upstash Redis Setup (Production)

1. Create a free Upstash Redis database at [Upstash](https://upstash.com/).
2. Copy the REST URL and REST Token.
3. In your Netlify Site Settings > Environment variables, add:
   - `STORAGE_PROVIDER="redis"`
   - `UPSTASH_REDIS_REST_URL="..."`
   - `UPSTASH_REDIS_REST_TOKEN="..."`
   - `VITE_APP_URL="https://your-site-name.netlify.app"`

## Netlify Deployment

TextPortal is ready to be deployed to Netlify out of the box.

1. Push this repository to GitHub.
2. In Netlify, "Import an existing project" and connect your repository.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Functions directory is already configured via `netlify.toml`.
6. Add your Environment Variables in the Netlify Dashboard.
7. Click Deploy!

## PWA Support

TextPortal is configured as an installable Progressive Web App (PWA). You can install it on your mobile device or desktop for a native-like experience.

## Troubleshooting

- **"npx: command not found" or "npm: command not found"**: Ensure Node.js is installed and added to your system's PATH.
- **Functions returning 500 locally**: Ensure you run the app using `netlify dev` so Netlify Functions are correctly served and proxied.
- **Styles not applying**: Ensure Tailwind is configured correctly and Vite is rebuilding CSS.
