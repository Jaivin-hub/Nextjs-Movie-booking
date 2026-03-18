# Movie Seat Booking — Project walkthrough (file by file)

This document explains the project **from the starting point**, in the order the app and requests flow.

---

## 1. Entry: `package.json`

**Role:** Defines the app and how to run it.

- **Scripts:** `npm run dev` runs `next dev` (development server). `build` / `start` for production.
- **Dependencies:** Next.js 16, React 19, **TanStack React Query** (fetch/cache), Tailwind CSS, etc.
- When you run `npm run dev`, Next.js starts and uses the `app/` directory for routing and pages.

**Takeaway:** The app is a **Next.js App Router** project. Routing and pages live under `app/`.

---

## 2. Config: `next.config.js`

**Role:** Next.js configuration.

- **`images.remotePatterns`:** Allows the `<Image>` component to load images from `picsum.photos` (movie posters). Without this, external image URLs are blocked for security.

**Takeaway:** Any external image domain used with `next/image` must be listed here.

---

## 3. Root layout: `app/layout.js`

**Role:** The **root layout** wraps every page. It runs first and wraps all routes.

- Imports **fonts** (Geist) and **global CSS** (`./globals.css`).
- **`metadata`:** Sets default `<title>` and `<description>` for the whole app (“Movie Seat Booking”).
- **`<Provider>`:** Wraps the app with React Query so every page can use `useQuery` / `useMutation`.
- **`children`:** The current page (e.g. home or dashboard) is rendered here.

**Flow:**  
Request → Root layout (html, body, Provider) → `children` (the page for that URL).

**Takeaway:** Layout = shared shell. Pages are the `children` that change per URL.

---

## 4. Global styles: `app/globals.css`

**Role:** App-wide styles and Tailwind.

- `@import "tailwindcss"` enables Tailwind.
- `:root` and `@theme` set CSS variables (background, foreground, fonts).
- Dark mode is handled via `prefers-color-scheme: dark`.

**Takeaway:** One global CSS file; Tailwind and variables are defined here.

---

## 5. Client wrapper: `app/provider.jsx`

**Role:** Provides **React Query** to the whole app (used by dashboard and movie page).

- **`"use client"`:** This component runs on the client (browser), so hooks like `QueryClientProvider` work.
- **`QueryClientProvider`:** All `useQuery` / `useMutation` calls need this wrapper.
- **`ReactQueryDevtools`:** Optional dev panel to inspect queries/cache.

**Takeaway:** Data fetching (movies, seats, book) is done with React Query; the provider must wrap the app.

---

## 6. Home page: `app/page.js`

**Role:** The **landing page** at `/`.

- Default **route:** In the App Router, `app/page.js` is the page for the **root URL** `/`.
- Renders a title, short description, and a **Link** to `/dashboard` (“Browse movies”).
- No `"use client"` → this is a **Server Component** (can be rendered on the server). It only uses `Link` and static content.

**URL:** `/` → this file.

**Takeaway:** `app/page.js` = home; links send the user to `/dashboard`.

---

## 6b. Dashboard layout: `app/dashboard/layout.js`

**Role:** Layout for **all routes under `/dashboard`** (e.g. `/dashboard`, `/dashboard/movie/inception`).

- Wraps `children` in a simple div. Every dashboard page (list and movie booking) is rendered as `children`.
- **`app/dashboard/layout.js`** wraps both `app/dashboard/page.js` and `app/dashboard/movie/[slug]/page.js`.

**Takeaway:** Layouts wrap their segment; dashboard layout wraps everything under `/dashboard`.

---

## 7. Dashboard page (movie list): `app/dashboard/page.js`

**Role:** Page at **`/dashboard`** — lists all movies in a grid and links to each movie by **slug**.

- **`"use client"`:** Uses hooks (`useQuery`, client-side fetch).
- **Data:** Fetches movies with `useQuery` from **`/api/movies`** (see API section below).
- **UI:** Header, “Now Showing”, then a **grid of movie cards**. Each card is a **Link** to:
  - **`/dashboard/movie/${movie.slug}`** (e.g. `/dashboard/movie/inception`).
- **Images:** Poster from `movie.poster` via Next.js `<Image>` (allowed by `next.config`).

**URL:** `/dashboard` → this file.

