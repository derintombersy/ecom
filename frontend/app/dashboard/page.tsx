'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getMyOrders, getUserProfile, updateUserProfile, deleteAddress } from '@/lib/api';
import { useStore } from '@/lib/store';
import { toast } from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
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
      const [ordersData, profileData] = await Promise.all([
        getMyOrders(),
        getUserProfile(),
      ]);
      setOrders(ordersData);
      setProfile(profileData);
      setProfileForm({
        name: profileData.name || '',
        email: profileData.email || '',
      });
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await updateUserProfile(profileForm);
      setProfile(updated);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error('Failed to update profile');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await deleteAddress(addressId);
      const updated = await getUserProfile();
      setProfile(updated);
      toast.success('Address deleted');
    } catch (error: any) {
      toast.error('Failed to delete address');
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        {/* Tabs */}
        <div className="border-b mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-2 px-4 ${
                activeTab === 'orders'
                  ? 'border-b-2 border-amazon-orange text-amazon-orange'
                  : 'text-gray-600'
              }`}
            >
              My Orders
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-2 px-4 ${
                activeTab === 'profile'
                  ? 'border-b-2 border-amazon-orange text-amazon-orange'
                  : 'text-gray-600'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`pb-2 px-4 ${
                activeTab === 'addresses'
                  ? 'border-b-2 border-amazon-orange text-amazon-orange'
                  : 'text-gray-600'
              }`}
            >
              Addresses
            </button>
          </div>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <p className="text-gray-600 mb-4">No orders yet</p>
                <Link
                  href="/products"
                  className="text-amazon-orange hover:underline"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Link
                    key={order._id}
                    href={`/orders/${order._id}`}
                    className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-lg">Order #{order._id.slice(-8)}</p>
                        <p className="text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-gray-600">
                          {order.orderItems.length} item(s)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl text-amazon-orange">
                          ₹{order.totalPrice.toFixed(2)}
                        </p>
                        <p
                          className={`font-semibold ${
                            order.isPaid ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {order.isPaid ? 'Paid' : 'Pending'}
                        </p>
                        <p
                          className={`font-semibold ${
                            order.isDelivered ? 'text-green-600' : 'text-yellow-600'
                          }`}
                        >
                          {order.isDelivered ? 'Delivered' : 'Processing'}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Profile Information</h2>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block mb-2 font-semibold">Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full p-3 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full p-3 border rounded"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-amazon-orange text-white px-6 py-2 rounded hover:bg-orange-600"
              >
                Update Profile
              </button>
            </form>
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Saved Addresses</h2>
              <Link
                href="/checkout"
                className="text-amazon-orange hover:underline"
              >
                Add New Address
              </Link>
            </div>
            {profile?.addresses?.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <p className="text-gray-600 mb-4">No addresses saved</p>
                <Link
                  href="/checkout"
                  className="text-amazon-orange hover:underline"
                >
                  Add Address
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile?.addresses?.map((addr: any) => (
                  <div key={addr._id} className="bg-white p-4 rounded-lg shadow-md">
                    {addr.isDefault && (
                      <span className="bg-amazon-orange text-white text-xs px-2 py-1 rounded mb-2 inline-block">
                        Default
                      </span>
                    )}
                    <p className="font-semibold">{addr.name}</p>
                    <p className="text-gray-600">{addr.address}</p>
                    <p className="text-gray-600">
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="text-gray-600">Phone: {addr.phone}</p>
                    <button
                      onClick={() => handleDeleteAddress(addr._id)}
                      className="mt-2 text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

