import { useState, useEffect } from "react";
import { MessageSquare, Send, User, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VendorSidebar from "../components/VendorSidebar";

export default function VendorMessages() {
  const [vendor, setVendor] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setVendor(parsedUser);
    } else {
      navigate('/sign-in');
    }
  }, [navigate]);

  // Placeholder for future implementation
  const conversations = [];

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />
      <VendorSidebar />

      <div className="lg:ml-64 transition-all duration-300 p-4 sm:p-6 pt-16 lg:pt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[calc(100vh-8rem)] sm:h-[calc(100vh-6rem)]">
          <div className="flex flex-col lg:flex-row h-full">
            {/* Conversations List */}
            <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-gray-200 h-1/3 lg:h-full">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="overflow-y-auto h-[calc(100%-140px)]">
                {conversations.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No conversations yet</p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className="p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-medium text-gray-900">{conv.customerName}</p>
                            <span className="text-xs text-gray-500">{conv.time}</span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-1">{conv.lastMessage}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col h-2/3 lg:h-full">
              <div className="text-center py-10 sm:py-20 px-4">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Messaging Feature Coming Soon!</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Chat with your customers in real-time. This feature will allow you to:
                </p>
                <ul className="text-gray-600 mt-4 space-y-2 max-w-md mx-auto text-left">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    Respond to customer inquiries
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    Share product details and images
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    Provide order updates
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    Build customer relationships
                  </li>
                </ul>
              </div>

              {/* Message Input (disabled for now) */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    disabled
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white opacity-50 cursor-not-allowed"
                  />
                  <button
                    disabled
                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg opacity-50 cursor-not-allowed flex items-center gap-2"
                  >
                    <Send size={20} />
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
