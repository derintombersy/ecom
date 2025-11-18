'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { getMe, getCart } from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function Header() {
  const router = useRouter();
  const { user, setUser, cart, setCart } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await getMe();
          setUser(userData);
          const cartData = await getCart();
          setCart(cartData);
        } catch (error) {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
    };
    loadUser();
  }, [setUser, setCart]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCart(null);
    toast.success('Logged out successfully');
    router.push('/');
  };

  const cartItemCount = cart?.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

  return (
    <header className="bg-amazon-dark text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-amazon-orange">
            Amazon Clone
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4 hidden md:flex">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 px-4 py-2 text-gray-900 rounded-l-md focus:outline-none"
            />
            <button
              type="submit"
              className="bg-amazon-orange px-6 py-2 rounded-r-md hover:bg-orange-600 transition"
            >
              Search
            </button>
          </form>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/dashboard" className="hover:text-amazon-orange transition">
                  {user.name}
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin" className="hover:text-amazon-orange transition">
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="hover:text-amazon-orange transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-amazon-orange transition">
                  Login
                </Link>
                <Link href="/register" className="hover:text-amazon-orange transition">
                  Register
                </Link>
              </>
            )}
            <Link href="/cart" className="relative hover:text-amazon-orange transition">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amazon-orange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