**Takeaway:** Dashboard fetches JSON from the API and uses **slug** in links so the URL is readable (e.g. `/dashboard/movie/the-dark-knight`).

---

## 8. Movie booking page (dynamic route): `app/dashboard/movie/[slug]/page.js`

**Role:** Page for **one movie** and its seat map. URL comes from the **dynamic segment** `[slug]`.

- **Route:** Folder name **`[slug]`** = dynamic segment. So:
  - `/dashboard/movie/inception` → `params.slug === "inception"`
  - `/dashboard/movie/the-dark-knight` → `params.slug === "the-dark-knight"`
- **`useParams()`:** Returns `{ slug }` from the URL.
- **Two API calls:**
  1. **Movie by slug:** `GET /api/movies/by-slug/${slug}` → gets the movie (including `id`) for this slug.
  2. **Seats by id:** `GET /api/movies/${movieId}/seats` → gets seat list and which are booked. Uses **id** because bookings are stored by movie id.
- **State:** `selectedSeats` = array of seat ids the user has selected (e.g. `["A1", "A2"]`).
- **Booking:** “Book” sends **POST** `/api/movies/${movieId}/seats` with `{ seats: selectedSeats }`. On success, React Query invalidates the seats query and selection is cleared.

**URL:** `/dashboard/movie/<slug>` → this file; **`params.slug`** = the slug from the URL.

**Takeaway:** **Slug in the URL** (for humans/SEO); **id in the API** for seats and bookings. Dynamic route `[slug]` is how Next.js passes the slug into the page.

---

## 9. API routes (server-side)

All under **`app/api/`**. Each **`route.js`** file exports **GET** and/or **POST** (and other HTTP methods). Next.js turns these into HTTP endpoints.

---

### 9a. `app/api/movies/route.js`

**Endpoint:** **GET** `/api/movies`

**Role:** Return **all movies** (for the dashboard grid).

- Reads **`data/movies.json`** from disk (`process.cwd()` = project root).
- Returns the JSON array as the response body.
- No params; no body.

**Used by:** Dashboard page (`fetch("/api/movies")`).

---

### 9b. `app/api/movies/[id]/route.js`

**Endpoint:** **GET** `/api/movies/:id` (e.g. `/api/movies/1`)

**Role:** Return **one movie by id**. (Used if you ever need movie by id; the booking page uses slug instead.)

- **Dynamic segment:** `[id]` in the path → **`params.id`** in the handler (e.g. `"1"`).
- Reads `data/movies.json`, finds `movies.find((m) => m.id === id)`, returns that movie or 404.

**Takeaway:** Same pattern as slug: folder `[id]` → **`params.id`** available in the route handler.

---

### 9c. `app/api/movies/by-slug/[slug]/route.js`

**Endpoint:** **GET** `/api/movies/by-slug/:slug` (e.g. `/api/movies/by-slug/the-dark-knight`)

**Role:** Return **one movie by URL slug** (for the booking page).

- **Dynamic segment:** `[slug]` → **`params.slug`** (e.g. `"the-dark-knight"`).
- Reads `data/movies.json`, finds `movies.find((m) => m.slug === slug)`, returns that movie (with `id`, `slug`, `title`, etc.) or 404.

**Used by:** Movie booking page: `fetch(\`/api/movies/by-slug/${slug}\`)`.

**Takeaway:** Slug is for **URLs**; the API resolves slug → full movie (including **id** for seat APIs).

---

### 9d. `app/api/movies/[id]/seats/route.js`

**Endpoint:**  
- **GET** `/api/movies/:id/seats` — list seats and which are booked.  
- **POST** `/api/movies/:id/seats` — book seats (body: `{ seats: ["A1", "A2"] }`).

**Role:** Seat availability and booking, keyed by **movie id** (not slug).

- **GET:**
  - Reads **`data/bookings.json`** (shape: `{ "1": ["A1","B2"], "2": [] }`).
  - For `params.id`, gets `bookedSeats = bookings[id] || []`.
  - Uses **`lib/seats.js`** to get all seat ids (A1–F8), then returns `{ seats: [{ id, booked }], bookedSeats }`.
- **POST:**
  - Body: `{ seats: ["A1", "A2"] }`.
  - Loads current bookings, checks seats are valid and not already booked, appends to `bookings[id]`, writes **`data/bookings.json`** back to disk.
  - Returns success and booked seat list.

