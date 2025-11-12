import React from "react";
import { ShoppingBag, ArrowRight, Store, Sparkles, ShoppingCart, Mail, Shirt, Gem, Headphones, Home, Smartphone, Coffee, Heart, Dumbbell, BookOpen, Gamepad2, Grid3X3, Search } from "lucide-react";
import logo from "../assets/vendor.png";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { db } from "../firebase";
import { collection, query, onSnapshot, limit, orderBy } from "firebase/firestore";
import Video from "../assets/Video.mp4";
import Header from "../components/Header";

export default function LandingPage() {
  const { addToCart, items } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // All available categories - predefined list with icons
  const allCategories = [
    { name: "All Categories", icon: Grid3X3 },
    { name: "Clothing", icon: Shirt },
    { name: "Jewelry", icon: Gem }, 
    { name: "Accessories", icon: Headphones },
    { name: "Home Decor", icon: Home },
    { name: "Electronics", icon: Smartphone },
    { name: "Food & Beverages", icon: Coffee },
    { name: "Beauty & Health", icon: Heart },
    { name: "Sports & Fitness", icon: Dumbbell },
    { name: "Books & Media", icon: BookOpen },
    { name: "Toys & Games", icon: Gamepad2 },
    { name: "Other", icon: Store }
  ];

  // Get categories from products (for filtering)
  const productCategories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  
  // Use predefined categories for display
  const categories = allCategories;

  // Fetch products from Firestore
  useEffect(() => {
    const q = query(
      collection(db, "products"), 
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsList = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        productsList.push({ 
          id: doc.id, 
          ...data,
          // Convert price to display format
          price: `₦${data.price?.toLocaleString() || '0'}`,
          // Use imageUrl from Firestore (base64 or URL)
          image: data.imageUrl || '/placeholder-image.jpg',
          // Default rating if not available
          rating: data.rating || 4.5,
          reviews: data.reviews || Math.floor(Math.random() * 100) + 10,
          // Add badge for new products (created within last 7 days)
          badge: data.createdAt && data.createdAt.toDate && 
                 (new Date() - data.createdAt.toDate()) < 7 * 24 * 60 * 60 * 1000 
                 ? "New" : null
        });
      });
      setProducts(productsList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  return (
    <div className="w-full font-sans">
      {/* Header */}
      <Header />

      {/* Hero Section */}
    <section className="h-[580px] flex flex-col items-center justify-center text-white px-6 text-center relative overflow-hidden">

  {/* BACKGROUND VIDEO */}
  <video
    autoPlay
    loop
    muted
    playsInline
    className="absolute top-0 left-0 w-full h-full object-cover"
    src={Video}
  ></video>

  {/* Dark overlay to improve text visibility */}
  <div className="absolute top-0 left-0 w-full h-full bg-black/40"></div>

  {/* Hero Content */}
  <h1 className="text-5xl font-semibold mb-4 relative z-10">
   Join easily, discover trusted <span className="text-emerald-900">VENDORS</span> instantly.
  </h1>

  <p className="max-w-2xl text-xl text-gray-200 mb-8 relative z-10">
    Your one-stop marketplace connecting vendors and customers. Shop with
    confidence and grow your business with ease.
  </p>

  <div className="flex flex-wrap justify-center gap-4 relative z-10">
    <Link
      to="/Product"
      className="flex items-center border-2 border-emerald-900 gap-2 bg-white text-[#016e52] px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
    >
      <Sparkles size={18} />
      Start Shopping
    </Link>

    <Link
      to="/sign-up"
      className="flex items-center gap-2 border-2 border-emerald-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition"
    >
      Sign In
    </Link>
  </div>
</section>


      {/* Shop section - categories sidebar + product grid */}
      <section className="py-12 bg-gray-50 px-4 md:px-10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Shop popular products</h2>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="max-w-md mx-auto lg:mx-0">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <span className="text-gray-400 hover:text-gray-600 text-lg">×</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Categories sidebar */}
            <aside className="w-full lg:w-64 bg-white border border-gray-100 rounded-lg p-4">
              <h4 className="font-semibold mb-4 text-gray-900 flex items-center gap-2">
                <Store size={18} />
                Categories
              </h4>
              <div className="space-y-1">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isSelected = selectedCategory === category.name;
                  // Count products for each category
                  const productCount = category.name === 'All Categories' 
                    ? products.length 
                    : products.filter(p => p.category === category.name).length;
                  
                  return (
                    <button
                      key={category.name}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-3 group ${
                        isSelected 
                          ? 'bg-emerald-600 text-white shadow-md' 
                          : 'hover:bg-gray-50 text-gray-700 hover:text-emerald-600'
                      }`}
                    >
                      <Icon 
                        size={16} 
                        className={`${
                          isSelected 
                            ? 'text-white' 
                            : 'text-gray-400 group-hover:text-emerald-500'
                        }`} 
                      />
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-sm font-medium">{category.name}</span>
                        {productCount > 0 && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            isSelected 
                              ? 'bg-white/20 text-white' 
                              : 'bg-gray-100 text-gray-500 group-hover:bg-emerald-50 group-hover:text-emerald-600'
                          }`}>
                            {productCount}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Product grid */}
            <div className="flex-1">
              {/* Category header */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {searchQuery ? `Search results for "${searchQuery}"` : selectedCategory}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {(() => {
                      const filteredProducts = products
                        .filter(p => {
                          const matchesCategory = selectedCategory === 'All Categories' || p.category === selectedCategory;
                          const matchesSearch = !searchQuery || 
                            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.vendorName?.toLowerCase().includes(searchQuery.toLowerCase());
                          return matchesCategory && matchesSearch;
                        });
                      return `${filteredProducts.length} products`;
                    })()}
                  </span>
                </div>
                {!searchQuery && selectedCategory !== 'All Categories' && (
                  <p className="text-sm text-gray-600 mt-1">
                    Browse our collection of {selectedCategory.toLowerCase()} products
                  </p>
                )}
                {searchQuery && (
                  <p className="text-sm text-gray-600 mt-1">
                    Showing results across all categories
                  </p>
                )}
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                  <span className="ml-2 text-gray-600">Loading products...</span>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-4">No products available yet</div>
                  <Link to="/sign-up" className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition">
                    Become a Vendor
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products
                    .filter(p => {
                      const matchesCategory = selectedCategory === 'All Categories' || p.category === selectedCategory;
                      const matchesSearch = !searchQuery || 
                        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.vendorName?.toLowerCase().includes(searchQuery.toLowerCase());
                      return matchesCategory && matchesSearch;
                    })
                    .slice(0, 9)
                    .map((product) => (
                      <div key={product.id} className="bg-white border border-green-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
                        <div className="relative h-48">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = '/placeholder-image.jpg';
                            }}
                          />
                          {product.badge && (
                            <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs px-2 py-1 rounded-md">
                              {product.badge}
                            </span>
                          )}
                          {product.stock === 0 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium">
                                Out of Stock
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-4 space-y-2">
                          <h3 className="text-emerald-800 font-medium line-clamp-2">{product.name}</h3>
                          {product.vendorName && (
                            <p className="text-xs text-gray-500">by {product.vendorName}</p>
                          )}
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="text-yellow-400">★</span>
                            <span>{product.rating}</span>
                            <span className="text-gray-400">({product.reviews})</span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex flex-col">
                              <span className="text-emerald-700 font-semibold">{product.price}</span>
                              {product.stock && (
                                <span className="text-xs text-gray-500">Stock: {product.stock}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                             
                              <Link 
                                to={`/product/${product.id}`} 
                                className="text-sm px-2 py-1 border border-emerald-600 text-emerald-600 rounded hover:bg-emerald-50 transition"
                              >
                                View
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 bg-gray-50 text-gray-900 px-4 md:px-16 text-center">
        <h2 className="text-2xl font-semibold mb-3">
          Why Choose JOS Vendor's Hub?
        </h2>
        <p className="text-gray-600 mb-12">
          Join thousands of happy customers and vendors in our thriving
          marketplace
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Customer */}
          <div className="border-2 border-green-200 hover:border-2 hover:border-green-300 rounded-xl p-8 shadow-md hover:shadow-lg text-left transition">
            <div className="w-12 h-12  bg-green-100 text-green-700  rounded-lg mb-4 ">
              <img src={logo} alt=""  />
            </div>
            <h3 className="text-lg font-semibold mb-2">Find a vendor</h3>
            <p className="text-gray-600 mb-6">
              Browse thousands of premium products from verified vendors
            </p>
            <Link to="/create-account" className="bg-green-50 w-full border border-green-200 text-green-700 px-6 py-2 rounded-md font-medium hover:bg-green-100 transition">
              Sign Up as Customer
            </Link>
          </div>

          {/* Vendor */}
          <div className="border-2 border-green-200 hover:border-2 hover:border-green-300 text-left rounded-xl p-8 shadow-md hover:shadow-lg transition">
            <div className="w-12 h-12 bg-green-100 text-green-700 flex items-center justify-center rounded-lg mb-4 ">
              <img src={logo} alt="" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Become a Vendor</h3>
            <p className="text-gray-600 mb-6">
              Grow your business and reach millions of potential customers
            </p>
            <Link to="/create-account" className="bg-green-50  border border-green-200 text-green-700 px-6 py-2 rounded-md font-medium hover:bg-green-100 transition">
              Sign Up as Vendor
            </Link>
          </div>

        
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#016e52] text-white text-center py-16 px-6">
        <h3 className="text-lg font-semibold mb-4">Ready to Get Started?</h3>
        <p className="text-gray-200 mb-8">
          Join our community today and experience the future of online shopping
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link to="/product" className="bg-white text-[#016e52] px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition">
            More Products
          </Link>
          <Link to="/vendors" className="border border-gray-300 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition">
            Browse Vendors
          </Link>
        </div>
      </section>
    </div>
  );
}
