import express from 'express';
import { protect, admin } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';
import axios from 'axios';

const router = express.Router();

const CASHFREE_BASE_URL =
  process.env.CASHFREE_ENV === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

const getCashfreeHeaders = () => ({
  'x-client-id': process.env.CASHFREE_APP_ID || '',
  'x-client-secret': process.env.CASHFREE_SECRET_KEY || '',
  'x-api-version': '2022-09-01',
  'Content-Type': 'application/json',
});

// Create order
router.post('/', protect, async (req: AuthRequest, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user?._id }).populate(
      'items.product'
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate prices
    const itemsPrice = cart.items.reduce(
      (total, item: any) => total + item.product.price * item.quantity,
      0
    );
    const shippingPrice = itemsPrice > 500 ? 0 : 50;
    const taxPrice = itemsPrice * 0.18; // 18% GST
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    // Create order items
    const orderItems = cart.items.map((item: any) => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      image: item.product.images[0] || '',
    }));

    // Create order
    const order = await Order.create({
      user: req.user?._id,
      orderItems,
      shippingAddress: req.body.shippingAddress,
      paymentMethod: 'cashfree',
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    });

    if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
      return res
        .status(500)
        .json({ message: 'Cashfree credentials are not configured' });
    }

    const customerDetails = {
      customer_id: req.user?._id.toString(),
      customer_email: req.user?.email || 'customer@example.com',
      customer_phone: req.body.shippingAddress?.phone || '9999999999',
      customer_name: req.body.shippingAddress?.name || req.user?.name || 'Customer',
    };

    const returnUrl = `${req.protocol}://${req.get('host')}/orders/${order._id}`;

    const cashfreeResponse = await axios.post(
      `${CASHFREE_BASE_URL}/orders`,
      {
        order_id: order._id.toString(),
        order_amount: Number(totalPrice.toFixed(2)),
        order_currency: 'INR',
        order_note: 'Amazon Clone Order',
        customer_details: customerDetails,
        order_meta: {
          return_url: returnUrl,
          notify_url: `${req.protocol}://${req.get('host')}/api/orders/${order._id}/webhook`,
        },
      },
      {
        headers: getCashfreeHeaders(),
      }
    );

    const { order_id, order_token, payment_session_id } = cashfreeResponse.data;

    // Update order with Cashfree order info
    order.paymentResult = {
      provider: 'cashfree',
      orderId: order_id,
      token: order_token,
    };
    await order.save();

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      order,
      cashfreeOrderId: order_id,
      cashfreeOrderToken: order_token,
      cashfreePaymentSessionId: payment_session_id,
      amount: totalPrice,
      currency: 'INR',
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.response?.data?.message || error.message || 'Cashfree order creation failed',
    });
  }
});

// Verify payment
router.post('/:id/verify-payment', protect, async (req: AuthRequest, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!order.paymentResult?.orderId) {
      return res.status(400).json({ message: 'Cashfree order is missing' });
    }

    if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
      return res
        .status(500)
        .json({ message: 'Cashfree credentials are not configured' });
    }

    const paymentsResponse = await axios.get(
      `${CASHFREE_BASE_URL}/orders/${order.paymentResult.orderId}/payments`,
      {
        headers: getCashfreeHeaders(),
      }
    );

    const payments =
      paymentsResponse.data?.payments ||
      paymentsResponse.data?.data ||
      paymentsResponse.data ||
      [];

    const successfulPayment = Array.isArray(payments)
      ? payments.find(
          (payment: any) =>
            payment.payment_status === 'SUCCESS' || payment.payment_status === 'COMPLETED'
        )
      : null;

    if (!successfulPayment) {
      return res
        .status(400)
        .json({ message: 'Payment not successful yet. Please try again.' });
    }

    const cashfreeOrderId = order.paymentResult.orderId;

    // Update order
    order.isPaid = true;
    order.paidAt = new Date(successfulPayment.payment_time || Date.now());
    order.paymentResult = {
      provider: 'cashfree',
      orderId: cashfreeOrderId,
      paymentId: successfulPayment.cf_payment_id || successfulPayment.payment_id,
      signature: successfulPayment.payment_signature,
    };

    // Update product stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    await order.save();

    res.json({ message: 'Payment verified', order });
  } catch (error: any) {
    res.status(500).json({
      message: error.response?.data?.message || error.message || 'Failed to verify payment',
    });
  }
});

// Get user orders
router.get('/myorders', protect, async (req: AuthRequest, res) => {
  try {
    const orders = await Order.find({ user: req.user?._id })
      .populate('orderItems.product')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get single order
router.get('/:id', protect, async (req: AuthRequest, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'orderItems.product'
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (
      order.user.toString() !== req.user?._id.toString() &&
      req.user?.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders (admin only)
router.get('/', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('orderItems.product')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update order to delivered (admin only)
router.put('/:id/deliver', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.isDelivered = true;
    order.deliveredAt = new Date();
    await order.save();

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

