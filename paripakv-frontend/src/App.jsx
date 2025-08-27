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
import './i18n'; // Import the i18n configuration
import i18n from "./i18n";
import { useTranslation } from 'react-i18next';
import FarmerChatPage from "./pages/FarmerChatPage";
import ChatPage from "./pages/chatPage";
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';

function App() {

  return (


    <Router>
      <AuthProvider>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px' }}>
          <label style={{ marginRight: '10px' }}>Language:</label>
          <select onChange={(e) => i18n.changeLanguage(e.target.value)} defaultValue={i18n.language}>
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="mr">मराठी</option>
            <option value="ta">தமிழ்</option>
            <option value="kn">ಕನ್ನಡ</option>
            <option value="te">తెలుగు</option>
          </select>
        </div>

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
          <Route path="/chat/:buyerId/:farmerId/:productId" element={<ChatPage />} />
          <Route path="/chat/farmer/:farmerId" element={<FarmerChatPage />} />
          <Route path="/messages" element={<ChatList />} />
          <Route path="/chat/:otherUserId/:productId" element={<ChatWindow />} />

          {/* Add more routes as needed */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
