import express from 'express';
import { protect, admin } from '../middleware/auth';
import { upload } from '../middleware/upload';
import Product from '../models/Product';
import path from 'path';

const router = express.Router();

// Get all products with filters
router.get('/', async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      minRating,
      sortBy,
      page = 1,
      limit = 12,
    } = req.query;

    const query: any = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    const sortOptions: any = {};
    if (sortBy === 'price-low') {
      sortOptions.price = 1;
    } else if (sortBy === 'price-high') {
      sortOptions.price = -1;
    } else if (sortBy === 'rating') {
      sortOptions.rating = -1;
    } else {
      sortOptions.createdAt = -1;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.json({
      products,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'category',
      'name slug'
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create product (admin only)
router.post(
  '/',
  protect,
  admin,
  upload.array('images', 5),
  async (req, res) => {
    try {
      const images = req.files
        ? (req.files as Express.Multer.File[]).map(
            (file) => `/uploads/${file.filename}`
          )
        : [];

      const product = await Product.create({
        ...req.body,
        images,
      });

      res.status(201).json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Update product (admin only)
router.put(
  '/:id',
  protect,
  admin,
  upload.array('images', 5),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      let images = product.images;

      if (req.files && req.files.length > 0) {
        const newImages = (req.files as Express.Multer.File[]).map(
          (file) => `/uploads/${file.filename}`
        );
        images = [...images, ...newImages];
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
          ...req.body,
          images,
        },
        {
          new: true,
          runValidators: true,
        }
      );

      res.json(updatedProduct);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Delete product (admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Serve uploaded images
router.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

export default router;

