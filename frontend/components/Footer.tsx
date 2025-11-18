import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-amazon-light text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-4">Get to Know Us</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-amazon-orange">About Us</Link></li>
              <li><Link href="#" className="hover:text-amazon-orange">Careers</Link></li>
              <li><Link href="#" className="hover:text-amazon-orange">Press Releases</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Connect with Us</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-amazon-orange">Facebook</Link></li>
              <li><Link href="#" className="hover:text-amazon-orange">Twitter</Link></li>
              <li><Link href="#" className="hover:text-amazon-orange">Instagram</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Make Money with Us</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-amazon-orange">Sell on Amazon</Link></li>
              <li><Link href="#" className="hover:text-amazon-orange">Become an Affiliate</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Let Us Help You</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-amazon-orange">Your Account</Link></li>
              <li><Link href="#" className="hover:text-amazon-orange">Returns Centre</Link></li>
              <li><Link href="#" className="hover:text-amazon-orange">Customer Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-600 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2024 Amazon Clone. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

