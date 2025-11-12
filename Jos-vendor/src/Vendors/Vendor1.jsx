import React, { useState } from "react";
import { Link } from "react-router-dom";
import Vendor1 from "../assets/vendor1.jpeg";
import Vendor1img from "../assets/Vendor1img.jpeg";
import Vendor1img1 from "../assets/Vendor1img1.jpeg";
import Vendor1img2 from "../assets/Vendor1img2.jpeg";
import Vendor1img3 from "../assets/Vendor1img3.jpeg";
import {
  Heart,
  Share2,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  ShoppingCart,
} from "lucide-react";

const Vendorpage1 = () => {
  const [activeTab, setActiveTab] = useState("about");

  // sample reviews to display in the Reviews tab
  const reviews = [
    { id: 1, name: 'Amina S.', date: '2025-10-12', rating: 5, text: 'Beautiful fabrics and excellent stitching. My dress arrived quickly and fits perfectly.' , avatar: Vendor1img},
    { id: 2, name: 'Chidi E.', date: '2025-09-30', rating: 5, text: 'Great customer service — they answered my questions and helped with measurements.' , avatar: Vendor1img1},
    { id: 3, name: 'Fatima K.', date: '2025-08-20', rating: 4, text: 'Lovely designs; one item had a small delay but the quality made up for it.' , avatar: Vendor1img2},
    { id: 4, name: 'John M.', date: '2025-07-04', rating: 5, text: 'Amazing! I bought matching outfits for the family and everyone loved them.' , avatar: Vendor1img3},
    { id: 5, name: 'Ngozi O.', date: '2025-06-18', rating: 4, text: 'Good value for the price. Packaging was careful and professional.' , avatar: Vendor1img},
  ];

  return (
    <div className="min-h-screen bg-[#F7FFF9] w-full">
      {/* ================= HEADER SECTION =============== */}
  <div className="pt-6 px-4 md:px-8 flex items-center justify-between">
        <Link to="/vendor-profile" className="px-4 py-2 rounded-lg border border-green-300 text-green-900 font-medium hover:bg-gray-100 text-sm">
          Back to Browse
        </Link>

        <Link to="/checkout" className="border bg-emerald-700 border-green-300 text-white font-semibold px-4 py-2 rounded-lg flex gap-2 items-center hover:bg-emerald-600 text-sm">
         <ShoppingCart size={16} /> Cart (0)
        </Link>
      </div>

      {/* Vendor Banner */}
      <div className="w-full bg-emerald-700 mt-4 relative">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start px-4 md:px-10 py-6">
          {/* Vendor Image */}
          <img
            src={Vendor1}
            alt="Vendor"
            className="h-28 w-28 rounded-full object-cover border-4 border-white shadow-lg"
          />

          <div className="text-white flex-1">
            <span className="bg-white text-gray-700 px-3 py-1 rounded-full text-xs">
              Verified Vendor
            </span>

            <h2 className="text-2xl font-semibold mt-2">
              AfrikStyle Storefront
            </h2>

            <p className="opacity-90 mt-1 text-sm max-w-xl">
              Premium African fashion and accessories. Authentic designs,
              handcrafted quality, and cultural expressions for the modern
              African wardrobe.
            </p>

            {/* Rating */}
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className="flex items-center gap-1">
                <Star size={16}/> 4.8 Rating
              </span>
              <span>234 Reviews</span>
              <span>1,245 Products</span>
            </div>
          </div>

          {/* Icons Right side (moved below on mobile) */}
          <div className="mt-4 md:mt-0 md:absolute md:right-10 md:top-6 flex gap-4">
            <Heart className="cursor-pointer text-white" size={20} />
            <Share2 className="cursor-pointer text-white" size={20} />
          </div>
        </div>
      </div>

      {/* ================= PAGE BODY ================= */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 md:px-10 mt-10">

        {/* LEFT SIDEBAR: CONTACT */}
  <div className="lg:col-span-1 space-y-6">
          {/* Contact Info */}
          <div className="bg-white shadow-sm border-green-300 rounded-xl p-6 border">
            <h3 className="font-semibold text-xl md:text-2xl mb-4">Contact Information</h3>

            <div className="space-y-3 text-sm md:text-base text-gray-700">
              <p className="flex items-center gap-2"><MapPin size={18} className="text-green-700" /> paulins International,<br/> Rukuba Road, Jos North</p>
              <p className="flex items-center text-green-700 gap-2"><Phone size={18} /> +234 123 456 7890</p>
              <p className="flex items-center text-green-700 gap-2"><Mail size={18} /> hello@afristyle.com</p>
              <p className="flex items-center text-green-700 gap-2"><Globe size={18} /> www.afristyle.com</p>
              <p className="flex items-start gap-2"><Clock text-green-700 size={18} /> Mon-Fri 9am – 6pm <br /> Sat: 10am – 4pm <br /> Sun: Closed</p>
            </div>

            <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2 mt-4">
              Contact Vendor
            </button>
          </div>

          {/* Location Google Map */}
          <div className="bg-white shadow-sm rounded-xl p-4 mb-12 md:mb-20 border-green-300 border">
            <h3 className="font-medium text-base mb-2">Location</h3>
           <iframe
            className="w-full h-64 border border-green-300 rounded-xl shadow-md"
            src="https://www.google.com/maps?q=Paulins+International,+Rukuba+Road,+Jos+North&output=embed"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
            <button className="w-full bg-white border border-green-300 hover:bg-gray-50 tex-emerald-500 rounded-lg py-2 mt-4">
              Get Directions
            </button>
          </div>
        </div>

        {/* RIGHT CONTENT: TABS + DETAILS */}
  <div className="lg:col-span-2 col-span-1">

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            {["products", "about", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm border-green-300 border ${
                  activeTab === tab
                    ? "bg-emerald-700 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* ABOUT TAB */}
          {activeTab === "about" && (
            <div className="bg-white border border-green-300 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold mb-3 text-xl">
                About AfriStyle Boutique
              </h3>
              <p className="text-gray-600 text-base leading-relaxed">
                AfriStyle Boutique was founded in 2018 with a mission to celebrate African culture through contemporary fashion. We specialize in handcrafted Ankara designs, traditional accessories, and modern interpretations of classic African attire.
                <br /><br />
                Every piece tells a story and supports local artisans.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 text-center mt-6 gap-4">
                <div>
                  <h4 className="font-bold text-xl text-emerald-700">5+</h4>
                  <p className="text-base">Years in Business</p>
                </div>
                <div>
                  <h4 className="font-bold text-xl  text-emerald-700">10K+</h4>
                  <p className="text-base">Happy Customers</p>
                </div>
                <div>
                  <h4 className="font-bold text-xl text-emerald-700">98%</h4>
                  <p className="text-base">Satisfaction Rate</p>
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === "products" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-4 bg-white rounded-lg shadow border border-green-200 hover:shadow-xl hover:border-green-300">
                <img src={Vendor1img} alt="product" className="rounded-lg w-full h-64 sm:h-80 object-cover" />
                <p className="font-medium mt-4 text-emerald-800 text-lg">Premium Ankara Dress</p>
                <p className="text-sm text-gray-600 mt-1">Hand-sewn, breathable fabric perfect for events.</p>
                <div className="flex justify-between mt-2 text-base items-center">
                  <span className="text-yellow-500">4.9 ★</span>
                  <span className="font-semibold">₦10,000</span>
                </div>
                <button className="bg-emerald-700 text-white mt-3 px-5 py-1.5 text-sm rounded-lg flex items-center gap-2">
                  <ShoppingCart size={16} />
                  Add
                </button>
              </div>

              <div className="p-4 bg-white rounded-lg shadow border border-green-200 hover:shadow-xl hover:border-green-300">
                <img src={Vendor1img1} alt="product" className="rounded-lg w-full h-64 sm:h-80 object-cover" />
                <p className="font-medium mt-4">Handcrafted Jewelry Set</p>
                <p className="text-sm text-gray-600 mt-1">Made with recycled brass and semi-precious stones.</p>
                <div className="flex justify-between mt-2 text-base items-center">
                  <span className="text-yellow-500">4.8 ★</span>
                  <span className="font-semibold">₦2,000</span>
                </div>
                <button className="bg-emerald-700 text-white mt-3 px-5 py-1.5 text-sm rounded-lg flex items-center gap-2">
                  <ShoppingCart size={16} />
                  Add
                </button>
              </div>

              {/* additional products */}
              <div className="p-4 bg-white rounded-lg shadow border border-green-200 hover:shadow-xl hover:border-green-300">
                <img src={Vendor1img2} alt="product" className="rounded-lg w-full h-64 sm:h-72 object-cover" />
                <p className="font-medium mt-4">Classic Wrapper Skirt</p>
                <p className="text-sm text-gray-600 mt-1">Versatile cotton wrapper suitable for daily wear and special occasions.</p>
                <div className="flex justify-between mt-2 text-base items-center">
                  <span className="text-yellow-500">4.7 ★</span>
                  <span className="font-semibold">₦5,000</span>
                </div>
                <button className="bg-emerald-700 text-white mt-3 px-5 py-1.5 text-sm rounded-lg flex items-center gap-2">
                  <ShoppingCart size={16} />
                  Add
                </button>
              </div>

              <div className="p-4 bg-white rounded-lg shadow border border-green-200 hover:shadow-xl hover:border-green-300">
                <img src={Vendor1img3} alt="product" className="rounded-lg w-full h-64 sm:h-72 object-cover" />
                <p className="font-medium mt-4">Beaded Clutch Bag</p>
                <p className="text-sm text-gray-600 mt-1">Hand-beaded evening clutch with zipper and detachable strap.</p>
                <div className="flex justify-between mt-2 text-base items-center">
                  <span className="text-yellow-500">4.8 ★</span>
                  <span className="font-semibold">₦6,000</span>
                </div>
                <button className="bg-emerald-700 text-white mt-3 px-5 py-1.5 text-sm rounded-lg flex items-center gap-2">
                  <ShoppingCart size={16} />
                  Add
                </button>
              </div>
            </div>
          )}

          {/* REVIEWS TAB */}
          {activeTab === "reviews" && (
            <div className="bg-white border border-green-300 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold mb-4 text-lg">Customer Reviews</h3>
              <div className="space-y-4">
                {reviews.slice(0, 4).map((r) => (
                  <div key={r.id} className="flex gap-4">
                    <img src={r.avatar} alt={r.name} className="w-12 h-12 rounded-full object-cover" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">{r.name}</span>
                          <span className="text-xs text-gray-500">{r.date}</span>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-400">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} size={14} className="text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{r.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Vendorpage1;
