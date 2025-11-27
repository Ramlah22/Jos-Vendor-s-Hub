import { useState, useEffect } from "react";
import { MessageCircle, User, Package, Mail, Phone, MapPin, Calendar, FileText, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VendorSidebar from "../components/VendorSidebar";

export default function VendorOrders() {
  const [vendor, setVendor] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setVendor(parsedUser);

      // Use the vendor's uid or businessName to match orders
      if (parsedUser.uid) {
        loadOrders(parsedUser.uid);
      }
    } else {
      navigate('/sign-in');
    }
  }, [navigate]);

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
            // Format date for display
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
      toast.error("Failed to load orders");
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
        updatedAt: new Date()
      });
      toast.success("Order status updated successfully");
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const filteredOrders = orders.filter(order => 
    filterStatus === "all" || order.status === filterStatus
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />
      <VendorSidebar />

      <div className="lg:ml-64 transition-all duration-300 p-4 sm:p-6 pt-16 lg:pt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Customer Inquiries</h2>
            
            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto w-full sm:w-auto scrollbar-hide pb-2">
              {[
                { key: "all", label: "All" },
                { key: "inquiry_sent", label: "New" },
                { key: "responded", label: "Responded" },
                { key: "in_progress", label: "In Progress" },
                { key: "completed", label: "Completed" }
              ].map((status) => (
                <button
                  key={status.key}
                  onClick={() => setFilterStatus(status.key)}
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg font-medium transition whitespace-nowrap ${
                    filterStatus === status.key
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {filterStatus === "all" ? "No customer inquiries yet" : `No ${filterStatus} inquiries`}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Customers will see a "Contact Vendor" button on your products
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{order.customerName || 'Customer'}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <Mail size={14} />
                          {order.customerEmail || 'No email provided'}
                        </p>
                        {order.customerPhone && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Phone size={14} />
                            {order.customerPhone}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                          <Calendar size={12} />
                          {order.displayDate || 'Recently'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'inquiry_sent' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'responded' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status === 'inquiry_sent' ? 'New Inquiry' : 
                       order.status === 'responded' ? 'Responded' :
                       order.status === 'in_progress' ? 'In Progress' :
                       order.status === 'completed' ? 'Completed' : order.status}
                    </span>
                  </div>

                  {/* Product Information */}
                  {order.product && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <img 
                          src={order.product.image} 
                          alt={order.product.name}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.target.src = '/placeholder-image.jpg';
                          }}
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">{order.product.name}</h4>
                          <p className="text-sm text-gray-600">{order.product.category}</p>
                          <p className="text-emerald-600 font-semibold">{order.product.price}</p>
                          {order.quantity > 1 && (
                            <p className="text-xs text-gray-500">Quantity interested: {order.quantity}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Customer Message */}
                  {order.message && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">Customer Message:</p>
                      <p className="text-gray-800">{order.message}</p>
                    </div>
                  )}

                  {/* Delivery Address */}
                  {order.deliveryAddress && (
                    <div className="mb-4 p-3 bg-gray-50 rounded">
                      <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <MapPin size={14} />
                        Delivery Address:
                      </p>
                      <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                    </div>
                  )}

                  {/* Payment Proof */}
                  {order.paymentProof && (
                    <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <FileText size={14} />
                        Payment Proof:
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white p-2 rounded border">
                          <FileText size={16} className="text-green-600" />
                          <span className="text-sm text-gray-600">{order.paymentProofName || 'Payment Document'}</span>
                        </div>
                        <button
                          onClick={() => window.open(order.paymentProof, '_blank')}
                          className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition flex items-center gap-1"
                        >
                          <Eye size={12} />
                          View
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Preferred Contact Method */}
                  {order.preferredContactMethod && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Preferred Contact:</span> {order.preferredContactMethod}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {order.status === 'inquiry_sent' && (
                        <>
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'responded')}
                            className="flex-1 sm:flex-none bg-emerald-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-emerald-700 transition text-xs sm:text-sm"
                          >
                            Mark as Responded
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'in_progress')}
                            className="flex-1 sm:flex-none bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition text-xs sm:text-sm"
                          >
                            Start Processing
                          </button>
                        </>
                      )}
                      {order.status === 'responded' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'in_progress')}
                          className="flex-1 sm:flex-none bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition text-xs sm:text-sm"
                        >
                          Mark In Progress
                        </button>
                      )}
                      {order.status === 'in_progress' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                          className="flex-1 sm:flex-none bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition text-xs sm:text-sm"
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                    
                    {/* Contact Customer Button */}
                    <div className="flex gap-2 sm:ml-auto">
                      {order.customerEmail && (
                        <a
                          href={`mailto:${order.customerEmail}?subject=Re: ${order.product?.name || 'Product Inquiry'}&body=Hi ${order.customerName || 'Customer'},%0A%0AThank you for your inquiry about ${order.product?.name || 'our product'}. `}
                          className="flex-1 sm:flex-none bg-gray-100 text-gray-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-200 transition text-xs sm:text-sm flex items-center justify-center gap-1"
                        >
                          <Mail size={14} />
                          <span className="hidden sm:inline">Email Customer</span>
                          <span className="sm:hidden">Email</span>
                        </a>
                      )}
                      {order.customerPhone && (
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="flex-1 sm:flex-none bg-gray-100 text-gray-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-200 transition text-xs sm:text-sm flex items-center justify-center gap-1"
                        >
                          <Phone size={14} />
                          <span className="hidden sm:inline">Call Customer</span>
                          <span className="sm:hidden">Call</span>
                        </a>
                      )}
                    </div>
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