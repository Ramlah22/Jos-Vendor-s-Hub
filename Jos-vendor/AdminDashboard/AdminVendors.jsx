import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import AdminSidebar from '../src/components/AdminSidebar';
import { useAdminAuth } from '../src/context/AdminAuthContext';
import { db } from '../src/firebase';
import { collection, query, where, getDocs, orderBy, limit, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Search, Filter, Eye, Mail, Phone, MapPin, Star, Package, CheckCircle, XCircle, Clock, X, Trash2, Ban, ThumbsUp, ThumbsDown } from 'lucide-react';

const AdminVendors = () => {
  const { isAdmin } = useAdminAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);    useEffect(() => {
        if (isAdmin) {
            fetchVendors();
        }
    }, [isAdmin]);

    const fetchVendors = async () => {
        try {
            setLoading(true);
            // Read from `vendors` collection
            const vendorsQuery = query(
                collection(db, 'vendors'),
                orderBy('createdAt', 'desc'),
                limit(100)
            );
      
            const querySnapshot = await getDocs(vendorsQuery);
            const vendorData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
      
            setVendors(vendorData);
        } catch (error) {
            console.error('Error fetching vendors:', error);
            // Set mock data if fetch fails
            setVendors([
                { id: '1', name: 'AfriStyle Boutique', email: 'contact@afristyle.com', phone: '+234 123 456 7890', location: 'Jos, Plateau', products: 156, rating: 4.8, totalSales: '₦450,000', status: 'approved', verificationStatus: 'verified' },
                { id: '2', name: 'Traditional Crafts', email: 'info@tradcrafts.com', phone: '+234 234 567 8901', location: 'Lagos', products: 89, rating: 4.7, totalSales: '₦385,000', status: 'approved', verificationStatus: 'verified' },
                { id: '3', name: 'Jos Marketplace', email: 'hello@josmarket.com', phone: '+234 345 678 9012', location: 'Jos, Plateau', products: 203, rating: 4.6, totalSales: '₦320,000', status: 'approved', verificationStatus: 'verified' },
                { id: '4', name: 'Fashion Hub Nigeria', email: 'contact@fashionhub.ng', phone: '+234 456 789 0123', location: 'Abuja', products: 45, rating: 4.9, totalSales: '₦298,000', status: 'pending', verificationStatus: 'pending' },
                { id: '5', name: 'Heritage Designs', email: 'info@heritage.ng', phone: '+234 567 890 1234', location: 'Kano', products: 12, rating: 0, totalSales: '₦0', status: 'pending', verificationStatus: 'unverified' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin) {
        return <Navigate to="/admin/login" replace />;
    }

    const filteredVendors = vendors.filter(vendor => {
        const matchesSearch = vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                 vendor.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || vendor.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: vendors.length,
        approved: vendors.filter(v => v.status === 'approved').length,
        pending: vendors.filter(v => v.status === 'pending').length,
        verified: vendors.filter(v => v.verificationStatus === 'verified').length
    };

  const handleViewDetails = (vendor) => {
    setSelectedVendor(vendor);
    setShowDetailsModal(true);
  };

  const handleApproveVendor = async (vendorId) => {
    if (!confirm('Approve this vendor?')) return;
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'vendors', vendorId), {
        status: 'approved',
        updatedAt: new Date()
      });
      setVendors(vendors.map(v => v.id === vendorId ? { ...v, status: 'approved' } : v));
      if (selectedVendor?.id === vendorId) {
        setSelectedVendor({ ...selectedVendor, status: 'approved' });
      }
      alert('Vendor approved successfully');
    } catch (error) {
      console.error('Error approving vendor:', error);
      alert('Failed to approve vendor');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectVendor = async (vendorId) => {
    if (!confirm('Reject this vendor?')) return;
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'vendors', vendorId), {
        status: 'rejected',
        updatedAt: new Date()
      });
      setVendors(vendors.map(v => v.id === vendorId ? { ...v, status: 'rejected' } : v));
      if (selectedVendor?.id === vendorId) {
        setSelectedVendor({ ...selectedVendor, status: 'rejected' });
      }
      alert('Vendor rejected');
    } catch (error) {
      console.error('Error rejecting vendor:', error);
      alert('Failed to reject vendor');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteVendor = async (vendorId) => {
    if (!confirm('Delete this vendor permanently?')) return;
    setActionLoading(true);
    try {
      await deleteDoc(doc(db, 'vendors', vendorId));
      setVendors(vendors.filter(v => v.id !== vendorId));
      setShowDetailsModal(false);
      alert('Vendor deleted successfully');
    } catch (error) {
      console.error('Error deleting vendor:', error);
      alert('Failed to delete vendor');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
          <CheckCircle size={12} /> Approved
        </span>;
      case 'pending':
        return <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
          <Clock size={12} /> Pending
        </span>;
      case 'rejected':
        return <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
          <XCircle size={12} /> Rejected
        </span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{status}</span>;
    }
  };    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
      
            <div className="flex-1 lg:ml-64">
                <div className="p-6 lg:p-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Vendors</h1>
                        <p className="text-gray-600">Manage and monitor all vendor accounts</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <p className="text-sm text-gray-600 mb-1">Total Vendors</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stats.total}</h3>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <p className="text-sm text-gray-600 mb-1">Approved</p>
                            <h3 className="text-2xl font-bold text-green-600">{stats.approved}</h3>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <p className="text-sm text-gray-600 mb-1">Pending</p>
                            <h3 className="text-2xl font-bold text-yellow-600">{stats.pending}</h3>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <p className="text-sm text-gray-600 mb-1">Verified</p>
                            <h3 className="text-2xl font-bold text-blue-600">{stats.verified}</h3>
                        </div>
                    </div>

                    {/* Search and Filter */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search vendors by name or email..."
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
                                    <option value="approved">Approved</option>
                                    <option value="pending">Pending</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Vendors Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                                <p className="mt-4 text-gray-600">Loading vendors...</p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table View */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Vendor</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Business</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Joined</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredVendors.map((vendor) => (
                                            <tr key={vendor.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold">
                                                            {vendor.vendorName?.charAt(0) || vendor.businessName?.charAt(0) || 'V'}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800">{vendor.vendorName || 'N/A'}</p>
                                                            <p className="text-xs text-gray-500">{vendor.uid}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-medium text-gray-800">{vendor.businessName || 'N/A'}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="flex items-center gap-2 text-gray-600">
                                                        <Mail size={14} className="text-gray-400" />
                                                        {vendor.email || 'N/A'}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                                        {vendor.businessCategory || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="flex items-center gap-1 text-sm text-gray-600">
                                                        <MapPin size={14} className="text-gray-400" />
                                                        {vendor.businessLocation || 'N/A'}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full capitalize">
                                                        {vendor.role || 'vendor'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-600">
                                                        {vendor.createdAt?.toDate ? vendor.createdAt.toDate().toLocaleDateString() : 'N/A'}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button 
                                                        onClick={() => handleViewDetails(vendor)}
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
                                {filteredVendors.map((vendor) => (
                                    <div key={vendor.id} className="p-4 hover:bg-gray-50">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold text-lg">
                                                    {vendor.vendorName?.charAt(0) || vendor.businessName?.charAt(0) || 'V'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800">{vendor.vendorName || 'N/A'}</p>
                                                    <p className="text-xs text-gray-500">{vendor.businessName || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                                {vendor.businessCategory || 'N/A'}
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-2 mb-3 text-sm">
                                            <p className="flex items-center gap-2 text-gray-600">
                                                <Mail size={14} />
                                                {vendor.email || 'N/A'}
                                            </p>
                                            <p className="flex items-center gap-2 text-gray-600">
                                                <MapPin size={14} />
                                                {vendor.businessLocation || 'N/A'}
                                            </p>
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <div className="flex gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-500 text-xs">Role</p>
                                                    <p className="font-semibold text-gray-800 capitalize">{vendor.role || 'vendor'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-xs">Joined</p>
                                                    <p className="font-semibold text-gray-600 text-xs">
                                                        {vendor.createdAt?.toDate ? vendor.createdAt.toDate().toLocaleDateString() : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleViewDetails(vendor)}
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

                    {/* Vendor Details Modal */}
                    {showDetailsModal && selectedVendor && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-gray-800">Vendor Details</h2>
                                    <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                        <X size={24} className="text-gray-500" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-3xl font-bold">
                                            {selectedVendor.name?.charAt(0) || 'V'}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-800">{selectedVendor.name}</h3>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {getStatusBadge(selectedVendor.status)}
                                                {selectedVendor.verificationStatus === 'verified' && (
                                                    <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                                        <CheckCircle size={12} /> Verified
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 mb-1">Email</p>
                                            <p className="flex items-center gap-2 text-gray-800">
                                                <Mail size={16} className="text-gray-400" />
                                                {selectedVendor.email}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 mb-1">Phone</p>
                                            <p className="flex items-center gap-2 text-gray-800">
                                                <Phone size={16} className="text-gray-400" />
                                                {selectedVendor.phone || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 mb-1">Location</p>
                                            <p className="flex items-center gap-2 text-gray-800">
                                                <MapPin size={16} className="text-gray-400" />
                                                {selectedVendor.location || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 mb-1">Products</p>
                                            <p className="flex items-center gap-2 text-gray-800">
                                                <Package size={16} className="text-gray-400" />
                                                {selectedVendor.products || 0}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div className="bg-purple-50 p-4 rounded-lg text-center">
                                            <p className="text-2xl font-bold text-purple-600">{selectedVendor.products || 0}</p>
                                            <p className="text-sm text-gray-600 mt-1">Products</p>
                                        </div>
                                        <div className="bg-yellow-50 p-4 rounded-lg text-center">
                                            <p className="text-2xl font-bold text-yellow-600 flex items-center justify-center gap-1">
                                                <Star size={20} fill="currentColor" />
                                                {selectedVendor.rating || 'N/A'}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">Rating</p>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-lg text-center">
                                            <p className="text-2xl font-bold text-green-600">{selectedVendor.totalSales || '₦0'}</p>
                                            <p className="text-sm text-gray-600 mt-1">Total Sales</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-wrap gap-3">
                                    {selectedVendor.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleApproveVendor(selectedVendor.id)}
                                                disabled={actionLoading}
                                                className="flex-1 min-w-[120px] px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg font-medium flex items-center justify-center gap-2"
                                            >
                                                <ThumbsUp size={16} /> Approve
                                            </button>
                                            <button
                                                onClick={() => handleRejectVendor(selectedVendor.id)}
                                                disabled={actionLoading}
                                                className="flex-1 min-w-[120px] px-4 py-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg font-medium flex items-center justify-center gap-2"
                                            >
                                                <ThumbsDown size={16} /> Reject
                                            </button>
                                        </>
                                    )}
                                    {selectedVendor.status === 'approved' && (
                                        <button
                                            onClick={() => handleRejectVendor(selectedVendor.id)}
                                            disabled={actionLoading}
                                            className="flex-1 min-w-[120px] px-4 py-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg font-medium flex items-center justify-center gap-2"
                                        >
                                            <Ban size={16} /> Suspend
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDeleteVendor(selectedVendor.id)}
                                        disabled={actionLoading}
                                        className="flex-1 min-w-[120px] px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={16} /> Delete
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

export default AdminVendors;