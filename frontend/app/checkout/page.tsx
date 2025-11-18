'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getCart, createOrder, verifyPayment, getUserProfile, addAddress } from '@/lib/api';
import { useStore } from '@/lib/store';
import { toast } from 'react-hot-toast';


export default function CheckoutPage() {
  const router = useRouter();
  const { user, cart, setCart } = useStore();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [cartData, profile] = await Promise.all([getCart(), getUserProfile()]);
      setCart(cartData);
      setUserProfile(profile);
      const defaultAddress = profile.addresses?.find((addr: any) => addr.isDefault);
      setSelectedAddress(defaultAddress || profile.addresses?.[0]);
    } catch (error: any) {
      toast.error('Failed to load checkout data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const addresses = await addAddress(addressForm);
      setUserProfile({ ...userProfile, addresses });
      const newAddress = addresses[addresses.length - 1];
      setSelectedAddress(newAddress);
      setShowAddressForm(false);
      setAddressForm({
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false,
      });
      toast.success('Address added successfully');
    } catch (error: any) {
      toast.error('Failed to add address');
    }
  };

  const handlePayment = async () => {
    if (!selectedAddress) {
      toast.error('Please select or add a shipping address');
      return;
    }

    setProcessing(true);
    try {
      const orderData = await createOrder(selectedAddress);
      const { order, cashfreePaymentSessionId } = orderData;

      if (!cashfreePaymentSessionId) {
        toast.error('Failed to create payment session');
        setProcessing(false);
        return;
      }

      // Redirect to Cashfree checkout
      const cashfreeBaseUrl =
        process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production'
          ? 'https://www.cashfree.com'
          : 'https://sandbox.cashfree.com';

      window.location.href = `${cashfreeBaseUrl}/pg/checkout/${cashfreePaymentSessionId}`;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create order');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div>Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    router.push('/cart');
    return null;
  }

  const subtotal = cart.items.reduce(
    (sum: number, item: any) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = subtotal > 500 ? 0 : 50;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Checkout</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping Address */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Shipping Address</h2>
                  <button
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="text-amazon-orange hover:underline"
                  >
                    {showAddressForm ? 'Cancel' : 'Add New Address'}
                  </button>
                </div>

                {showAddressForm ? (
                  <form onSubmit={handleAddressSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={addressForm.name}
                        onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                        className="p-3 border rounded"
                        required
                      />
                      <input
                        type="tel"
                        placeholder="Phone"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        className="p-3 border rounded"
                        required
                      />
                    </div>
                    <textarea
                      placeholder="Address"
                      value={addressForm.address}
                      onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                      className="w-full p-3 border rounded"
                      rows={3}
                      required
                    />
                    <div className="grid grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="City"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="p-3 border rounded"
                        required
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        className="p-3 border rounded"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Pincode"
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                        className="p-3 border rounded"
                        required
                      />
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={addressForm.isDefault}
                        onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                      />
                      Set as default address
                    </label>
                    <button
                      type="submit"
                      className="bg-amazon-orange text-white px-6 py-2 rounded hover:bg-orange-600"
                    >
                      Save Address
                    </button>
                  </form>
                ) : (
                  <div className="space-y-2">
                    {userProfile?.addresses?.map((addr: any) => (
                      <div
                        key={addr._id}
                        onClick={() => setSelectedAddress(addr)}
                        className={`p-4 border-2 rounded cursor-pointer ${
                          selectedAddress?._id === addr._id
                            ? 'border-amazon-orange bg-orange-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <p className="font-semibold">{addr.name}</p>
                        <p className="text-gray-600">{addr.address}</p>
                        <p className="text-gray-600">
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-gray-600">Phone: {addr.phone}</p>
                      </div>
                    ))}
                    {(!userProfile?.addresses || userProfile.addresses.length === 0) && (
                      <p className="text-gray-600">No addresses found. Please add one.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (GST):</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-xl">
                    <span>Total:</span>
                    <span className="text-amazon-orange">₹{total.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={handlePayment}
                  disabled={processing || !selectedAddress}
                  className="w-full bg-amazon-orange text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Pay with Cashfree'}
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
  );
}

