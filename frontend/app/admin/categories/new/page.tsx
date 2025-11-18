'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useStore } from '@/lib/store';
import { toast } from 'react-hot-toast';

export default function NewCategoryPage() {
  const router = useRouter();
  const { user } = useStore();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const api = (await import('@/lib/api')).default;
      await api.post('/categories', formData);
      toast.success('Category created successfully!');
      router.push('/admin');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || user.role !== 'admin') {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Add New Category</h1>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div>
            <label className="block mb-2 font-semibold">Category Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-2 font-semibold">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 border rounded"
              rows={3}
            />
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="bg-amazon-orange text-white px-6 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Category'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}

