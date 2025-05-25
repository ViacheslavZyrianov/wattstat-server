const express = require('express');
const router = express.Router();
const { readingQueries } = require('../db/queries');
const authenticateToken = require('../middleware/auth');

// POST /readings
router.post('/', authenticateToken, async (req, res) => {
  const { day, night, date } = req.body;
  const userId = req.user.id;

  try {
    await readingQueries.create(day, night, userId, date);
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /readings
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const rows = await readingQueries.findByUserId(userId);
    const sanitizedRows = rows.map(({ user_id, ...rest }) => rest);

    // Group data by year using the 'date' field
    const groupedData = sanitizedRows.reduce((acc, row) => {
      const year = new Date(row.date).getFullYear();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(row);
      return acc;
    }, {});

    res.json(groupedData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /readings/:id
router.patch('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { day, night, date } = req.body;

  try {
    await readingQueries.update(id, { day, night, date });
    res.json({ updated: true, id });
  } catch (err) {
    console.error(err);
    if (err.message === 'Nothing to update') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE /readings/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await readingQueries.delete(id);
    res.json({ deleted: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
