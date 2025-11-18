import express from 'express';
import { protect } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';
import Cart from '../models/Cart';
import Product from '../models/Product';

const router = express.Router();

// Get user's cart
router.get('/', protect, async (req: AuthRequest, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user?._id }).populate(
      'items.product'
    );

    if (!cart) {
      cart = await Cart.create({ user: req.user?._id, items: [] });
    }

    res.json(cart);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Add item to cart
router.post('/items', protect, async (req: AuthRequest, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ message: 'Product ID and quantity required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    let cart = await Cart.findOne({ user: req.user?._id });

    if (!cart) {
      cart = await Cart.create({ user: req.user?._id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      if (existingItem.quantity > product.stock) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    await cart.populate('items.product');

    res.json(cart);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update cart item quantity
router.put('/items/:itemId', protect, async (req: AuthRequest, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Valid quantity required' });
    }

    const cart = await Cart.findOne({ user: req.user?._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    const product = await Product.findById(item.product);
    if (!product || product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product');

    res.json(cart);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Remove item from cart
router.delete('/items/:itemId', protect, async (req: AuthRequest, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user?._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items.id(req.params.itemId)?.remove();
    await cart.save();
    await cart.populate('items.product');

    res.json(cart);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Clear cart
router.delete('/', protect, async (req: AuthRequest, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user?._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    res.json({ message: 'Cart cleared' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

