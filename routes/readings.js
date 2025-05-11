const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /readings
router.post('/', (req, res) => {
  const { day, night, date } = req.body;
  const userId = req.user.id;

  const query = `INSERT INTO readings (day, night, user_id, date) VALUES (?, ?, ?, ?)`;
  db.run(query, [day, night, userId, date], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.sendStatus(201);
  });
});

// GET /readings
router.get('/', (req, res) => {
  const userId = req.user.id;

  const query = `SELECT * FROM readings WHERE user_id = ? ORDER BY date DESC`; // Order by 'date' instead of 'created_at'
  db.all(query, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const sanitizedRows = rows.map(({ user_id, ...rest }) => rest);

    // Group data by year using the 'date' field
    const groupedData = sanitizedRows.reduce((acc, row) => {
      const year = new Date(row.date).getFullYear(); // Use 'date' field for year
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(row);
      return acc;
    }, {});

    res.json(groupedData);
  });
});

// PATCH /readings/:id
router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const { day, night, date } = req.body;

  const fields = [];
  const values = [];

  if (day) {
    fields.push('day = ?');
    values.push(day);
  }

  if (night) {
    fields.push('night = ?');
    values.push(night);
  }

  if (date) {
    fields.push('date = ?');
    values.push(date);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  values.push(id);

  const sql = `UPDATE readings SET ${fields.join(', ')} WHERE id = ?`;
  db.run(sql, values, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: true, id });
  });
});

// DELETE /readings/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM readings WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: true, id });
  });
});

module.exports = router;
