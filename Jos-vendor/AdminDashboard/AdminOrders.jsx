import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import AdminSidebar from '../src/components/AdminSidebar';
import { useAdminAuth } from '../src/context/AdminAuthContext';
import { db } from '../src/firebase';
import { collection, getDocs, limit, query, doc, updateDoc, orderBy } from 'firebase/firestore';
import { Search, Filter, Eye, Package, Clock, CheckCircle, XCircle, Truck, X, Calendar } from 'lucide-react';

const AdminOrders = () => {
    const { isAdmin } = useAdminAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (isAdmin) {
            fetchOrders();
        }
    }, [isAdmin]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            // Read from `orders` collection
            const ordersQuery = query(
                collection(db, 'orders'),
                orderBy('createdAt', 'desc'),
                limit(100)
            );
      
            const querySnapshot = await getDocs(ordersQuery);
            const orderData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
      
            setOrders(orderData);
        } catch (error) {
            console.error('Error fetching orders:', error);
            // Set mock data if fetch fails
            setOrders([
                { id: 'ORD-1234', customer: 'Amina Johnson', vendor: 'AfriStyle Boutique', items: 3, total: '₦15,000', status: 'completed', date: '2024-11-28', paymentMethod: 'Card' },
                { id: 'ORD-1235', customer: 'Chidi Okafor', vendor: 'Traditional Crafts', items: 1, total: '₦8,500', status: 'processing', date: '2024-11-28', paymentMethod: 'Transfer' },
                { id: 'ORD-1236', customer: 'Sarah Williams', vendor: 'AfriStyle Boutique', items: 2, total: '₦22,000', status: 'pending', date: '2024-11-27', paymentMethod: 'Card' },
                { id: 'ORD-1237', customer: 'Mohammed Ali', vendor: 'Jos Marketplace', items: 4, total: '₦12,300', status: 'shipped', date: '2024-11-27', paymentMethod: 'Cash' },
                { id: 'ORD-1238', customer: 'Grace Eze', vendor: 'Traditional Crafts', items: 1, total: '₦6,700', status: 'completed', date: '2024-11-26', paymentMethod: 'Transfer' },
                { id: 'ORD-1239', customer: 'John Doe', vendor: 'Fashion Hub', items: 2, total: '₦18,900', status: 'cancelled', date: '2024-11-26', paymentMethod: 'Card' },
                { id: 'ORD-1240', customer: 'Fatima Hassan', vendor: 'Heritage Designs', items: 5, total: '₦34,500', status: 'processing', date: '2024-11-25', paymentMethod: 'Transfer' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setShowDetailsModal(true);
    };

    const handleUpdateStatus = async (newStatus) => {
        if (!selectedOrder) return;
        
        if (window.confirm(`Change order status to ${newStatus}?`)) {
            setActionLoading(true);
            try {
                const orderRef = doc(db, 'orders', selectedOrder.id);
                await updateDoc(orderRef, {
                    status: newStatus,
                    updatedAt: new Date()
                });
                
                // Update local state
                setOrders(orders.map(o => 
                    o.id === selectedOrder.id 
                        ? { ...o, status: newStatus }
                        : o
                ));
                
                setSelectedOrder({ ...selectedOrder, status: newStatus });
                alert(`Order status updated to ${newStatus}!`);
            } catch (error) {
                console.error('Error updating order:', error);
                alert('Failed to update order status. Please try again.');
            } finally {
                setActionLoading(false);
            }
        }
    };

    if (!isAdmin) {
        return <Navigate to="/admin/login" replace />;
    }

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                 order.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                 order.vendor?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        completed: orders.filter(o => o.status === 'completed').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: {
                icon: Clock,
                class: 'bg-yellow-100 text-yellow-700',
                label: 'Pending'
            },
            processing: {
                icon: Package,
                class: 'bg-blue-100 text-blue-700',
                label: 'Processing'
            },
            shipped: {
                icon: Truck,
                class: 'bg-purple-100 text-purple-700',
                label: 'Shipped'
            },
            completed: {
                icon: CheckCircle,
                class: 'bg-green-100 text-green-700',
                label: 'Completed'
            },
            cancelled: {
                icon: XCircle,
                class: 'bg-red-100 text-red-700',
                label: 'Cancelled'
            }
        };

        const badge = badges[status] || badges.pending;
        const Icon = badge.icon;

        return (
            <span className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full ${badge.class}`}>
                <Icon size={12} />
                {badge.label}
            </span>
        );
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
      
            <div className="flex-1 lg:ml-64">
                <div className="p-6 lg:p-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Orders</h1>
                        <p className="text-gray-600">Monitor and manage all platform orders</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <p className="text-xs text-gray-600 mb-1">Total</p>
                            <h3 className="text-xl font-bold text-gray-800">{stats.total}</h3>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <p className="text-xs text-gray-600 mb-1">Pending</p>
                            <h3 className="text-xl font-bold text-yellow-600">{stats.pending}</h3>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <p className="text-xs text-gray-600 mb-1">Processing</p>
                            <h3 className="text-xl font-bold text-blue-600">{stats.processing}</h3>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <p className="text-xs text-gray-600 mb-1">Shipped</p>
                            <h3 className="text-xl font-bold text-purple-600">{stats.shipped}</h3>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <p className="text-xs text-gray-600 mb-1">Completed</p>
                            <h3 className="text-xl font-bold text-green-600">{stats.completed}</h3>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <p className="text-xs text-gray-600 mb-1">Cancelled</p>
                            <h3 className="text-xl font-bold text-red-600">{stats.cancelled}</h3>
                        </div>
                    </div>

                    {/* Search and Filter */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by order ID, customer, or vendor..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter size={20} className="text-gray-400" />
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Orders Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                                <p className="mt-4 text-gray-600">Loading orders...</p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table View */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Vendor</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Items</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Payment</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredOrders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-medium text-gray-800">{order.id}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-800">
                                                        {typeof order.customer === 'object' ? order.customer?.name || order.customer?.email || 'N/A' : order.customer}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-600">
                                                        {typeof order.vendor === 'object' ? order.vendor?.name || order.vendor?.email || 'N/A' : order.vendor}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-800">{order.items || order.itemCount || 0} items</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-semibold text-gray-800">{order.total || order.totalAmount || '₦0'}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                                        {order.paymentMethod || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="flex items-center gap-1 text-sm text-gray-600">
                                                        <Calendar size={14} />
                                                        {order.date || (order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A')}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(order.status)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button 
                                                        onClick={() => handleViewDetails(order)}
                                                        className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1"
                                                    >
                                                        <Eye size={16} />
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Mobile Card View */}
                            <div className="md:hidden divide-y divide-gray-200">
                                {filteredOrders.map((order) => (
                                    <div key={order.id} className="p-4 hover:bg-gray-50">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <p className="font-medium text-gray-800">{order.id}</p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                    <Calendar size={10} />
                                                    {order.date || (order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A')}
                                                </p>
                                            </div>
                                            {getStatusBadge(order.status)}
                                        </div>
                                        
                                        <div className="space-y-2 mb-3 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Customer:</span>
                                                <span className="font-medium text-gray-800">
                                                    {typeof order.customer === 'object' ? order.customer?.name || order.customer?.email || 'N/A' : order.customer}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Vendor:</span>
                                                <span className="text-gray-800">
                                                    {typeof order.vendor === 'object' ? order.vendor?.name || order.vendor?.email || 'N/A' : order.vendor}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Items:</span>
                                                <span className="text-gray-800">{order.items || order.itemCount || 0} items</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Payment:</span>
                                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                                    {order.paymentMethod || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <div>
                                                <p className="text-gray-500 text-xs">Total</p>
                                                <p className="font-semibold text-emerald-600">{order.total || order.totalAmount || '₦0'}</p>
                                            </div>
                                            <button 
                                                onClick={() => handleViewDetails(order)}
                                                className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1"
                                            >
                                                <Eye size={16} />
                                                View
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Order Details Modal */}
            {showDetailsModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-800">Order Details</h3>
                            <button 
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {/* Order Header */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Order ID</p>
                                        <p className="text-xl font-bold text-gray-800">{selectedOrder.id}</p>
                                    </div>
                                    <div>
                                        {getStatusBadge(selectedOrder.status)}
                                    </div>
                                </div>
                            </div>

                            {/* Customer & Vendor Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <p className="text-sm font-medium text-gray-600 mb-2">Customer</p>
                                    <p className="font-semibold text-gray-800">
                                        {typeof selectedOrder.customer === 'object' 
                                            ? selectedOrder.customer?.name || selectedOrder.customer?.email || 'N/A' 
                                            : selectedOrder.customer}
                                    </p>
                                    {selectedOrder.customerEmail && (
                                        <p className="text-sm text-gray-600 mt-1">{selectedOrder.customerEmail}</p>
                                    )}
                                </div>
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <p className="text-sm font-medium text-gray-600 mb-2">Vendor</p>
                                    <p className="font-semibold text-gray-800">
                                        {typeof selectedOrder.vendor === 'object' 
                                            ? selectedOrder.vendor?.name || selectedOrder.vendor?.email || 'N/A' 
                                            : selectedOrder.vendor}
                                    </p>
                                </div>
                            </div>

                            {/* Order Info Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="p-3 bg-blue-50 rounded-lg text-center">
                                    <Package className="mx-auto mb-1 text-blue-600" size={20} />
                                    <p className="text-xs text-gray-600">Items</p>
                                    <p className="font-semibold text-gray-800">
                                        {selectedOrder.items || selectedOrder.itemCount || 0}
                                    </p>
                                </div>
                                <div className="p-3 bg-emerald-50 rounded-lg text-center">
                                    <p className="text-xs text-gray-600 mb-1">Total</p>
                                    <p className="font-bold text-emerald-600">
                                        {selectedOrder.total || selectedOrder.totalAmount || '₦0'}
                                    </p>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-lg text-center">
                                    <p className="text-xs text-gray-600 mb-1">Payment</p>
                                    <p className="font-semibold text-gray-800">
                                        {selectedOrder.paymentMethod || 'N/A'}
                                    </p>
                                </div>
                                <div className="p-3 bg-orange-50 rounded-lg text-center">
                                    <Clock className="mx-auto mb-1 text-orange-600" size={20} />
                                    <p className="text-xs text-gray-600">Date</p>
                                    <p className="font-semibold text-gray-800 text-xs">
                                        {selectedOrder.date || (selectedOrder.createdAt?.toDate 
                                            ? selectedOrder.createdAt.toDate().toLocaleDateString() 
                                            : 'N/A')}
                                    </p>
                                </div>
                            </div>

                            {/* Order Items */}
                            {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="font-semibold text-gray-800 mb-3">Order Items</h4>
                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Product</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Quantity</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Price</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {selectedOrder.orderItems.map((item, index) => (
                                                    <tr key={index}>
                                                        <td className="px-4 py-2 text-sm text-gray-800">{item.name || item.productName}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-600">{item.quantity}</td>
                                                        <td className="px-4 py-2 text-sm font-medium text-gray-800">{item.price}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Shipping Address */}
                            {selectedOrder.shippingAddress && (
                                <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                                    <p className="text-sm font-medium text-gray-600 mb-2">Shipping Address</p>
                                    <p className="text-gray-800">{selectedOrder.shippingAddress}</p>
                                </div>
                            )}

                            {/* Status Update Section */}
                            <div className="border-t border-gray-200 pt-6">
                                <p className="font-medium text-gray-800 mb-3">Update Order Status</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    <button
                                        onClick={() => handleUpdateStatus('pending')}
                                        disabled={actionLoading || selectedOrder.status === 'pending'}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Clock size={16} />
                                        Pending
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus('processing')}
                                        disabled={actionLoading || selectedOrder.status === 'processing'}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Package size={16} />
                                        Processing
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus('shipped')}
                                        disabled={actionLoading || selectedOrder.status === 'shipped'}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Truck size={16} />
                                        Shipped
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus('completed')}
                                        disabled={actionLoading || selectedOrder.status === 'completed'}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <CheckCircle size={16} />
                                        Completed
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus('cancelled')}
                                        disabled={actionLoading || selectedOrder.status === 'cancelled'}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed col-span-2 md:col-span-1"
                                    >
                                        <XCircle size={16} />
                                        Cancelled
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="w-full md:w-auto px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default AdminOrders;