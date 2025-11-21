import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./Pages/Homepage";
import SignUpPage from "./components/Sign-up";
import Login from "./components/login";
import Product from "./Pages/Product";
import ProductDetail from "./Pages/ProductDetail";
import Checkout from "./Pages/Checkout";
import Order from "./Pages/Order";
import VendorProfilePage from "./Pages/Vendorpage";
import VendorDetail from "./Pages/VendorDetail";
import Vendor1 from "./Vendors/Vendor1";
import VendorDashboard from "./Dashboard/VendorDashboardNew";
import Contact from "./Pages/Contact";
import ResetPassword from "./components/ResetPassword";
import VendorOverview from "./Dashboard/VendorOverview";
import VendorProducts from "./Dashboard/VendorProducts";
import VendorOrders from "./Dashboard/VendorOrders";
import VendorMessages from "./Dashboard/VendorMessages";
import VendorSettings from "./Dashboard/VendorSettings";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/forgot_password" element={<ResetPassword />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/create-account" element={<Login />} />
        <Route path="/product" element={<Product />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order" element={<Order />} />
        <Route path="/vendors" element={<VendorProfilePage />} />
        <Route path="/vendor/:vendorId" element={<VendorDetail />} />
        <Route path="/Vendorpage1" element={<Vendor1 />} />
        <Route path="/VendorDashboard" element={<VendorDashboard />} />
        <Route path="/contact" element={<Contact />} />
        
        {/* Vendor Dashboard Routes */}
        <Route path="/vendor/overview" element={<VendorOverview />} />
        <Route path="/vendor/products" element={<VendorProducts />} />
        <Route path="/vendor/orders" element={<VendorOrders />} />
        <Route path="/vendor/messages" element={<VendorMessages />} />
        <Route path="/vendor/settings" element={<VendorSettings />} />
      </Routes>
    </Router>
  );
}

export default App;