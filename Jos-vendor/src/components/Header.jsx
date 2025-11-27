import React, { useState, useEffect } from "react";
import { ShoppingCart, User, LogOut, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import logo from "../assets/vendor.png";

export default function Header() {
  const navigate = useNavigate();
  const { items } = useCart();
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Load user from localStorage on component mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowProfileMenu(false);
    navigate('/sign-up');
  };

  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden">
              <img src={logo} alt="JOS Vendor's Hub" className="w-full h-full object-cover" />
            </div>
            <span className="text-emerald-800 text-lg font-semibold hidden sm:inline">
              JOS Vendor's Hub
            </span>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center gap-4">
            {/* Products */}
            <Link 
              to="/product" 
              className="hidden md:flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition"
            >
              <span className="text-sm">Products</span>
            </Link>

            {/* Vendors */}
            <Link 
              to="/vendors" 
              className="hidden md:flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition"
            >
              <span className="text-sm">Vendors</span>
            </Link>

            {/* Contact Us */}
            <Link 
              to="/contact" 
              className="hidden md:flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition"
            >
              <Mail size={16} />
              <span className="text-sm">Contact Us</span>
            </Link>

          

            {/* User Authentication */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  <User size={16} />
                  <span className="text-sm hidden sm:inline">
                    {user.fullName || user.name || 'Profile'}
                  </span>
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-800">
                        {user.fullName || user.name}
                      </p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/Vendordashboard"
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/order"
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        My Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 text-sm"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/sign-up"
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
              >
                <User size={16} />
                <span className="text-sm">Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}