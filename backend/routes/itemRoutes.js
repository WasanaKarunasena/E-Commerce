const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const upload = require('../utils/multerConfig.js');
const cloudinary = require('../utils/cloudinary.js');

// ✅ Get latest 8 items
router.get('/newcollection', async (req, res) => {
  try {
    const items = await Item.find().sort({ _id: -1 }).limit(8);
    res.status(200).send(items);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// ✅ Get all items
router.get('/', async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).send(items);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// ✅ Search by name or category
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).send({ error: 'Search query is required' });
    }

    const regex = new RegExp(query, 'i');
    const items = await Item.find({
      $or: [{ name: regex }, { category: regex }]
    });

    res.status(200).send(items);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// ✅ Get item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).send({ error: 'Item not found' });
    res.status(200).send(item);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// ✅ Create new item with Cloudinary upload
router.post('/', upload.array('images', 4), async (req, res) => {
  try {
    const {
      name,
      new_price,
      old_price,
      category,
      stock,
      specifications,
      packageIncludes,
      description,
      reviews
    } = req.body;

    if (!name || !new_price || !old_price || !category || !req.files || req.files.length < 1 || stock === undefined) {
      return res.status(400).send({ error: 'Missing required fields or images' });
    }

    const existingItem = await Item.findOne({ name });
    if (existingItem) {
      return res.status(400).send({ error: 'Item with this name already exists' });
    }

    const uploadedImages = await Promise.all(
      req.files.map(file => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream({ folder: 'items' }, (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }).end(file.buffer);
        });
      })
    );

    const item = new Item({
      name,
      new_price,
      old_price,
      category,
      stock: Number(stock),
      image: uploadedImages,
      specifications,
      packageIncludes,
      description,
      reviews: reviews || []
    });

    await item.save();
    res.status(201).send(item);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// ✅ Update item by ID with Cloudinary image replacement
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const {
      name,
      new_price,
      old_price,
      category,
      stock,
      specifications,
      packageIncludes,
      description,
      reviews
    } = req.body;

    const existingItem = await Item.findById(req.params.id);
    if (!existingItem) return res.status(404).send({ error: 'Item not found' });

    let imageUrl = existingItem.image;
    let imagePublicId = existingItem.imagePublicId;

    if (req.file) {
      if (existingItem.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(existingItem.imagePublicId);
        } catch (err) {
          console.error('Error deleting previous image from Cloudinary:', err);
        }
      }

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'items' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        ).end(req.file.buffer);
      });

      imageUrl = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      {
        name,
        new_price,
        old_price,
        category,
        stock: Number(stock),
        image: imageUrl,
        imagePublicId,
        specifications,
        packageIncludes,
        description,
        reviews
      },
      { new: true }
    );

    res.status(200).send(updatedItem);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// ✅ Delete item by ID and remove image from Cloudinary
router.delete('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).send({ error: 'Item not found' });

    if (item.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(item.imagePublicId);
      } catch (err) {
        console.error('Error deleting image from Cloudinary:', err);
      }
    }

    await Item.findByIdAndDelete(req.params.id);
    res.status(200).send({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// ✅ Get latest 4 items for a given category
router.get('/related/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const items = await Item.find({ category }).sort({ _id: -1 }).limit(4);
    res.status(200).send(items);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// ✅ POST /items/prices - Calculate total price
router.post('/prices', async (req, res) => {
  try {
    const { items } = req.body;
    let total = 0;

    for (const item of items) {
      const dbItem = await Item.findById(item.itemId);
      if (dbItem) {
        total += dbItem.new_price * item.quantity;
      }
    }

    res.send({ total });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;
