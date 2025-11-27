import { useState, useEffect } from "react";
import { Package, ShoppingCart, Clock, DollarSign, Plus, MessageSquare, TrendingUp, Users, CheckCircle, AlertCircle, Home } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VendorSidebar from "../components/VendorSidebar";

export default function VendorOverview() {
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setVendor(parsedUser);

      if (parsedUser.uid) {
        loadProducts(parsedUser.uid);
        loadOrders(parsedUser.uid);
      }
    } else {
      navigate('/sign-in');
    }
  }, [navigate]);

  const loadProducts = async (vendorId) => {
    try {
      const q = query(collection(db, "products"), where("vendorId", "==", vendorId));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const productsList = [];
        snapshot.forEach((doc) => {
          productsList.push({ id: doc.id, ...doc.data() });
        });
        setProducts(productsList);
      });
      return unsubscribe;
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const loadOrders = async (vendorId) => {
    try {
      const q = query(collection(db, "orders"), where("vendor.id", "==", vendorId));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const ordersList = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          ordersList.push({ 
            id: doc.id, 
            ...data,
            displayDate: data.createdAt ? data.createdAt.toDate().toLocaleDateString() : 'Unknown'
          });
        });
        // Sort by most recent first
        ordersList.sort((a, b) => (b.createdAt?.toDate() || new Date()) - (a.createdAt?.toDate() || new Date()));
        setOrders(ordersList);
      });
      return unsubscribe;
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  // Calculate detailed stats
  const totalInquiries = orders.length;
  const newInquiries = orders.filter(o => o.status === "inquiry_sent").length;
  const respondedInquiries = orders.filter(o => o.status === "responded").length;
  const inProgressOrders = orders.filter(o => o.status === "in_progress").length;
  const completedOrders = orders.filter(o => o.status === "completed").length;
  const ordersWithPaymentProof = orders.filter(o => o.paymentProof).length;
  
  // Get recent activity (orders from last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentOrders = orders.filter(o => {
    if (!o.createdAt) return false;
    const orderDate = o.createdAt.toDate();
    return orderDate >= sevenDaysAgo;
  }).length;

  const stats = [
    { 
      title: "Total Products", 
      value: products.length, 
      icon: Package, 
      bgColor: "bg-emerald-500",
      change: products.length > 0 ? `${products.length} listed` : "No products yet"
    },
    { 
      title: "New Inquiries", 
      value: newInquiries, 
      icon: MessageSquare, 
      bgColor: "bg-blue-500",
      change: `${newInquiries} awaiting response`
    },
    { 
      title: "Active Orders", 
      value: inProgressOrders, 
      icon: Clock, 
      bgColor: "bg-orange-500",
      change: `${inProgressOrders} in progress`
    },
    { 
      title: "Completed Orders", 
      value: completedOrders, 
      icon: CheckCircle, 
      bgColor: "bg-green-500",
      change: `${completedOrders} completed`
    },
    { 
      title: "Total Inquiries", 
      value: totalInquiries, 
      icon: ShoppingCart, 
      bgColor: "bg-purple-500",
      change: `${recentOrders} this week`
    },
    { 
      title: "Payment Proofs", 
      value: ordersWithPaymentProof, 
      icon: DollarSign, 
      bgColor: "bg-indigo-500",
      change: `${ordersWithPaymentProof} with payment proof`
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />
      <VendorSidebar />

      <div className="lg:ml-64 transition-all duration-300 p-4 sm:p-6 pt-16 lg:pt-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex-1">
              <p className="text-sm sm:text-base text-gray-600">{vendor?.businessName}</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {vendor?.vendorName || vendor?.businessName || 'Vendor'}!
              </h1>
              <p className="text-sm sm:text-base text-gray-600">{vendor?.email}</p>
              <p className="text-sm sm:text-base text-gray-600">{vendor?.phone}</p>
            </div>
            <Link
              to="/"
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm hover:shadow-md w-full sm:w-auto justify-center sm:justify-start"
            >
              <Home size={20} />
              <span className="font-medium text-sm sm:text-base">Back to Home</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards - Enhanced with 6 cards in 2 rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {stat.title === "New Inquiries" && newInquiries > 0 && (
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.change}</p>
              </div>
            );
          })}
        </div>

        {/* Order Status Summary */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Order Status Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{newInquiries}</div>
              <div className="text-sm text-gray-600">New Inquiries</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{respondedInquiries}</div>
              <div className="text-sm text-gray-600">Responded</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{inProgressOrders}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{completedOrders}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/vendor/products')}
              className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition"
            >
              <Plus className="w-6 h-6 text-emerald-600" />
              <span className="font-medium text-emerald-900">Add New Product</span>
            </button>
            <button
              onClick={() => navigate('/vendor/orders')}
              className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition relative"
            >
              <ShoppingCart className="w-6 h-6 text-blue-600" />
              <span className="font-medium text-blue-900">View Orders</span>
              {newInquiries > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                  {newInquiries}
                </div>
              )}
            </button>
            <button
              onClick={() => navigate('/vendor/messages')}
              className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
            >
              <MessageSquare className="w-6 h-6 text-purple-600" />
              <span className="font-medium text-purple-900">Messages</span>
            </button>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Orders</h2>
            <button
              onClick={() => navigate('/vendor/orders')}
              className="text-emerald-600 hover:text-emerald-700 text-xs sm:text-sm font-medium"
            >
              View All
            </button>
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No customer inquiries yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Customers will see a "Contact Vendor" button on your products
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{order.customerName || 'Customer'}</p>
                      <p className="text-sm text-gray-600">{order.product?.name || 'Product Inquiry'}</p>
                      <p className="text-xs text-gray-500">{order.displayDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {order.paymentProof && (
                      <div className="w-2 h-2 bg-green-500 rounded-full" title="Payment proof provided"></div>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'inquiry_sent' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'responded' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status === 'inquiry_sent' ? 'New' : 
                       order.status === 'responded' ? 'Responded' :
                       order.status === 'in_progress' ? 'In Progress' :
                       order.status === 'completed' ? 'Completed' : order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}