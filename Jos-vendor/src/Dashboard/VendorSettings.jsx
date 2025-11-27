import { useState, useEffect } from "react";
import { Save, User, Mail, MapPin, Building, Phone, Camera, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VendorSidebar from "../components/VendorSidebar";

export default function VendorSettings() {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    vendorName: "",
    businessName: "",
    email: "",
    phone: "",
    businessLocation: "",
    businessCategory: "",
    businessDescription: "",
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setVendor(parsedUser);
      setFormData({
        vendorName: parsedUser.vendorName || "",
        businessName: parsedUser.businessName || "",
        email: parsedUser.email || "",
        phone: parsedUser.phone || "",
        businessLocation: parsedUser.businessLocation || "",
        businessCategory: parsedUser.businessCategory || "",
        businessDescription: parsedUser.businessDescription || "",
      });
    } else {
      navigate('/sign-in');
    }
  }, [navigate]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!vendor?.uid) {
      toast.error("User information not found. Please sign in again.");
      return;
    }

    setLoading(true);
    try {
      // Sanitize and validate form data
      const sanitizedData = {
        vendorName: formData.vendorName?.trim() || "",
        businessName: formData.businessName?.trim() || "",
        phone: formData.phone?.trim() || "",
        businessLocation: formData.businessLocation?.trim() || "",
        businessCategory: formData.businessCategory?.trim() || "",
        businessDescription: formData.businessDescription?.trim() || "",
        updatedAt: new Date(),
      };

      // Validate required fields
      if (!sanitizedData.vendorName) {
        toast.error("Vendor name is required");
        setLoading(false);
        return;
      }

      if (!sanitizedData.businessName) {
        toast.error("Business name is required");
        setLoading(false);
        return;
      }

      // Check if document exists, if not create it
      const vendorDocRef = doc(db, "vendors", vendor.uid);
      const vendorDoc = await getDoc(vendorDocRef);
      
      if (!vendorDoc.exists()) {
        // Create new vendor document
        const newVendorData = {
          ...sanitizedData,
          uid: vendor.uid,
          email: vendor.email || formData.email,
          role: "vendor",
          createdAt: new Date(),
        };
        await setDoc(vendorDocRef, newVendorData);
      } else {
        // Update existing document
        await updateDoc(vendorDocRef, sanitizedData);
      }

      // Update localStorage
      const updatedUser = { ...vendor, ...sanitizedData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setVendor(updatedUser);

      toast.success("Settings updated successfully!");
    } catch (error) {
      console.error("Error updating settings:", error);
      
      // More specific error handling
      if (error.code === 'not-found') {
        toast.error("Vendor document not found. Please contact support.");
      } else if (error.code === 'permission-denied') {
        toast.error("Permission denied. Please check your authentication.");
      } else if (error.code === 'invalid-argument') {
        toast.error("Invalid data provided. Please check your inputs.");
      } else if (error.message?.includes('document too large')) {
        toast.error("Document too large. Please reduce the amount of data.");
      } else {
        toast.error(`Failed to update settings: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Allow up to 5MB input; we'll compress before saving to Firestore
    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error("File exceeds 5MB limit");
      return;
    }
    setPhotoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Convert selected file to a compressed data URL suitable for Firestore storage with robust error handling
  const fileToCompressedDataUrl = (file, maxSize = 256, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      // Basic validation
      if (!file.type.startsWith('image/')) {
        return reject(new Error('Selected file is not an image'));
      }
      const allowed = ['image/jpeg','image/jpg','image/png','image/webp'];
      if (!allowed.includes(file.type)) {
        return reject(new Error('Unsupported image format. Please use JPG, PNG or WebP'));
      }

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const dataUrlOriginal = reader.result;
          // Try createImageBitmap first (better decoding); fallback to <img>
          let bitmap;
          try {
            if ('createImageBitmap' in window) {
              bitmap = await createImageBitmap(file);
            } else {
              bitmap = null;
            }
          } catch (e) {
            bitmap = null;
          }

          // Fallback using Image element with Object URL (more robust than data URL for large files)
          const loadViaImageElement = () => new Promise((res, rej) => {
            const img = new Image();
            // For local files, CORS is not required, but set anonymous defensively
            img.crossOrigin = 'anonymous';
            const objectUrl = URL.createObjectURL(file);
            img.onload = () => {
              URL.revokeObjectURL(objectUrl);
              res(img);
            };
            img.onerror = (ev) => {
              URL.revokeObjectURL(objectUrl);
              rej(ev);
            };
            img.src = objectUrl;
          });

          let sourceImage = bitmap;
          if (!sourceImage) {
            sourceImage = await loadViaImageElement();
          }

          let width = sourceImage.width;
          let height = sourceImage.height;
          if (width === 0 || height === 0) {
            // Corrupt image fallback
            return reject(new Error('Image decode failed (empty dimensions)'));
          }
          // Constrain within maxSize while keeping aspect ratio
          if (width > height && width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else if (height >= width && height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas context unavailable'));
          ctx.drawImage(sourceImage, 0, 0, width, height);

          const compressed = canvas.toDataURL('image/jpeg', quality);
          // If compression somehow produced a larger string, fallback to original
          if (compressed.length > dataUrlOriginal.length) {
            resolve(dataUrlOriginal);
          } else {
            resolve(compressed);
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read the file'));
      reader.readAsDataURL(file);
    });
  };

  const handleUploadPhoto = async () => {
    if (!photoFile) {
      toast.error("Select a file first");
      return;
    }
    if (!vendor?.uid) {
      toast.error("User information not found. Please sign in again.");
      return;
    }
    
    setUploadingPhoto(true);
    try {
      // Compress to data URL for Firestore
      const dataUrl = await fileToCompressedDataUrl(photoFile, 256, 0.8);
      
      // Firestore doc limit ~1MB. Keep below ~900KB margin
      const approxBytes = Math.ceil((dataUrl.length * 3) / 4); // rough base64 to bytes
      if (approxBytes > 900 * 1024) {
        toast.error("Image still too large after compression. Try a smaller image.");
        setUploadingPhoto(false);
        return;
      }

      // Check if document exists, if not create it first
      const vendorDocRef = doc(db, "vendors", vendor.uid);
      const vendorDoc = await getDoc(vendorDocRef);
      
      if (!vendorDoc.exists()) {
        // Create new vendor document with photo
        const newVendorData = {
          uid: vendor.uid,
          email: vendor.email || formData.email,
          vendorName: formData.vendorName || vendor.vendorName || "",
          businessName: formData.businessName || vendor.businessName || "",
          role: "vendor",
          photoData: dataUrl,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await setDoc(vendorDocRef, newVendorData);
      } else {
        // Update existing document with photo
        await updateDoc(vendorDocRef, { 
          photoData: dataUrl, 
          updatedAt: new Date() 
        });
      }
      
      const updatedUser = { ...vendor, photoData: dataUrl };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setVendor(updatedUser);
      
      toast.success("Profile photo updated successfully!");
      setPhotoFile(null);
      setPreviewUrl("");
    } catch (err) {
      console.error("Photo save error", err);
      
      if (err?.message === 'Selected file is not an image') {
        toast.error('Please choose a valid image file');
      } else if (err?.message?.startsWith('Unsupported image format')) {
        toast.error('Unsupported image format. Use JPG, PNG, or WebP');
      } else if (err instanceof Event) {
        toast.error('Failed to decode image. Try a smaller JPG/PNG/WebP file');
      } else if (err.code === 'not-found') {
        toast.error("Vendor document not found. Please contact support.");
      } else if (err.code === 'permission-denied') {
        toast.error("Permission denied. Please check your authentication.");
      } else {
        toast.error(err?.message || 'Failed to save photo');
      }
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />
      <VendorSidebar />

      <div className="lg:ml-64 transition-all duration-300 p-4 sm:p-6 pt-16 lg:pt-6">
        <div className="max-w-4xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Settings</h1>

          {/* Profile Picture Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Picture</h2>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-emerald-100 flex items-center justify-center">
                { (previewUrl || vendor?.photoData || vendor?.photoURL) ? (
                  <img
                    src={previewUrl || vendor.photoData || vendor.photoURL}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-emerald-600" />
                ) }
              </div>
              <div className="space-y-2">
                <input
                  id="profileFile"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => document.getElementById('profileFile').click()}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
                  >
                    <Camera size={20} />
                    {photoFile ? 'Change Photo' : 'Choose Photo'}
                  </button>
                  <button
                    type="button"
                    disabled={!photoFile || uploadingPhoto}
                    onClick={handleUploadPhoto}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingPhoto ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                    {uploadingPhoto ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
                <p className="text-sm text-gray-500">JPG, PNG or GIF. Max size 2MB</p>
                {photoFile && !uploadingPhoto && (
                  <p className="text-xs text-gray-600">Ready to upload: {photoFile.name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Business Information</h2>

            <form onSubmit={handleSaveSettings} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      Vendor Name
                    </div>
                  </label>
                  <input
                    type="text"
                    value={formData.vendorName}
                    onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Building size={16} />
                      Business Name
                    </div>
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Your business name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
                      Email
                    </div>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Phone size={16} />
                      Phone Number
                    </div>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="+234 XXX XXX XXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      Business Location
                    </div>
                  </label>
                  <input
                    type="text"
                    value={formData.businessLocation}
                    onChange={(e) => setFormData({ ...formData, businessLocation: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="City, State"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Building size={16} />
                      Business Category
                    </div>
                  </label>
                  <select
                    value={formData.businessCategory}
                    onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Select category</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Jewelry">Jewelry</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Home Decor">Home Decor</option>
                    <option value="Food & Beverages">Food & Beverages</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description
                </label>
                <textarea
                  value={formData.businessDescription}
                  onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  rows="4"
                  placeholder="Tell customers about your business..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={20} />
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/vendor/overview')}
                  className="w-full sm:w-auto bg-gray-200 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
