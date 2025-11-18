'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReviewsSection from '@/components/ReviewsSection';
import { getProduct, addToCart } from '@/lib/api';
import { useStore } from '@/lib/store';
import { toast } from 'react-hot-toast';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, setCart } = useStore();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    loadProduct();
  }, [params.id]);

  const loadProduct = async () => {
    try {
      const data = await getProduct(params.id as string);
      setProduct(data);
    } catch (error: any) {
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      router.push('/login');
      return;
    }

    try {
      const cart = await addToCart(product._id, quantity);
      setCart(cart);
      toast.success('Added to cart!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
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

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div>Product not found</div>
        </main>
        <Footer />
      </div>
    );
  }

  const imageUrl = (img: string) =>
    img?.startsWith('http') ? img : `http://localhost:5000${img}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div>
            <div className="relative h-96 bg-gray-200 rounded-lg mb-4">
              <Image
                src={imageUrl(product.images[selectedImage] || product.images[0])}
                alt={product.name}
                fill
                className="object-cover rounded-lg"
                unoptimized
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative h-20 rounded border-2 ${
                      selectedImage === idx ? 'border-amazon-orange' : 'border-gray-300'
                    }`}
                  >
                    <Image
                      src={imageUrl(img)}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      className="object-cover rounded"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400 text-xl">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>{i < Math.floor(product.rating) ? '★' : '☆'}</span>
                ))}
              </div>
              <span className="ml-2 text-gray-600">
                {product.rating.toFixed(1)} ({product.numReviews} reviews)
              </span>
            </div>
            <p className="text-4xl font-bold text-amazon-orange mb-6">
              ₹{product.price.toLocaleString()}
            </p>
            <p className="text-gray-700 mb-6">{product.description}</p>

            {product.stock > 0 ? (
              <div className="mb-6">
                <label className="block mb-2 font-semibold">Quantity:</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 bg-gray-200 rounded"
                  >
                    -
                  </button>
                  <span className="text-xl">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-2 bg-gray-200 rounded"
                  >
                    +
                  </button>
                  <span className="text-gray-600">({product.stock} available)</span>
                </div>
              </div>
            ) : (
              <p className="text-red-600 font-semibold mb-6">Out of Stock</p>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-amazon-orange text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Cart
              </button>
              <button
                onClick={() => {
                  if (!user) {
                    toast.error('Please login first');
                    router.push('/login');
                    return;
                  }
                  router.push('/checkout');
                }}
                disabled={product.stock === 0}
                className="flex-1 bg-yellow-400 text-black py-3 rounded-lg font-semibold hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewsSection productId={product._id} />
      </main>
      <Footer />
    </div>
  );
}

