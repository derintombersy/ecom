'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getProducts, getCategories } from '@/lib/api';
import { useStore } from '@/lib/store';
import { toast } from 'react-hot-toast';

export default function AdminPage() {
  const router = useRouter();
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'categories'>('products');
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'admin') {
      toast.error('Access denied. Admin only.');
      router.push('/');
      return;
    }
    loadData();
  }, [user, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'products') {
        const data = await getProducts({ limit: 100 });
        setProducts(data.products || []);
      } else if (activeTab === 'categories') {
        const data = await getCategories();
        setCategories(data);
      }
    } catch (error: any) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const api = (await import('@/lib/api')).default;
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      loadData();
    } catch (error: any) {
      toast.error('Failed to delete product');
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
        <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

        {/* Tabs */}
        <div className="border-b mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('products')}
              className={`pb-2 px-4 ${
                activeTab === 'products'
                  ? 'border-b-2 border-amazon-orange text-amazon-orange'
                  : 'text-gray-600'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`pb-2 px-4 ${
                activeTab === 'categories'
                  ? 'border-b-2 border-amazon-orange text-amazon-orange'
                  : 'text-gray-600'
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-2 px-4 ${
                activeTab === 'orders'
                  ? 'border-b-2 border-amazon-orange text-amazon-orange'
                  : 'text-gray-600'
              }`}
            >
              Orders
            </button>
          </div>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Products</h2>
              <Link
                href="/admin/products/new"
                className="bg-amazon-orange text-white px-4 py-2 rounded hover:bg-orange-600"
              >
                Add New Product
              </Link>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-4 text-left">Name</th>
                    <th className="p-4 text-left">Price</th>
                    <th className="p-4 text-left">Stock</th>
                    <th className="p-4 text-left">Category</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id} className="border-t">
                      <td className="p-4">{product.name}</td>
                      <td className="p-4">₹{product.price}</td>
                      <td className="p-4">{product.stock}</td>
                      <td className="p-4">{product.category?.name || 'N/A'}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/products/${product._id}/edit`}
                            className="text-blue-600 hover:underline"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Categories</h2>
              <Link
                href="/admin/categories/new"
                className="bg-amazon-orange text-white px-4 py-2 rounded hover:bg-orange-600"
              >
                Add New Category
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div key={category._id} className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                  {category.description && (
                    <p className="text-gray-600 text-sm mt-2">{category.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <AdminOrders />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const api = (await import('@/lib/api')).default;
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error: any) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleDeliver = async (orderId: string) => {
    try {
      const api = (await import('@/lib/api')).default;
      await api.put(`/orders/${orderId}/deliver`);
      toast.success('Order marked as delivered');
      loadOrders();
    } catch (error: any) {
      toast.error('Failed to update order');
    }
  };

  if (loading) {
    return <div>Loading orders...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">All Orders</h2>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-semibold">Order #{order._id.slice(-8)}</p>
                <p className="text-gray-600">
                  {order.user?.name} ({order.user?.email})
                </p>
                <p className="text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl text-amazon-orange">
                  ₹{order.totalPrice.toFixed(2)}
                </p>
                <p className={order.isPaid ? 'text-green-600' : 'text-red-600'}>
                  {order.isPaid ? 'Paid' : 'Pending'}
                </p>
                <p className={order.isDelivered ? 'text-green-600' : 'text-yellow-600'}>
                  {order.isDelivered ? 'Delivered' : 'Processing'}
                </p>
              </div>
            </div>
            <div className="mb-4">
              <p className="font-semibold mb-2">Items:</p>
              <ul className="list-disc list-inside">
                {order.orderItems.map((item: any) => (
                  <li key={item._id}>
                    {item.name} x {item.quantity}
                  </li>
                ))}
              </ul>
            </div>
            {!order.isDelivered && (
              <button
                onClick={() => handleDeliver(order._id)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Mark as Delivered
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

