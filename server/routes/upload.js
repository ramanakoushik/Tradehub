const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const auth = require('../middleware/auth');

// Configure Cloudinary if keys exist
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Multer storage (save to disk first)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Images only (jpeg, jpg, png, webp)!'));
  }
});

// POST /api/upload
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ msg: 'No files uploaded' });
    }

    const urls = [];

    for (const file of req.files) {
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'tradehub'
        });
        urls.push(result.secure_url);
        // Delete local temp file
        fs.unlinkSync(file.path);
      } else {
        // Fallback to local exposure
        const protocol = req.protocol;
        const host = req.get('host');
        urls.push(`${protocol}://${host}/uploads/${file.filename}`);
      }
    }

    res.json({ urls });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ msg: 'Server error during upload' });
  }
});

module.exports = router;
