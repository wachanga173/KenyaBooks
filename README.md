# Kenya Accounting Desktop Application

A full-stack solution featuring an offline-first Electron React application for accounting in Kenya, and a Next.js distribution landing page.

## Project Structure

- `/desktop` - The Electron + React (Vite) Desktop Application
- `/web` - The Next.js landing page (Distribution platform)

## Desktop Application (`/desktop`)

Built with Electron, React, Tailwind CSS, FortuneSheet, and better-sqlite3.

### Features
- **Offline First**: All data is stored locally in an SQLite database.
- **Inbuilt Spreadsheet**: Full Excel-like spreadsheet integrated directly into the app using FortuneSheet.
- **KRA Portals**: Directly access KRA iTax, eTIMS, NHIF, and NSSF from within the app using embedded webviews.
- **Modern UI**: Clean, responsive, and dark-mode enabled dashboard.

### Setup & Development

1. Navigate to the desktop directory:
   ```bash
   cd desktop
   ```
2. Install dependencies (requires Node.js and build tools for `better-sqlite3`):
   ```bash
   npm install
   ```
3. Run in development mode:
   ```bash
   npm run dev
   ```

### Building & Releasing

To package the application into a `.zip` for Windows:
```bash
npm run build
```
This will output the packaged application to `desktop/release/[version]/`. 
Upload the `.zip` file to your GitHub Releases.

## Web Distribution Platform (`/web`)

A Next.js landing page ready to be deployed to Vercel.

### Setup & Development

1. Navigate to the web directory:
   ```bash
   cd web
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run locally:
   ```bash
   npm run dev
   ```

### Deployment to Vercel

1. Push your code to GitHub.
2. Import the `/web` directory as a new project in Vercel.
3. Once deployed, ensure your GitHub Release URL is properly updated in `web/src/app/api/download/route.ts`.
