"use client";

import { useState, useEffect } from "react";
import {
  Eye,
  ShoppingCart,
  TrendingUp,
  Star,
  Check,
  X,
  MessageCircle,
  Users,
  DollarSign,
  LogOut,
  Heart,
  Settings,
  Clock,
  Package,
  Phone,
  Home,
  ShoppingBag,
  MessageSquare,
  Menu,
  Plus,
  Edit,
  Trash2,
  Send,
  Search,
  Filter,
  ChevronDown,
  User,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Link, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Product form state
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    imageUrl: "",
  });

  const stats = [
    {
      title: "Total Views",
      value: "12,459",
      change: "+15.3%",
      icon: Eye,
      bgColor: "bg-emerald-500",
    },
    {
      title: "Total Orders",
      value: "342",
      change: "+22.5%",
      icon: ShoppingCart,
      bgColor: "bg-emerald-500",
    },
    {
      title: "Revenue",
      value: "₦100,000",
      change: "+18.2%",
      icon: TrendingUp,
      bgColor: "bg-emerald-500",
    },
    {
      title: "Rating",
      value: "4.8",
      change: "234 reviews",
      icon: Star,
      bgColor: "bg-emerald-500",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/sign-in');
  };

  const productRequests = [
    {
      id: 1,
      customer: "Sarah Johnson",
      product: "Custom Ankara Dress - Blue/Gold",
      status: "pending",
      time: "2 hours ago",
      budget: "₦10,000-15,000",
    },
    {
      id: 2,
      customer: "Michael Chen",
      product: "Traditional Jewelry Set",
      status: "pending",
      time: "5 hours ago",
      budget: "₦3,000-1,200",
    },
    {
      id: 3,
      customer: "Amara Okafor",
      product: "Matching Ankara Outfit for Family",
      status: "accepted",
      time: "1 day ago",
      budget: "₦3,000-4,000",
    },
    {
      id: 4,
      customer: "David Williams",
      product: "Designer Kaftan - Size XL",
      status: "completed",
      time: "2 days ago",
      budget: "₦2,000",
    },
  ];

  // Analytics data
  const viewsOrdersData = [
    { day: "Mon", views: 1200, orders: 45 },
    { day: "Tue", views: 1900, orders: 72 },
    { day: "Wed", views: 1500, orders: 58 },
    { day: "Thu", views: 2200, orders: 89 },
    { day: "Fri", views: 2800, orders: 112 },
    { day: "Sat", views: 3200, orders: 134 },
    { day: "Sun", views: 2100, orders: 78 },
  ];

  const revenueData = [
    { day: "Mon", revenue: 1850 },
    { day: "Tue", revenue: 2200 },
    { day: "Wed", revenue: 1950 },
    { day: "Thu", revenue: 2800 },
    { day: "Fri", revenue: 3400 },
    { day: "Sat", revenue: 4100 },
    { day: "Sun", revenue: 2650 },
  ];

  const topProducts = [
    {
      rank: 1,
      name: "Custom Ankara Dress Collection",
      views: 2456,
      orders: 89,
      badge: "1",
    },
    {
      rank: 2,
      name: "Traditional Jewelry Set - Gold",
      views: 1834,
      orders: 67,
      badge: "2",
    },
    {
      rank: 3,
      name: "Designer Kaftan Collection",
      views: 1567,
      orders: 45,
      badge: "3",
    },
    {
      rank: 4,
      name: "Matching Family Outfits",
      views: 1298,
      orders: 34,
      badge: "4",
    },
  ];

  const customerInsights = [
    {
      title: "Total Customers",
      value: "1,245",
      icon: Users,
      bgColor: "bg-blue-500",
    },
    {
      title: "Repeat Customers",
      value: "68%",
      icon: Heart,
      bgColor: "bg-purple-500",
    },
    {
      title: "Avg. Order Value",
      value: "₦83.20",
      icon: "currency",
      bgColor: "bg-green-500",
    },
    {
      title: "Customer Satisfaction",
      value: "4.8/5.0",
      icon: Star,
      bgColor: "bg-yellow-500",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCardBorder = (status) => {
    return status === "completed"
      ? "border-2 border-emerald-400"
      : "border border-gray-200";
  };

  const getRankingBadgeColor = (rank) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500 text-white";
      case 2:
        return "bg-gray-400 text-white";
      case 3:
        return "bg-orange-600 text-white";
      default:
        return "bg-gray-300 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 sm:py-6 bg-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="lg:ml-14">
            <h1 className="text-xl sm:text-2xl font-bold text-green-800 mb-1">
              {vendor && (vendor.businessName || vendor.name) ? `${vendor.businessName || vendor.name}` : 'Vendor Dashboard'}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 font-semibold">{vendor && vendor.email ? vendor.email : ''}</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
            <Link to="/Vendorpage1" className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-green-300 text-green-800 font-semibold hover:bg-gray-100 text-center">
              View My Store
            </Link>
          <Link to="/contact" className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2">
            <Phone size={18} />
            <span className="hidden sm:inline">Contact Us</span>
            <span className="sm:hidden">Contact</span>
            </Link>

          <button onClick={handleLogout} className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-red-300 text-red-700 font-semibold hover:bg-red-50 flex items-center justify-center gap-2">
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">Logout</span>
          </button>

          </div>
        </div>
      </div>

      {/* Stats Cards - now show for all tabs */}
      <div className="px-4 sm:px-6 mb-8 pt-6 sm:pt-8 bg-emerald-600 pb-6 sm:pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-emerald-100 text-sm mb-2">
                      {stat.title}
                    </p>
                    <p className="text-white text-3xl font-bold">
                      {stat.value}
                    </p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-emerald-100 text-sm">
                  {stat.title === "Rating" ? stat.change : stat.change}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-10 mb-6 sm:mb-10">
        <div className="bg-gray-50 rounded-t-3xl shadow-lg border border-green-300 min-h-[500px]">
          {/* Tabs */}
          <div className="flex overflow-x-auto border-b border-gray-200 px-4 sm:px-6 pt-4 sm:pt-6 scrollbar-hide">
            <button
              onClick={() => setActiveTab("requests")}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-lg mr-2 mb-2 whitespace-nowrap ${
                activeTab === "requests"
                  ? "text-white bg-emerald-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Product Requests (2)
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-lg mr-2 mb-2 whitespace-nowrap ${
                activeTab === "analytics"
                  ? "text-white bg-emerald-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-lg mb-2 whitespace-nowrap ${
                activeTab === "settings"
                  ? "text-white bg-emerald-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Business Settings
            </button>
          </div>

          {/* Product Requests Tab */}
          {activeTab === "requests" && (
            <div className="p-3 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
                Product Requests & Custom Orders
              </h2>

              <div className="space-y-4">
                {productRequests.map((request) => (
                  <div
                    key={request.id}
                    className={`p-4 sm:p-6 rounded-xl ${getCardBorder(request.status)} bg-white hover:shadow-sm hover:border hover:border-emerald-400 transition-shadow`}
                  >
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {request.customer}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium self-start ${getStatusColor(request.status)}`}
                          >
                            {request.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3 text-sm sm:text-base">
                          {request.product}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4 text-gray-400" /> {request.time}
                          </span>
                          <span className="flex items-center gap-2 text-sm text-gray-500">
                             Budget: {request.budget}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 lg:ml-4 w-full sm:w-auto">
                        {request.status === "pending" && (
                          <>
                            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium w-full sm:w-auto">
                              <Check className="w-4 h-4" />
                              Accept
                            </button>
                            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium w-full sm:w-auto">
                              <X className="w-4 h-4" />
                              Decline
                            </button>
                          </>
                        )}
                        {request.status === "accepted" && (
                          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium w-full sm:w-auto">
                            <MessageCircle className="w-4 h-4" />
                            Message Customer
                          </button>
                        )}
                        {request.status === "completed" && (
                          <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-100 text-green-800 rounded-lg text-sm font-medium w-full sm:w-auto">
                            <Check className="w-4 h-4" />
                            Completed
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {/* Views & Orders Chart */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Views & Orders (Last 7 Days)
                  </h3>
                  <div className="h-48 sm:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={viewsOrdersData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="day" stroke="#666" fontSize={10} />
                        <YAxis stroke="#666" fontSize={10} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e0e0e0",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="views"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ fill: "#10b981", strokeWidth: 2 }}
                          name="Views"
                        />
                        <Line
                          type="monotone"
                          dataKey="orders"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ fill: "#3b82f6", strokeWidth: 2 }}
                          name="Orders"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Performing Products */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Top Performing Products
                  </h3>
                  <div className="space-y-4">
                    {topProducts.map((product) => (
                      <div
                        key={product.rank}
                        className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankingBadgeColor(product.rank)}`}
                        >
                          {product.badge}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {product.name}
                          </h4>
                          <div className="flex gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-2 text-sm text-gray-600"><Eye className="w-4 h-4 text-gray-500" /> {product.views} views</span>
                            <span className="flex items-center gap-2 text-sm text-gray-600"><Package className="w-4 h-4 text-gray-500" /> {product.orders} orders</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Insights */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Customer Insights
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {customerInsights.map((insight, index) => {
                      const IconComponent = insight.icon;
                      return (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className={`p-2 ${insight.bgColor} rounded-lg`}
                            >
                              <IconComponent className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-sm text-gray-600">
                              {insight.title}
                            </p>
                          </div>
                          <p className="text-xl font-bold text-gray-900">
                            {insight.value}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Revenue Overview */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Revenue Overview (Last 7 Days)
                  </h3>
                  <div className="h-48 sm:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="day" stroke="#666" fontSize={10} />
                        <YAxis stroke="#666" fontSize={10} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e0e0e0",
                            borderRadius: "8px",
                          }}
                          formatter={(value) => [`$${value}`, "Revenue"]}
                        />
                        <Bar
                          dataKey="revenue"
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Business Settings Tab */}
          {activeTab === "settings" && (
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Business Information */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Business Information
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Name
                      </label>
                      <input
                        type="text"
                        defaultValue="AfriStyle Boutique"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        defaultValue="hello@afristyle.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        defaultValue="+234 123 456 7890"
                        className="w-full px-4 py-3 border border-emerald-300 bg-emerald-50 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        defaultValue="www.afristyle.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Description
                      </label>
                      <textarea
                        rows={3}
                        defaultValue="Premium African fashion and accessories. Authentic designs, handcrafted quality, and unique cultural expressions."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Location & Hours */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Location & Hours
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address
                      </label>
                      <input
                        type="text"
                        defaultValue="123 Fashion Street"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        defaultValue="Lagos"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        defaultValue="Nigeria"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Hours
                      </label>
                      <textarea
                        rows={3}
                        defaultValue="Mon - Fri: 9am - 6pm&#10;Sat: 10am - 4pm&#10;Sun: Closed"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors resize-none"
                      />
                    </div>
                    <button className="w-full bg-emerald-500 text-white py-3 rounded-lg font-medium hover:bg-emerald-600 transition-colors mt-6">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
