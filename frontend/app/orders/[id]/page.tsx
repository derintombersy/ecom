'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getOrder, verifyPayment } from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [params.id]);

  const loadOrder = async () => {
    try {
      const data = await getOrder(params.id as string);
      setOrder(data);

      // If order is not paid and we're coming from Cashfree redirect, verify payment
      if (!data.isPaid && typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('order_id') || urlParams.has('payment_session_id')) {
          try {
            await verifyPayment(params.id as string, {});
            // Reload order to get updated status
            const updatedData = await getOrder(params.id as string);
            setOrder(updatedData);
            toast.success('Payment verified successfully!');
          } catch (error: any) {
            // Payment might not be complete yet, that's okay
            console.log('Payment verification:', error);
          }
        }
      }
    } catch (error: any) {
      toast.error('Failed to load order');
      router.push('/dashboard');
    } finally {
      setLoading(false);
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

  if (!order) {
    return null;
  }

  const imageUrl = (img: string) =>
    img?.startsWith('http') ? img : `http://localhost:5000${img}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/dashboard" className="text-amazon-orange hover:underline">
            ← Back to Orders
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-6">Order Details</h1>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-gray-600">Order ID</p>
              <p className="font-semibold">{order._id}</p>
            </div>
            <div>
              <p className="text-gray-600">Order Date</p>
              <p className="font-semibold">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Payment Status</p>
              <p className={`font-semibold ${order.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                {order.isPaid ? 'Paid' : 'Pending'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Delivery Status</p>
              <p className={`font-semibold ${order.isDelivered ? 'text-green-600' : 'text-yellow-600'}`}>
                {order.isDelivered ? 'Delivered' : 'Processing'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.orderItems.map((item: any) => (
                <div key={item._id} className="bg-white p-4 rounded-lg shadow-md flex gap-4">
                  <div className="relative w-24 h-24 bg-gray-200 rounded">
                    <Image
                      src={imageUrl(item.image)}
                      alt={item.name}
                      fill
                      className="object-cover rounded"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-amazon-orange font-bold">
                      ₹{item.price.toLocaleString()} each
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
              <div className="text-gray-700">
                <p className="font-semibold">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                  {order.shippingAddress.pincode}
                </p>
                <p>Phone: {order.shippingAddress.phone}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span>₹{order.itemsPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{order.shippingPrice === 0 ? 'Free' : `₹${order.shippingPrice}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>₹{order.taxPrice.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-xl">
                  <span>Total:</span>
                  <span className="text-amazon-orange">₹{order.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

