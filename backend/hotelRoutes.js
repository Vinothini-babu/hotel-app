const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('./db');

const router = express.Router();

// ---------- Image upload setup ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// ---------- Helpers ----------
function validate(body) {
  const errors = [];
  const { title, description, latitude, longitude, price } = body;
  if (!title || !title.trim()) errors.push('Title is required');
  if (!description || !description.trim()) errors.push('Description is required');
  if (latitude === undefined || latitude === '' || isNaN(latitude) || latitude < -90 || latitude > 90)
    errors.push('Latitude must be between -90 and 90');
  if (longitude === undefined || longitude === '' || isNaN(longitude) || longitude < -180 || longitude > 180)
    errors.push('Longitude must be between -180 and 180');
  if (price === undefined || price === '' || isNaN(price) || Number(price) < 0)
    errors.push('Price must be a valid positive number');
  return errors;
}

function deleteFile(filePath) {
  if (filePath) fs.unlink(path.join(__dirname, filePath), () => {});
}

// ---------- GET all (search + price filter + sort + pagination) ----------
// Allowed sort options (whitelist, so user input is never put into the SQL text)
const SORTS = {
  newest: 'id DESC',
  oldest: 'id ASC',
  price_asc: 'price ASC, id DESC',
  price_desc: 'price DESC, id DESC',
  title: 'title ASC, id DESC',
};

router.get('/', async (req, res) => {
  try {
    const { search = '', minPrice, maxPrice, sort = 'newest' } = req.query;
    // keep limit / offset sane: limit 1..50, offset >= 0
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 6, 1), 50);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);
    const orderBy = SORTS[sort] || SORTS.newest;

    const params = [`%${search.trim()}%`];
    let where = 'WHERE title ILIKE $1';
    if (minPrice !== undefined && minPrice !== '' && !isNaN(minPrice)) {
      params.push(minPrice);
      where += ` AND price >= $${params.length}`;
    }
    if (maxPrice !== undefined && maxPrice !== '' && !isNaN(maxPrice)) {
      params.push(maxPrice);
      where += ` AND price <= $${params.length}`;
    }

    const countResult = await pool.query(`SELECT COUNT(*) FROM hotels ${where}`, params);

    params.push(limit, offset);
    const result = await pool.query(
      `SELECT * FROM hotels ${where} ORDER BY ${orderBy}
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({ total: parseInt(countResult.rows[0].count), hotels: result.rows });
  } catch (err) {
    res.status(500).json({ errors: [err.message] });
  }
});

// ---------- GET one (for detail page) ----------
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hotels WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ errors: ['Hotel not found'] });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ errors: [err.message] });
  }
});

// ---------- POST (create) ----------
router.post('/', upload.single('image'), async (req, res) => {
  const errors = validate(req.body);
  if (!req.file) errors.push('Image is required');
  if (errors.length) {
    if (req.file) deleteFile('uploads/' + req.file.filename);
    return res.status(400).json({ errors });
  }
  try {
    const { title, description, latitude, longitude, price } = req.body;
    const imagePath = 'uploads/' + req.file.filename;
    const result = await pool.query(
      `INSERT INTO hotels (title, description, latitude, longitude, price, image_path)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title.trim(), description.trim(), latitude, longitude, price, imagePath]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    deleteFile('uploads/' + req.file.filename);
    res.status(500).json({ errors: [err.message] });
  }
});

// ---------- PUT (update) ----------
router.put('/:id', upload.single('image'), async (req, res) => {
  const errors = validate(req.body);
  if (errors.length) {
    if (req.file) deleteFile('uploads/' + req.file.filename);
    return res.status(400).json({ errors });
  }
  try {
    const existing = await pool.query('SELECT * FROM hotels WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) {
      if (req.file) deleteFile('uploads/' + req.file.filename);
      return res.status(404).json({ errors: ['Hotel not found'] });
    }
    const { title, description, latitude, longitude, price } = req.body;
    let imagePath = existing.rows[0].image_path;
    if (req.file) {
      deleteFile(imagePath); // remove old image
      imagePath = 'uploads/' + req.file.filename;
    }
    const result = await pool.query(
      `UPDATE hotels SET title=$1, description=$2, latitude=$3, longitude=$4, price=$5, image_path=$6
       WHERE id=$7 RETURNING *`,
      [title.trim(), description.trim(), latitude, longitude, price, imagePath, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ errors: [err.message] });
  }
});

// ---------- DELETE ----------
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM hotels WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ errors: ['Hotel not found'] });
    deleteFile(result.rows[0].image_path);
    res.json({ message: 'Hotel deleted successfully' });
  } catch (err) {
    res.status(500).json({ errors: [err.message] });
  }
});

module.exports = router;