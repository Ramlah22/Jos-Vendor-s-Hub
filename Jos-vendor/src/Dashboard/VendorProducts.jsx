import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, Package, X, Upload, Eye, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc, Timestamp } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VendorSidebar from "../components/VendorSidebar";

// ProductModal component moved outside to prevent recreation on each render
const ProductModal = ({ 
  showModal, 
  editingProduct, 
  productForm, 
  updateProductForm, 
  categories, 
  imageFile, 
  setImageFile, 
  loading, 
  onSubmit, 
  onClose 
}) => {
  if (!showModal) return null;

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name || ""}
                    onChange={(e) => updateProductForm('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    placeholder="Enter product name"
                    maxLength={100}
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={productForm.description || ""}
                    onChange={(e) => updateProductForm('description', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    rows="4"
                    placeholder="Enter product description"
                    maxLength={500}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₦) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={productForm.price || ""}
                      onChange={(e) => updateProductForm('price', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={productForm.stock || ""}
                      onChange={(e) => updateProductForm('stock', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={productForm.category || ""}
                    onChange={(e) => updateProductForm('category', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                    <input
                      type="text"
                      value={productForm.brand || ""}
                      onChange={(e) => updateProductForm('brand', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                      placeholder="Brand name"
                      maxLength={50}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                    <input
                      type="text"
                      value={productForm.sku || ""}
                      onChange={(e) => updateProductForm('sku', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                      placeholder="Stock Keeping Unit"
                      maxLength={50}
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-500 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          
                          // Validate file size (2MB limit for Firestore)
                          if (file.size > 2 * 1024 * 1024) {
                            toast.error("Image size must be less than 2MB for Firestore storage");
                            e.target.value = '';
                            return;
                          }
                          
                          // Validate file type
                          if (!file.type.startsWith('image/')) {
                            toast.error("Please select a valid image file");
                            e.target.value = '';
                            return;
                          }
                          
                          setImageFile(file);
                        }
                      }}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      {productForm.imageUrl && !imageFile ? (
                        <div className="space-y-2">
                          <img src={productForm.imageUrl} alt="Product" className="mx-auto h-32 w-32 object-cover rounded-lg" />
                          <p className="text-sm text-gray-600">Click to change image</p>
                        </div>
                      ) : imageFile ? (
                        <div className="space-y-2">
                          <Upload className="mx-auto h-12 w-12 text-emerald-500" />
                          <p className="text-sm text-gray-900 font-medium">{imageFile.name}</p>
                          <p className="text-xs text-gray-500">Click to change</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="text-sm text-gray-600">Click to upload image</p>
                          <p className="text-xs text-gray-400">PNG, JPG up to 2MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                    <input
                      type="text"
                      value={productForm.weight || ""}
                      onChange={(e) => updateProductForm('weight', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                      placeholder="e.g. 1.5"
                      maxLength={20}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions (cm)</label>
                    <input
                      type="text"
                      value={productForm.dimensions || ""}
                      onChange={(e) => updateProductForm('dimensions', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                      placeholder="e.g. 10x20x5"
                      maxLength={30}
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                    <input
                      type="text"
                      value={productForm.color || ""}
                      onChange={(e) => updateProductForm('color', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                      placeholder="e.g. Red, Blue"
                      maxLength={50}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
                    <input
                      type="text"
                      value={productForm.material || ""}
                      onChange={(e) => updateProductForm('material', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                      placeholder="e.g. Cotton, Leather"
                      maxLength={50}
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <input
                    type="text"
                    value={productForm.tags || ""}
                    onChange={(e) => updateProductForm('tags', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    placeholder="e.g. summer, sale, trending (comma separated)"
                    maxLength={100}
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-emerald-700 disabled:bg-emerald-400 transition flex items-center justify-center"
              >
                {loading ? "Saving..." : (editingProduct ? "Update Product" : "Add Product")}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function VendorProducts() {
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    imageUrl: "",
    brand: "",
    weight: "",
    dimensions: "",
    color: "",
    material: "",
    tags: "",
    sku: "",
  });

  const categories = ["Clothing", "Jewelry", "Accessories", "Home Decor", "Electronics", "Food & Beverages", "Beauty & Health", "Sports & Fitness", "Books & Media", "Toys & Games", "Other"];

  // Function to convert image file to base64
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // Safe form update function
  const updateProductForm = useCallback((field, value) => {
    setProductForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setVendor(parsedUser);

      if (parsedUser.uid) {
        loadProducts(parsedUser.uid);
      }
    } else {
      navigate('/sign-in');
    }
  }, [navigate]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, filterCategory]);

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory) {
      filtered = filtered.filter(product => product.category === filterCategory);
    }

    setFilteredProducts(filtered);
  };

  const loadProducts = async (vendorId) => {
    try {
      setLoading(true);
      const q = query(collection(db, "products"), where("vendorId", "==", vendorId));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const productsList = [];
        snapshot.forEach((doc) => {
          productsList.push({ id: doc.id, ...doc.data() });
        });
        setProducts(productsList);
        setLoading(false);
      });
      return unsubscribe;
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
      setLoading(false);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!vendor?.uid) return;

    try {
      setLoading(true);
      let imageUrl = productForm.imageUrl;
      
      if (imageFile) {
        // Validate file size (2MB limit for base64 storage)
        if (imageFile.size > 2 * 1024 * 1024) {
          toast.error("Image size must be less than 2MB for Firestore storage");
          setLoading(false);
          return;
        }
        
        // Validate file type
        if (!imageFile.type.startsWith('image/')) {
          toast.error("Please select a valid image file");
          setLoading(false);
          return;
        }

        // Convert image to base64
        try {
          imageUrl = await convertImageToBase64(imageFile);
          toast.success("Image processed successfully!");
        } catch (error) {
          toast.error("Failed to process image");
          setLoading(false);
          return;
        }
      }

      const productData = {
        ...productForm,
        imageUrl,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        weight: productForm.weight || null,
        dimensions: productForm.dimensions || null,
        color: productForm.color || null,
        material: productForm.material || null,
        tags: productForm.tags || null,
        brand: productForm.brand || null,
        sku: productForm.sku || null,
      };

      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), {
          ...productData,
          updatedAt: Timestamp.now(),
        });
        toast.success("Product updated successfully!");
      } else {
        await addDoc(collection(db, "products"), {
          ...productData,
          vendorId: vendor.uid,
          vendorName: vendor.businessName || vendor.vendorName || vendor.displayName,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          isActive: true,
        });
        toast.success("Product added successfully!");
      }

      setShowProductModal(false);
      resetProductForm();
      setImageFile(null);
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;

    try {
      setLoading(true);
      await deleteDoc(doc(db, "products", productId));
      toast.success("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      category: product.category || "",
      stock: product.stock?.toString() || "",
      imageUrl: product.imageUrl || "",
      brand: product.brand || "",
      weight: product.weight || "",
      dimensions: product.dimensions || "",
      color: product.color || "",
      material: product.material || "",
      tags: product.tags || "",
      sku: product.sku || "",
    });
    setImageFile(null);
    setShowProductModal(true);
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      imageUrl: "",
      brand: "",
      weight: "",
      dimensions: "",
      color: "",
      material: "",
      tags: "",
      sku: "",
    });
    setImageFile(null);
  };

  const handleModalClose = useCallback(() => {
    setShowProductModal(false);
    resetProductForm();
  }, []);

  const ProductDetailsModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
            <button 
              onClick={() => setShowProductDetails(false)} 
              className="text-gray-500 hover:text-gray-700 transition"
            >
              <X size={24} />
            </button>
          </div>

          {selectedProduct && (
            <div className="space-y-6">
              {selectedProduct.imageUrl && (
                <img 
                  src={selectedProduct.imageUrl} 
                  alt={selectedProduct.name} 
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Product Name</h3>
                  <p className="text-gray-600">{selectedProduct.name}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Price</h3>
                  <p className="text-emerald-600 font-bold">₦{selectedProduct.price?.toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Category</h3>
                  <p className="text-gray-600">{selectedProduct.category}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Stock</h3>
                  <p className="text-gray-600">{selectedProduct.stock}</p>
                </div>
                {selectedProduct.brand && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Brand</h3>
                    <p className="text-gray-600">{selectedProduct.brand}</p>
                  </div>
                )}
                {selectedProduct.sku && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">SKU</h3>
                    <p className="text-gray-600">{selectedProduct.sku}</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{selectedProduct.description}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowProductDetails(false);
                    handleEditProduct(selectedProduct);
                  }}
                  className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition"
                >
                  Edit Product
                </button>
                <button
                  onClick={() => setShowProductDetails(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <VendorSidebar />

      <div className="lg:ml-64 transition-all duration-300 p-4 sm:p-6 pt-16 lg:pt-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">My Products</h2>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your product inventory</p>
            </div>
            <button
              onClick={() => setShowProductModal(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-emerald-700 transition text-sm sm:text-base"
            >
              <Plus size={20} />
              Add Product
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                autoComplete="off"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                {products.length === 0 ? "No products yet" : "No products match your search"}
              </p>
              <button
                onClick={() => setShowProductModal(true)}
                className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition"
              >
                {products.length === 0 ? "Add Your First Product" : "Add New Product"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-48 object-cover cursor-pointer"
                      onClick={() => handleViewProduct(product)}
                    />
                  ) : (
                    <div 
                      className="w-full h-48 bg-gray-200 flex items-center justify-center cursor-pointer"
                      onClick={() => handleViewProduct(product)}
                    >
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                    
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-lg font-bold text-emerald-600">
                        ₦{product.price?.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-600">Stock: {product.stock}</span>
                    </div>

                    {product.category && (
                      <div className="mb-3">
                        <span className="inline-block bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                          {product.category}
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewProduct(product)}
                        className="flex-1 flex items-center justify-center gap-2 bg-gray-50 text-gray-600 py-2 rounded-lg hover:bg-gray-100 transition"
                      >
                        <Eye size={16} />
                        
                      </button>
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition"
                      >
                        <Edit size={16} />
                        
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition"
                      >
                        <Trash2 size={16} />
                        
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {products.length > 0 && (
            <div className="mt-6 text-center text-sm text-gray-500">
              Showing {filteredProducts.length} of {products.length} products
            </div>
          )}
        </div>
      </div>

      <ProductModal 
        showModal={showProductModal}
        editingProduct={editingProduct}
        productForm={productForm}
        updateProductForm={updateProductForm}
        categories={categories}
        imageFile={imageFile}
        setImageFile={setImageFile}
        loading={loading}
        onSubmit={handleSaveProduct}
        onClose={handleModalClose}
      />
      {showProductDetails && <ProductDetailsModal />}
    </div>
  );
}
