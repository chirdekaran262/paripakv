import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword"; // Import the ForgotPassword component
import ProductListingForm from "./pages/ProductListingForm";
import ProductListingList from "./pages/ProductListingList";
import Profile from "./pages/Profile";
import OrderForm from "./pages/OrderFrom";
import ProductDetails from "./pages/ProductDetails";
import ManageOrders from "./pages/ManageOrders";
import OrderDetails from "./pages/OrderDetails"; // Import the OrderDetails component
import BuyerOrders from "./pages/BuyerOrders"; // Import the BuyerOrders component
import OrderDetailsBuyer from "./pages/OrderDetailsBuyer"; // Import the OrderDetailsBuyer component
import TransporterOrderFeed from "./pages/TransportOrderFeed";
import TransporterDashboard from "./pages/TransporterDashboard"; // Import the TransporterDashboard component
import { Toaster } from 'react-hot-toast';
import OAuth2RedirectHandler from "./api/OAuth2RedirectHandler"; // Import the OAuth2RedirectHandler component
import ResetPassword from "./pages/ResetPassword"; // Import the ResetPassword component
import CompleteProfile from "./pages/CompleteProfile"; // Import the CompleteProfile component
function App() {

  return (


    <Router>
      <AuthProvider>
        <Toaster position="top-center" reverseOrder={false} /> {/* ✅ Add this */}

        <Routes>

          <Route path="/" element={<ProductListingList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/listings/new" element={<ProductListingForm />} />
          <Route path="/listings" element={<ProductListingList />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders/add" element={<OrderForm />} />
          <Route path="/productDetails/:id" element={<ProductDetails />} />
          <Route path="/orders/manage" element={
            <ManageOrders />
          } />
          <Route path="/orderDetails/:id" element={<OrderDetails />} />
          <Route
            path="/buyer-orders/:buyerId"
            element={<BuyerOrders />}
          />
          <Route path="/order/:id" element={<OrderDetailsBuyer />} />
          <Route path="/transporter/orders" element={<TransporterOrderFeed />} />
          <Route path="/transporter/deliveries" element={<TransporterDashboard />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          {/* Add more routes as needed */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
