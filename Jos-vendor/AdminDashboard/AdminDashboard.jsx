import React from 'react';
import { Navigate } from 'react-router-dom';
import AdminSidebar from '../src/components/AdminSidebar';
import { useAdminAuth } from '../src/context/AdminAuthContext';
import { 
    Users, 
    Store, 
    Package, 
    ShoppingCart, 
    TrendingUp, 
    DollarSign,
    Eye,
    Star
} from 'lucide-react';

const AdminDashboard = () => {
    const { currentUser, isAdmin } = useAdminAuth();

    if (!isAdmin) {
        return <Navigate to="/admin/login" replace />;
    }

    const stats = [
        {
            title: 'Total Customers',
            value: '1,245',
            change: '+12.5%',
            icon: Users,
            bgColor: 'bg-blue-500',
            textColor: 'text-blue-600',
            bgLight: 'bg-blue-50'
        },
        {
            title: 'Active Vendors',
            value: '89',
            change: '+8.2%',
            icon: Store,
            bgColor: 'bg-emerald-500',
            textColor: 'text-emerald-600',
            bgLight: 'bg-emerald-50'
        },
        {
            title: 'Total Products',
            value: '3,567',
            change: '+15.3%',
            icon: Package,
            bgColor: 'bg-purple-500',
            textColor: 'text-purple-600',
            bgLight: 'bg-purple-50'
        },
        {
            title: 'Total Orders',
            value: '2,890',
            change: '+22.1%',
            icon: ShoppingCart,
            bgColor: 'bg-orange-500',
            textColor: 'text-orange-600',
            bgLight: 'bg-orange-50'
        },
        {
            title: 'Total Revenue',
            value: '₦2.4M',
            change: '+18.7%',
            icon: DollarSign,
            bgColor: 'bg-green-500',
            textColor: 'text-green-600',
            bgLight: 'bg-green-50'
        },
        {
            title: 'Page Views',
            value: '45.2K',
            change: '+9.4%',
            icon: Eye,
            bgColor: 'bg-pink-500',
            textColor: 'text-pink-600',
            bgLight: 'bg-pink-50'
        }
    ];

    const recentOrders = [
        { id: '1234', customer: 'Amina Johnson', vendor: 'AfriStyle', amount: '₦15,000', status: 'Completed' },
        { id: '1235', customer: 'Chidi Okafor', vendor: 'Traditional Crafts', amount: '₦8,500', status: 'Processing' },
        { id: '1236', customer: 'Sarah Williams', vendor: 'AfriStyle', amount: '₦22,000', status: 'Pending' },
        { id: '1237', customer: 'Mohammed Ali', vendor: 'Jos Marketplace', amount: '₦12,300', status: 'Completed' },
        { id: '1238', customer: 'Grace Eze', vendor: 'Traditional Crafts', amount: '₦6,700', status: 'Shipped' }
    ];

    const topVendors = [
        { name: 'AfriStyle Boutique', sales: '₦450K', orders: 234, rating: 4.8 },
        { name: 'Traditional Crafts', sales: '₦385K', orders: 198, rating: 4.7 },
        { name: 'Jos Marketplace', sales: '₦320K', orders: 167, rating: 4.6 },
        { name: 'Fashion Hub', sales: '₦298K', orders: 145, rating: 4.9 }
    ];

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-700';
            case 'processing':
                return 'bg-blue-100 text-blue-700';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700';
            case 'shipped':
                return 'bg-purple-100 text-purple-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
      
            <div className="flex-1 lg:ml-64">
                <div className="p-6 lg:p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Dashboard Overview
                        </h1>
                        <p className="text-gray-600">
                            Welcome back, {currentUser?.displayName || 'Admin'}
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                                            <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                                            <p className="text-sm text-green-600 mt-2">{stat.change} from last month</p>
                                        </div>
                                        <div className={`${stat.bgLight} p-3 rounded-lg`}>
                                            <Icon className={stat.textColor} size={24} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Recent Orders & Top Vendors */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Orders */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Orders</h2>
                            <div className="space-y-4">
                                {recentOrders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800">{order.customer}</p>
                                            <p className="text-sm text-gray-500">Order #{order.id} • {order.vendor}</p>
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className="font-semibold text-gray-800">{order.amount}</p>
                                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Vendors */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Top Vendors</h2>
                            <div className="space-y-4">
                                {topVendors.map((vendor, index) => (
                                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">{vendor.name}</p>
                                                <p className="text-sm text-gray-500">{vendor.orders} orders</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-800">{vendor.sales}</p>
                                            <div className="flex items-center gap-1 text-sm text-yellow-500">
                                                <Star size={14} fill="currentColor" />
                                                <span>{vendor.rating}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;