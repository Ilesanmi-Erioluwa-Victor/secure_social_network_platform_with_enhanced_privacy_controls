const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const seedDatabase = require('../../seed');

router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    await seedDatabase();
    res.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Seed endpoint error:', error);
    res.status(500).json({ message: error.message || 'Seed failed' });
  }
});

module.exports = router;
