const express = require('express');
const router = express.Router();
const { userQueries } = require('../db/queries');

router.get('/', async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(500).json({ error: 'No ID provided' });
  }

  try {
    const user = await userQueries.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { id } = req.body;

  try {
    await userQueries.create(id);
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
