const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer — memory storage with strict limits
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // SECURITY: Reduced to 5MB max
  fileFilter: (req, file, cb) => {
    // SECURITY: Whitelist specific image MIME types (not just startsWith)
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'), false);
    }
  },
});

// SECURITY: Whitelist of allowed upload folders
const ALLOWED_FOLDERS = ['dropout', 'dropout_avatars', 'dropout_drops'];

// POST /api/upload — SECURITY: Requires auth
router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // SECURITY: Validate folder name against whitelist
    let folder = 'dropout';
    if (typeof req.body?.folder === 'string' && ALLOWED_FOLDERS.includes(req.body.folder.trim())) {
      folder = req.body.folder.trim();
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { width: 1080, height: 1080, crop: 'limit', quality: 'auto', format: 'webp' },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// DELETE /api/upload — SECURITY: Requires auth + brand role
// publicId sent as query param to handle slashes in Cloudinary IDs
router.delete('/', requireAuth, async (req, res) => {
  try {
    // SECURITY: Only brand accounts can delete images
    if (req.user.role !== 'brand') {
      return res.status(403).json({ error: 'Only brand accounts can delete images' });
    }

    const publicId = req.query.publicId;
    if (!publicId || typeof publicId !== 'string') {
      return res.status(400).json({ error: 'publicId query parameter is required' });
    }

    // SECURITY: Validate the publicId is within allowed folders
    const isAllowedFolder = ALLOWED_FOLDERS.some(f => publicId.startsWith(f + '/'));
    if (!isAllowedFolder) {
      return res.status(403).json({ error: 'Cannot delete images outside allowed folders' });
    }

    await cloudinary.uploader.destroy(publicId);
    res.json({ deleted: true });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

module.exports = router;
