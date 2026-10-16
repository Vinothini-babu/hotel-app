-- Run this in psql:  psql -U postgres -f schema.sql
-- (or paste it into SQL Shell)

CREATE DATABASE hotel_db;
\c hotel_db

CREATE TABLE IF NOT EXISTS hotels (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  latitude DECIMAL(9,6) NOT NULL,
  longitude DECIMAL(9,6) NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  image_path VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);
