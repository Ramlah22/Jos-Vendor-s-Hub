import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import AdminSidebar from '../src/components/AdminSidebar';
import { useAdminAuth } from '../src/context/AdminAuthContext';
import { db } from '../src/firebase';
import { collection, getDocs, limit, query, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Search, Filter, Eye, Edit, Trash2, Package, DollarSign, Star, AlertCircle, X, Save } from 'lucide-react';

const AdminProducts = () => {
  const { isAdmin } = useAdminAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [actionLoading, setActionLoading] = useState(false);    useEffect(() => {
        if (isAdmin) {
            fetchProducts();
        }
    }, [isAdmin]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            // Read from `products` collection
            const productsQuery = query(
                collection(db, 'products'),
                limit(100)
            );
      
            const querySnapshot = await getDocs(productsQuery);
            const productData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
      
            setProducts(productData);
        } catch (error) {
            console.error('Error fetching products:', error);
            // Set mock data if fetch fails
            setProducts([
                { id: '1', name: 'Premium Ankara Dress', vendor: 'AfriStyle Boutique', category: 'Clothing', price: '₦15,000', stock: 45, status: 'active', rating: 4.8, sales: 89 },
                { id: '2', name: 'Handcrafted Jewelry Set', vendor: 'Traditional Crafts', category: 'Accessories', price: '₦8,500', stock: 23, status: 'active', rating: 4.7, sales: 67 },
                { id: '3', name: 'Designer Kaftan', vendor: 'Fashion Hub', category: 'Clothing', price: '₦22,000', stock: 12, status: 'active', rating: 4.9, sales: 45 },
                { id: '4', name: 'Leather Handbag', vendor: 'Jos Marketplace', category: 'Accessories', price: '₦18,500', stock: 0, status: 'out_of_stock', rating: 4.6, sales: 34 },
                { id: '5', name: 'Traditional Beaded Necklace', vendor: 'Heritage Designs', category: 'Jewelry', price: '₦6,200', stock: 78, status: 'active', rating: 4.5, sales: 123 },
                { id: '6', name: 'Ankara Print Fabric', vendor: 'AfriStyle Boutique', category: 'Fabrics', price: '₦4,500', stock: 156, status: 'active', rating: 4.8, sales: 234 },
                { id: '7', name: 'Custom Embroidered Cap', vendor: 'Traditional Crafts', category: 'Accessories', price: '₦3,800', stock: 5, status: 'low_stock', rating: 4.4, sales: 56 }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (product) => {
        setSelectedProduct(product);
        setEditForm({
            name: product.name,
            price: product.price,
            category: product.category,
            stock: product.stock,
            description: product.description || ''
        });
        setIsEditing(false);
        setShowDetailsModal(true);
    };

    const handleEditProduct = async () => {
        if (!selectedProduct) return;
        
        if (window.confirm('Save changes to this product?')) {
            setActionLoading(true);
            try {
                const productRef = doc(db, 'products', selectedProduct.id);
                await updateDoc(productRef, {
                    name: editForm.name,
                    price: parseFloat(editForm.price),
                    category: editForm.category,
                    stock: parseInt(editForm.stock),
                    description: editForm.description,
                    updatedAt: new Date()
                });
                
                // Update local state
                setProducts(products.map(p => 
                    p.id === selectedProduct.id 
                        ? { ...p, ...editForm, price: parseFloat(editForm.price), stock: parseInt(editForm.stock) }
                        : p
                ));
                
                setIsEditing(false);
                setSelectedProduct({ ...selectedProduct, ...editForm });
                alert('Product updated successfully!');
            } catch (error) {
                console.error('Error updating product:', error);
                alert('Failed to update product. Please try again.');
            } finally {
                setActionLoading(false);
            }
        }
    };

    const handleDeleteProduct = async () => {
        if (!selectedProduct) return;
        
        if (window.confirm(`Are you sure you want to delete "${selectedProduct.name}"? This action cannot be undone.`)) {
            setActionLoading(true);
            try {
                await deleteDoc(doc(db, 'products', selectedProduct.id));
                setProducts(products.filter(p => p.id !== selectedProduct.id));
                setShowDetailsModal(false);
                alert('Product deleted successfully!');
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Failed to delete product. Please try again.');
            } finally {
                setActionLoading(false);
            }
        }
    };

    if (!isAdmin) {
        return <Navigate to="/admin/login" replace />;
    }

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                 product.vendor?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
        const matchesStock = filterStock === 'all' || 
                                                (filterStock === 'in_stock' && product.stock > 10) ||
                                                (filterStock === 'low_stock' && product.stock > 0 && product.stock <= 10) ||
                                                (filterStock === 'out_of_stock' && product.stock === 0);
        return matchesSearch && matchesCategory && matchesStock;
    });

    const stats = {
        total: products.length,
        active: products.filter(p => p.status === 'active').length,
        lowStock: products.filter(p => p.stock > 0 && p.stock <= 10).length,
        outOfStock: products.filter(p => p.stock === 0).length
    };

    const getStockBadge = (stock) => {
        if (stock === 0) {
            return <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                <AlertCircle size={12} /> Out of Stock
            </span>;
        } else if (stock <= 10) {
            return <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                <AlertCircle size={12} /> Low Stock ({stock})
            </span>;
        }
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
            In Stock ({stock})
        </span>;
    };

    const categories = ['all', 'Clothing', 'Accessories', 'Jewelry', 'Fabrics'];

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
      
            <div className="flex-1 lg:ml-64">
                <div className="p-6 lg:p-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Products</h1>
                        <p className="text-gray-600">Manage all products across the platform</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <p className="text-sm text-gray-600 mb-1">Total Products</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stats.total}</h3>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <p className="text-sm text-gray-600 mb-1">Active</p>
                            <h3 className="text-2xl font-bold text-green-600">{stats.active}</h3>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <p className="text-sm text-gray-600 mb-1">Low Stock</p>
                            <h3 className="text-2xl font-bold text-yellow-600">{stats.lowStock}</h3>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <p className="text-sm text-gray-600 mb-1">Out of Stock</p>
                            <h3 className="text-2xl font-bold text-red-600">{stats.outOfStock}</h3>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search products by name or vendor..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter size={20} className="text-gray-400" />
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>
                                            {cat === 'all' ? 'All Categories' : cat}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={filterStock}
                                    onChange={(e) => setFilterStock(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                >
                                    <option value="all">All Stock</option>
                                    <option value="in_stock">In Stock</option>
                                    <option value="low_stock">Low Stock</option>
                                    <option value="out_of_stock">Out of Stock</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Products Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                                <p className="mt-4 text-gray-600">Loading products...</p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table View */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Vendor</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Stock</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Rating</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Sales</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredProducts.map((product) => (
                                            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                            <Package className="text-gray-400" size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800">{product.name}</p>
                                                            <p className="text-xs text-gray-500">ID: {product.id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-800">{product.vendor}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                                        {product.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-semibold text-gray-800">{product.price}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStockBadge(product.stock)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="flex items-center gap-1 text-yellow-500 font-medium">
                                                        <Star size={14} fill="currentColor" />
                                                        {product.rating}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-800">{product.sales} sold</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button 
                                                            onClick={() => handleViewDetails(product)}
                                                            className="text-emerald-600 hover:text-emerald-700 p-1"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                handleViewDetails(product);
                                                                setIsEditing(true);
                                                            }}
                                                            className="text-blue-600 hover:text-blue-700 p-1"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                setSelectedProduct(product);
                                                                handleDeleteProduct();
                                                            }}
                                                            className="text-red-600 hover:text-red-700 p-1"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Mobile Card View */}
                            <div className="md:hidden divide-y divide-gray-200">
                                {filteredProducts.map((product) => (
                                    <div key={product.id} className="p-4 hover:bg-gray-50">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <Package className="text-gray-400" size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-800">{product.name}</p>
                                                    <p className="text-xs text-gray-500">ID: {product.id}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2 mb-3 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Vendor:</span>
                                                <span className="font-medium text-gray-800">{product.vendor}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Category:</span>
                                                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                                    {product.category}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Price:</span>
                                                <span className="font-semibold text-gray-800">{product.price}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Stock:</span>
                                                {getStockBadge(product.stock)}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Rating:</span>
                                                <p className="flex items-center gap-1 text-yellow-500 font-medium">
                                                    <Star size={14} fill="currentColor" />
                                                    {product.rating}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <div>
                                                <p className="text-gray-500 text-xs">Sales</p>
                                                <p className="font-semibold text-gray-800">{product.sales} sold</p>
                                            </div>
                                            <button 
                                                onClick={() => handleViewDetails(product)}
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

            {/* Product Details Modal */}
            {showDetailsModal && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-800">
                                {isEditing ? 'Edit Product' : 'Product Details'}
                            </h3>
                            <button 
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    setIsEditing(false);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {/* Product Image */}
                            <div className="mb-6">
                                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Package className="text-gray-400" size={64} />
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="space-y-4">
                                {/* Product Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Product Name
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <p className="text-gray-800 font-medium">{selectedProduct.name}</p>
                                    )}
                                </div>

                                {/* Price and Category Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Price
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                value={editForm.price}
                                                onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                            />
                                        ) : (
                                            <p className="text-gray-800 font-semibold">{selectedProduct.price}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Category
                                        </label>
                                        {isEditing ? (
                                            <select
                                                value={editForm.category}
                                                onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                            >
                                                <option value="Clothing">Clothing</option>
                                                <option value="Accessories">Accessories</option>
                                                <option value="Jewelry">Jewelry</option>
                                                <option value="Fabrics">Fabrics</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        ) : (
                                            <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                                                {selectedProduct.category}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Stock */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Stock Quantity
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            value={editForm.stock}
                                            onChange={(e) => setEditForm({...editForm, stock: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        />
                                    ) : (
                                        getStockBadge(selectedProduct.stock)
                                    )}
                                </div>

                                {/* Vendor */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Vendor
                                    </label>
                                    <p className="text-gray-800">{selectedProduct.vendor || 'N/A'}</p>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    {isEditing ? (
                                        <textarea
                                            value={editForm.description}
                                            onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                            rows="4"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <p className="text-gray-600">{selectedProduct.description || 'No description available'}</p>
                                    )}
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                                        <Star className="mx-auto mb-1 text-yellow-500" size={20} />
                                        <p className="text-xs text-gray-600">Rating</p>
                                        <p className="font-semibold text-gray-800">{selectedProduct.rating || 'N/A'}</p>
                                    </div>
                                    <div className="text-center p-3 bg-emerald-50 rounded-lg">
                                        <DollarSign className="mx-auto mb-1 text-emerald-600" size={20} />
                                        <p className="text-xs text-gray-600">Sales</p>
                                        <p className="font-semibold text-gray-800">{selectedProduct.sales || 0} sold</p>
                                    </div>
                                    <div className="text-center p-3 bg-blue-50 rounded-lg col-span-2 md:col-span-1">
                                        <Package className="mx-auto mb-1 text-blue-600" size={20} />
                                        <p className="text-xs text-gray-600">Status</p>
                                        <p className="font-semibold text-gray-800">{selectedProduct.status || 'active'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                            disabled={actionLoading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleEditProduct}
                                            disabled={actionLoading}
                                            className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                                        >
                                            <Save size={16} />
                                            {actionLoading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleDeleteProduct}
                                            disabled={actionLoading}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                        >
                                            <Trash2 size={16} />
                                            {actionLoading ? 'Deleting...' : 'Delete Product'}
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            <Edit size={16} />
                                            Edit Product
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default AdminProducts;