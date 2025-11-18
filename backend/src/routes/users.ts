import express, { Response } from 'express';
import { protect } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';

const router = express.Router();

// Get user profile
router.get('/profile', protect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/profile', protect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        name: req.body.name,
        email: req.body.email,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select('-password');

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Add address
router.post('/address', protect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If this is set as default, unset other defaults
    if (req.body.isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push(req.body);
    await user.save();

    res.json(user.addresses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update address
router.put('/address/:addressId', protect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const address = user.addresses.id(req.params.addressId);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // If setting as default, unset other defaults
    if (req.body.isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    Object.assign(address, req.body);
    await user.save();

    res.json(user.addresses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete address
router.delete('/address/:addressId', protect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.addresses.id(req.params.addressId)?.remove();
    await user.save();

    res.json({ message: 'Address deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

