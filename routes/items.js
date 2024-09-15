const express = require('express');
const Item = require('../models/Item');
const auth = require('../middleware/auth');

const router = express.Router();

// Create a new item
router.post('/', auth, async (req, res) => {
  try {
    const { name, quantity, description } = req.body;
    const item = new Item({
      name,
      quantity,
      description,
      user: req.user.userId,
    });
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error, info: 'Error creating item' });
  }
});

// Get all items for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const items = await Item.find({ user: req.user.userId });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error, info: 'Error fetching items' });
  }
});

// Get a specific item
router.get('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error, info: 'Error fetching item' });
  }
});

// Update an item
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, quantity, description } = req.body;
    const item = await Item.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { name, quantity, description },
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error, info: 'Error updating item' });
  }
});

// Delete an item
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error, info: 'Error deleting item' });
  }
});

module.exports = router;