**Used by:** Movie booking page: GET for seat map, POST on “Book” with `movieId` from the movie fetched by slug.

**Takeaway:** Bookings are stored **by movie id** in a JSON file; no real database. Slug is only for the URL; id is used in the API and in `bookings.json`.

---

## 10. Shared logic: `lib/seats.js`

**Role:** Single source of truth for **seat layout** (rows A–F, cols 1–8).

- **`getAllSeatIds()`** → `["A1", "A2", ..., "F8"]`.
- **`getRows()`** / **`getCols()`** — used if you need row/column lists elsewhere.

**Used by:** **`app/api/movies/[id]/seats/route.js`** to know all valid seat ids and to build the list returned by GET.

**Takeaway:** Keep layout (rows/cols) in one place so the API and UI stay in sync (UI could import this too; currently the page has its own ROWS/COLS for rendering).

---

## 11. Data files (no database)

### `data/movies.json`

**Role:** List of movies (our “movies table” in a file).

- Each object: **`id`**, **`slug`**, **`title`**, **`poster`**, **`description`**.
- **id** = used in APIs and in `bookings.json`.
- **slug** = used in URLs and in **GET /api/movies/by-slug/[slug]**.

**Used by:** All movie API routes (they read this file).

---

### `data/bookings.json`

**Role:** Persisted bookings (our “bookings store” in a file).

- Shape: `{ "<movieId>": ["A1", "B2", ...], ... }`.
- **GET** seats: read this file, return which seats are in the array for that movie id.
- **POST** seats: read file, append new seats to that movie’s array, write file back.

**Used by:** **`app/api/movies/[id]/seats/route.js`** only.

**Takeaway:** “Local database without a database” = read/write JSON files on the server. Works well for teaching; in production you’d use a real DB.

---

## Flow summary (request path)

1. User opens **`/`** → **`app/layout.js`** wraps **`app/page.js`** (home).
2. User clicks “Browse movies” → goes to **`/dashboard`** → **`app/dashboard/layout.js`** wraps **`app/dashboard/page.js`**.
3. Dashboard runs **GET /api/movies** → **`app/api/movies/route.js`** reads **`data/movies.json`** → returns list → dashboard shows grid and links like **`/dashboard/movie/inception`**.
4. User clicks a movie → **`/dashboard/movie/inception`** → **`app/dashboard/movie/[slug]/page.js`** with **`params.slug = "inception"`**.
5. Page calls **GET /api/movies/by-slug/inception** → **`app/api/movies/by-slug/[slug]/route.js`** reads **`data/movies.json`**, finds slug **"inception"** → returns movie (with **id**).
6. Page then calls **GET /api/movies/1/seats** → **`app/api/movies/[id]/seats/route.js`** reads **`data/bookings.json`** and **`lib/seats.js`** → returns seats and booked list.
7. User selects seats and clicks “Book” → **POST /api/movies/1/seats** with **`{ seats: ["A1","A2"] }`** → same route writes to **`data/bookings.json`** and returns success.

---

## File tree (relevant parts)

```
nextclass/
├── package.json
├── next.config.js
├── jsconfig.json        (path alias @/* for JavaScript)
├── data/
│   ├── movies.json
│   └── bookings.json
├── lib/
│   └── seats.js
└── app/
    ├── layout.js           (root layout)
    ├── globals.css
    ├── provider.jsx        (React Query)
    ├── page.js             (home: /)
    ├── dashboard/
    │   ├── layout.js       (layout for /dashboard/*)
    │   ├── page.js         (movie list: /dashboard)
    │   └── movie/
    │       └── [slug]/
    │           └── page.js (booking: /dashboard/movie/:slug)
    └── api/
        └── movies/
            ├── route.js              GET /api/movies
            ├── [id]/
            │   ├── route.js          GET /api/movies/:id
            │   └── seats/
            │       └── route.js      GET/POST /api/movies/:id/seats
            └── by-slug/
                └── [slug]/
                    └── route.js      GET /api/movies/by-slug/:slug
```

You can use this walkthrough to explain the project to your students from the starting file (`package.json` / `next.config`) through layout, pages, API routes, and data files.
