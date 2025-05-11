const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const { id } = req.query;

  if (id) {
    db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'User not found' });
      res.json(row);
    });
  } else return res.status(500).json({ error: 'No ID provided' });
});

router.post('/', (req, res) => {
  const { id } = req.body;
  db.run('INSERT INTO users (id) VALUES (?)', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.sendStatus(201);
  });
});

module.exports = router;
