# Hotel List Page (CRUD) - React + Redux, Node.js + Express, PostgreSQL

## 1. Database (one time)
Open **SQL Shell (psql)** and run the contents of `backend/schema.sql`
(creates `hotel_db` database and `hotels` table).

## 2. Backend
```
cd backend
npm install
```
Open `backend/.env` and put your PostgreSQL password in `DB_PASSWORD`.
```
node server.js
```
Runs on http://localhost:5000  (test: http://localhost:5000/api/hotels)

## 3. Frontend (new terminal)
```
cd frontend
npm install
npm run dev
```
Open the Local URL shown in the terminal (usually http://localhost:5173).

## API
| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/hotels | create (multipart: image, title, description, latitude, longitude, price) |
| PUT | /api/hotels/:id | update (image optional) |
| DELETE | /api/hotels/:id | delete record + image file |
| GET | /api/hotels?search=&minPrice=&maxPrice=&limit=&offset= | list with filters + pagination |
| GET | /api/hotels/:id | single hotel (detail page) |

## Features
- Reusable HotelForm (Add + Edit), image preview, validation (frontend + backend)
- Card list layout, search by title, price range filter, pagination
- Delete with success popup, detail page with Leaflet map + Geolocation API
- React Helmet dynamic meta tags, alt text on all images, SPA with React Router
- Native SQL (pg, parameterized queries), images stored on Node server (`uploads/`)
