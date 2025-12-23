# TerraRecipes (Frontend)

A responsive recipe web app focused on fast browsing, powerful search, and clean UI.  
This repo contains the **frontend** (React + Vite) that powers the TerraRecipes user experience.

## Features

- Recipe browsing (core + featured categories)
- Advanced search + filtering
- Recipe detail pages with clean, readable layout
- Grocery list generation UI (from recipe ingredients)
- Authentication UI (sign up / sign in / email verification flows)
- Mobile-friendly layout and accessible UI patterns

## Tech Stack

- React + Vite
- TypeScript (or “JS → TS migration in progress” if applicable)
- React Router (data routers / loaders, etc.)
- Styling: Tailwind CSS (and/or CSS Modules)
- API communication: fetch / Axios (whichever you use)
- Deployment: (Netlify / Vercel / Render Static Site — update to match)

## Getting Started

1) Install dependencies
npm install

2) Configure environment variables
Create a .env file in the project root:

# Base URL for the TerraRecipes backend API
VITE_API_BASE_URL="http://localhost:5000"

If your backend uses cookies/sessions or specific CORS settings, keep the frontend + backend origins aligned.

3) Run locally
npm run dev

Then open the local URL Vite prints (usually http://localhost:5173).

## Scripts
npm run dev — Start the dev server

npm run build — Build for production

## Project Structure (High Level)
src/
    components/       Reusable UI components (Buttons, Chips, Modals, etc.)
    pages/            Route-level pages (Home, Browse, Recipe, Auth, etc.)
    routes/           Router configuration + loaders
    api/              API client utilities (base client, endpoints, helpers)
    services/         Caching and redirects
    assets/           Global css styling
    utils/            Helpers (formatting, parsing helpers, etc.)

## Notes on Design
TerraRecipes is built as a real product-style project:

UI components are designed to be reusable and consistent.

Routing is structured to support growth (new browse modes, filters, and features).

API interactions are centralized for maintainability.