import { Mail, Lock, Loader, User, Store } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PricingModal from './PricingModal';


const SignInPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("customer");
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Submitting login', loginForm, 'as', selectedRole);
    setLoading(true);
    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginForm.email,
        loginForm.password
      );

      const user = userCredential.user;
      console.log('Firebase user logged in:', user.uid);

      // Get user data from Firestore based on selected role
      const collectionName = selectedRole === 'vendor' ? 'vendors' : 'customers';
      const userDoc = await getDoc(doc(db, collectionName, user.uid));

      if (!userDoc.exists()) {
        toast.error(`No ${selectedRole} account found with this email. Please check your role or sign up.`);
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      console.log('User data from Firestore:', userData);

      // Verify the role matches
      if (userData.role !== selectedRole) {
        toast.error(`This account is registered as a ${userData.role}, not a ${selectedRole}. Please select the correct role.`);
        setLoading(false);
        return;
      }

      // Save user info to localStorage
      localStorage.setItem('user', JSON.stringify({
        uid: user.uid,
        email: user.email,
        ...userData
      }));

      toast.success(`Welcome back, ${userData.vendorName || userData.fullName}!`);

      // Role-based redirect with pricing modal for vendors
      if (selectedRole === 'vendor') {
        setTimeout(() => {
          setLoading(false);
          setShowPricingModal(true);
        }, 1500);
      } else {
        setTimeout(() => {
          console.log('Redirecting to product page');
          navigate('/product');
        }, 1500);
      }
    } catch (err) {
      console.error('login error', err);
      if (err.code === 'auth/user-not-found') {
        toast.error("No account found with this email. Please sign up first.");
      } else if (err.code === 'auth/wrong-password') {
        toast.error("Incorrect password. Please try again.");
      } else if (err.code === 'auth/invalid-email') {
        toast.error("Invalid email address.");
      } else if (err.code === 'auth/user-disabled') {
        toast.error("This account has been disabled.");
      } else if (err.code === 'auth/invalid-credential') {
        toast.error("Invalid email or password. Please try again.");
      } else {
        toast.error(err.message || 'An error occurred during login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelection = (planId) => {
    console.log('Selected plan:', planId);
    // Here you can store the selected plan or make API calls
    // For now, we'll just navigate to dashboard
    toast.success(`${planId === 'pro' ? 'Pro Plan' : 'Pro Plus Plan'} selected! Starting your free trial.`);
    setTimeout(() => {
      navigate('/vendor/overview');
    }, 1500);
  };

  const handleSkipPricing = () => {
    setShowPricingModal(false);
    navigate('/vendor/overview');
  };

  return (
    <div className="min-h-screen bg-[#f2fcf6] flex items-center justify-center px-4">
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="bg-white shadow-lg rounded-3xl border border-green-200 p-8 w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="bg-green-700 p-4 rounded-md">
            <Mail className="text-white" size={32} />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome Back</h2>
        <p className="text-base text-gray-500 mb-6">Sign in to continue shopping</p>

        {/* Role Toggle Buttons */}
        <div className="flex justify-center mb-6 bg-[#e8f9f0] rounded-full p-1 w-full max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setSelectedRole("customer")}
            className={`flex items-center justify-center gap-2 w-1/2 py-2 rounded-l-full text-sm font-medium transition-all duration-300 ${
              selectedRole === "customer"
                ? "bg-green-700 text-white"
                : "text-gray-600"
            }`}
          >
            <User size={16} />
            Customer
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole("vendor")}
            className={`flex items-center justify-center gap-2 w-1/2 py-2 rounded-r-full text-sm font-medium transition-all duration-300 ${
              selectedRole === "vendor"
                ? "bg-green-700 text-white"
                : "text-gray-600"
            }`}
          >
            <Store size={16} />
            Vendor
          </button>
        </div>

        {/* Error display */}
        <form onSubmit={handleSubmit} className="text-left">
          <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            name="email"
            value={loginForm.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
            required
            className="w-full mb-6 px-4 bg-gray-100 py-1 border border-green-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <label className="block font-bold text-sm text-gray-700 mb-2">Password</label>
          <input
            type="password"
            name="password"
            value={loginForm.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            className="w-full mb-6 px-4 py-1 bg-gray-100 border border-green-100 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <div className="flex items-center justify-between mb-8">
            <label className="flex items-center text-sm text-gray-600">
              <input type="checkbox" className="mr-2 border-2 border-green-200 bg-gray-100" />
              Remember me
            </label>
            <Link to="/forgot_password" className="text-sm text-green-700 hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white py-2 rounded-md transition flex items-center justify-center gap-2"
          >
            {loading && <Loader size={16} className="animate-spin" />}
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="text-base text-gray-600 mt-6">
          Don’t have an account?{' '}
          <Link to="/create-account" className="text-green-700 hover:underline">
            Sign up
          </Link>
        </p>

        {/* Admin sign-in shortcut */}
        <p className="text-sm text-gray-500 mt-3">
          Admin?{' '}
          <Link to="/admin/login" className="text-green-700 hover:underline font-medium">
            Sign in here
          </Link>
        </p>
      </div>
      
      {/* Pricing Modal for Vendors */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={handleSkipPricing}
        onSelectPlan={handlePlanSelection}
      />
    </div>
  );
};

export default SignInPage;
