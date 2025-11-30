import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import AdminSidebar from '../src/components/AdminSidebar';
import { useAdminAuth } from '../src/context/AdminAuthContext';
import { db } from '../src/firebase';
import { collection, query, where, getDocs, orderBy, limit, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Search, Filter, Eye, Mail, Phone, MapPin, Calendar, ShoppingBag, X, Trash2, Ban, CheckCircle } from 'lucide-react';

const AdminCustomers = () => {
  const { isAdmin } = useAdminAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);    useEffect(() => {
        if (isAdmin) {
            fetchCustomers();
        }
    }, [isAdmin]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            // Read from `customers` collection
            const customersQuery = query(
                collection(db, 'customers'),
                orderBy('createdAt', 'desc'),
                limit(100)
            );
      
            const querySnapshot = await getDocs(customersQuery);
            const customerData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
      
            setCustomers(customerData);
        } catch (error) {
            console.error('Error fetching customers:', error);
            // Set mock data if fetch fails
            setCustomers([
                { id: '1', name: 'Amina Johnson', email: 'amina@example.com', phone: '+234 123 456 7890', location: 'Jos, Plateau', totalOrders: 12, totalSpent: '₦45,000', status: 'active', joinDate: '2024-01-15' },
                { id: '2', name: 'Chidi Okafor', email: 'chidi@example.com', phone: '+234 234 567 8901', location: 'Lagos', totalOrders: 8, totalSpent: '₦32,500', status: 'active', joinDate: '2024-02-20' },
                { id: '3', name: 'Sarah Williams', email: 'sarah@example.com', phone: '+234 345 678 9012', location: 'Abuja', totalOrders: 15, totalSpent: '₦67,800', status: 'active', joinDate: '2024-01-10' },
                { id: '4', name: 'Mohammed Ali', email: 'mohammed@example.com', phone: '+234 456 789 0123', location: 'Kano', totalOrders: 5, totalSpent: '₦18,200', status: 'inactive', joinDate: '2024-03-05' },
                { id: '5', name: 'Grace Eze', email: 'grace@example.com', phone: '+234 567 890 1234', location: 'Enugu', totalOrders: 20, totalSpent: '₦89,500', status: 'active', joinDate: '2023-12-01' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin) {
        return <Navigate to="/admin/login" replace />;
    }

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                 customer.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || customer.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    inactive: customers.filter(c => c.status === 'inactive').length
  };

  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
  };

  const handleDisableAccount = async (customerId, currentStatus) => {
    if (!confirm(`Are you sure you want to ${currentStatus === 'active' ? 'disable' : 'enable'} this account?`)) return;
    
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'customers', customerId), {
        status: currentStatus === 'active' ? 'inactive' : 'active',
        updatedAt: new Date()
      });
      
      setCustomers(customers.map(c => 
        c.id === customerId ? { ...c, status: currentStatus === 'active' ? 'inactive' : 'active' } : c
      ));
      
      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer({ ...selectedCustomer, status: currentStatus === 'active' ? 'inactive' : 'active' });
      }
      
      alert('Account status updated successfully');
    } catch (error) {
      console.error('Error updating account:', error);
      alert('Failed to update account status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAccount = async (customerId) => {
    if (!confirm('Are you sure you want to delete this account? This action cannot be undone.')) return;
    
    setActionLoading(true);
    try {
      await deleteDoc(doc(db, 'customers', customerId));
      setCustomers(customers.filter(c => c.id !== customerId));
      setShowDetailsModal(false);
      alert('Account deleted successfully');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    } finally {
      setActionLoading(false);
    }
  };    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
      
            <div className="flex-1 lg:ml-64">
                <div className="p-6 lg:p-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Customers</h1>
                        <p className="text-gray-600">Manage and view all customer accounts</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <p className="text-sm text-gray-600 mb-1">Total Customers</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stats.total}</h3>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <p className="text-sm text-gray-600 mb-1">Active Customers</p>
                            <h3 className="text-2xl font-bold text-green-600">{stats.active}</h3>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <p className="text-sm text-gray-600 mb-1">Inactive Customers</p>
                            <h3 className="text-2xl font-bold text-gray-400">{stats.inactive}</h3>
                        </div>
                    </div>

                    {/* Search and Filter */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search customers by name or email..."
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
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Customers Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                                <p className="mt-4 text-gray-600">Loading customers...</p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table View */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Phone Number</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Joined</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {filteredCustomers.map((customer) => (
                                                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold">
                                                            {customer.fullName?.charAt(0) || customer.email?.charAt(0) || 'C'}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800">{customer.fullName || 'N/A'}</p>
                                                            <p className="text-sm text-gray-500">
                                                                {customer.uid}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="flex items-center gap-2 text-gray-800">
                                                        <Mail size={14} className="text-gray-400" />
                                                        {customer.email || 'N/A'}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="flex items-center gap-2 text-gray-600">
                                                        <Phone size={14} className="text-gray-400" />
                                                        {customer.phoneNumber || 'N/A'}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full capitalize">
                                                        {customer.role || 'customer'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-600">
                                                        {customer.createdAt?.toDate ? customer.createdAt.toDate().toLocaleDateString() : 'N/A'}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button 
                                                        onClick={() => handleViewDetails(customer)}
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
                                {filteredCustomers.map((customer) => (
                                    <div key={customer.id} className="p-4 hover:bg-gray-50">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold text-lg">
                                                    {customer.fullName?.charAt(0) || customer.email?.charAt(0) || 'C'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800">{customer.fullName || 'N/A'}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {customer.role || 'customer'}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full capitalize">
                                                {customer.role || 'customer'}
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-2 mb-3 text-sm">
                                            <p className="flex items-center gap-2 text-gray-600">
                                                <Mail size={14} />
                                                {customer.email || 'N/A'}
                                            </p>
                                            <p className="flex items-center gap-2 text-gray-600">
                                                <Phone size={14} />
                                                {customer.phoneNumber || 'N/A'}
                                            </p>
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <div className="flex gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-500 text-xs">Joined</p>
                                                    <p className="font-semibold text-gray-800 text-xs">
                                                        {customer.createdAt?.toDate ? customer.createdAt.toDate().toLocaleDateString() : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleViewDetails(customer)}
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

                    {/* Details Modal */}
                    {showDetailsModal && selectedCustomer && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                {/* Modal Header */}
                                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-gray-800">Customer Details</h2>
                                    <button
                                        onClick={() => setShowDetailsModal(false)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X size={24} className="text-gray-500" />
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <div className="p-6 space-y-6">
                                    {/* Profile Section */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-3xl font-bold">
                                            {selectedCustomer.fullName?.charAt(0) || selectedCustomer.email?.charAt(0) || 'C'}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">{selectedCustomer.fullName || 'N/A'}</h3>
                                            <span className="inline-flex px-3 py-1 text-sm rounded-full mt-1 bg-blue-100 text-blue-700 capitalize">
                                                {selectedCustomer.role || 'customer'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 mb-1">Email</p>
                                            <p className="flex items-center gap-2 text-gray-800">
                                                <Mail size={16} className="text-gray-400" />
                                                {selectedCustomer.email || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                                            <p className="flex items-center gap-2 text-gray-800">
                                                <Phone size={16} className="text-gray-400" />
                                                {selectedCustomer.phoneNumber || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 mb-1">User ID</p>
                                            <p className="flex items-center gap-2 text-gray-600 text-sm">
                                                {selectedCustomer.uid || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 mb-1">Created At</p>
                                            <p className="flex items-center gap-2 text-gray-800">
                                                <Calendar size={16} className="text-gray-400" />
                                                {selectedCustomer.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                                            <p className="text-xs text-gray-500 mb-1">Updated At</p>
                                            <p className="flex items-center gap-2 text-gray-800">
                                                <Calendar size={16} className="text-gray-400" />
                                                {selectedCustomer.updatedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Footer - Actions */}
                                <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-wrap gap-3">
                                    <button
                                        onClick={() => handleDisableAccount(selectedCustomer.id, selectedCustomer.status)}
                                        disabled={actionLoading}
                                        className={`flex-1 min-w-[140px] px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                                            selectedCustomer.status === 'active'
                                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                                        }`}
                                    >
                                        {selectedCustomer.status === 'active' ? <Ban size={16} /> : <CheckCircle size={16} />}
                                        {selectedCustomer.status === 'active' ? 'Disable Account' : 'Enable Account'}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAccount(selectedCustomer.id)}
                                        disabled={actionLoading}
                                        className="flex-1 min-w-[140px] px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={16} />
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminCustomers;