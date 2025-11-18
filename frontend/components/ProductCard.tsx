import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    rating: number;
    numReviews: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images?.[0] 
    ? (product.images[0].startsWith('http') 
        ? product.images[0] 
        : `http://localhost:5000${product.images[0]}`)
    : '/placeholder-product.jpg';

  return (
    <Link href={`/products/${product._id}`} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
        <div className="relative h-64 bg-gray-200">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
            unoptimized
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
          <div className="flex items-center mb-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <span key={i}>
                  {i < Math.floor(product.rating) ? '★' : '☆'}
                </span>
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-2">
              ({product.numReviews})
            </span>
          </div>
          <p className="text-2xl font-bold text-amazon-orange">
            ₹{product.price.toLocaleString()}
          </p>
        </div>
      </div>
    </Link>
  );
}

