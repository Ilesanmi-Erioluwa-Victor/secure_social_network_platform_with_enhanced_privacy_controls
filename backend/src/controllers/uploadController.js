const cloudinary = require('../config/cloudinary');

const uploadFile = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'uploads', resource_type: 'auto' },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ message: 'Upload failed' });
        }
        res.json({ url: result.secure_url, fileName: result.public_id });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error during upload' });
  }
};

module.exports = { uploadFile };
