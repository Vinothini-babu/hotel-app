const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const hotelRoutes = require('./hotelRoutes');

const app = express();
app.use(cors());
app.use(express.json());

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/hotels', hotelRoutes);

// error handler (multer errors, etc.)
app.use((err, req, res, next) => {
  res.status(400).json({ errors: [err.message] });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
