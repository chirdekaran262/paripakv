import { useEffect, useState } from "react";
import axios from "axios";
import {
  Truck,
  Loader2,
  PackageSearch,
  MapPin,
  Clock,
  User,
  Package,
  Route,
  Wheat,
  Apple,
  Carrot,
  Phone,
  Calendar,
  Navigation,
  DollarSign
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Cookies from "js-cookie";
import Header from "../components/Header";

export default function TransporterOrderFeed() {
  const { userId, userRole } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingOrder, setAcceptingOrder] = useState(null);
  const token = Cookies.get("token");
  const [farmers, setFarmers] = useState({});
  const [listings, setListings] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/orders/transporter/feed`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const pendingOrders = res.data.filter(
          (order) => order.status === "CONFIRMED" && !order.transporterId
        );
        setOrders(pendingOrders);
        await fetchAdditionalData(pendingOrders);
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchAdditionalData = async (ordersData) => {
      const uniqueListingIds = [...new Set(ordersData.map(order => order.listingId))];

      const listingPromises = uniqueListingIds.map(async (listingId) => {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/listings/byId?id=${listingId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          return { id: listingId, data: res.data };
        } catch (err) {
          return null;
        }
      });

      const listingResults = await Promise.all(listingPromises);
      const listingsData = {};
      const farmerIds = [];

      listingResults.forEach(result => {
        if (result && result.data) {
          listingsData[result.id] = result.data;
          if (result.data.farmerId) {
            farmerIds.push(result.data.farmerId);
          }
        }
      });

      setListings(listingsData);

      const uniqueFarmerIds = [...new Set(farmerIds)];
      const farmerPromises = uniqueFarmerIds.map(async (farmerId) => {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/productDetails?id=${farmerId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          return { id: farmerId, data: res.data };
        } catch (err) {
          return null;
        }
      });

      const farmerResults = await Promise.all(farmerPromises);
      const farmersData = {};

      farmerResults.forEach(result => {
        if (result && result.data) {
          farmersData[result.id] = result.data;
        }
      });

      setFarmers(farmersData);
    };

    if (userRole === "TRANSPORTER") {
      fetchOrders();
    }
  }, [userRole, token]);

  const getProductIcon = (productName) => {
    const name = productName?.toLowerCase() || '';
    if (name.includes('wheat') || name.includes('grain') || name.includes('rice')) return <Wheat className="w-5 h-5 text-yellow-600" />;
    if (name.includes('apple') || name.includes('fruit')) return <Apple className="w-5 h-5 text-red-500" />;
    if (name.includes('carrot') || name.includes('vegetable')) return <Carrot className="w-5 h-5 text-orange-500" />;
    return <Package className="w-5 h-5 text-emerald-600" />;
  };

  const calculateDistance = (pickup, delivery) => {
    return Math.floor(Math.random() * 50) + 10;
  };

  const estimateDeliveryTime = () => {
    return Math.floor(Math.random() * 4) + 2;
  };

  const calculateEarnings = () => {
    return Math.floor(Math.random() * 500) + 200;
  };

  const handlePickup = async (orderId) => {
    setAcceptingOrder(orderId);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/orders/transporter/orders/${orderId}/pickup?transporterId=${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOrders((prev) => prev.filter((o) => o.id !== orderId));

      const notification = document.createElement('div');
      notification.className = 'fixed top-6 right-6 bg-emerald-600 text-white px-6 py-4 rounded-lg shadow-xl z-50 flex items-center gap-3';
      notification.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span class="font-medium">Order accepted successfully!</span>
      `;
      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }, 3500);

    } catch (err) {
      console.error("Failed to assign order", err);
      alert("Failed to accept order. Please try again.");
    } finally {
      setAcceptingOrder(null);
    }
  };

  const getFarmerForOrder = (order) => {
    const listing = listings[order.listingId];
    if (listing && listing.farmerId) {
      return farmers[listing.farmerId];
    }
    return null;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50">
          <div className="flex flex-col items-center justify-center h-screen">
            <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100">
              <div className="flex flex-col items-center">
                <Loader2 className="animate-spin text-emerald-600 w-12 h-12 mb-6" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Orders</h3>
                <p className="text-gray-600 text-center">Fetching available deliveries...</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!orders.length) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50">
          <div className="flex flex-col items-center justify-center h-screen">
            <div className="bg-white rounded-2xl p-16 shadow-lg border border-gray-100 text-center max-w-md">
              <div className="bg-gray-100 rounded-full p-8 w-32 h-32 mx-auto mb-8 flex items-center justify-center">
                <PackageSearch className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No Orders Available</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                All deliveries are currently assigned. Check back soon for new opportunities.
              </p>
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                <p className="text-emerald-700 text-sm font-medium text-black">
                  💡 New orders typically arrive during business hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-r from-green-600 via-lime-400 to-yellow-300">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-lime-600 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-600 p-3 rounded-xl">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Available Deliveries</h1>
                  <p className="text-gray-600 mt-1">Fresh produce delivery opportunities</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-lime-600 border border-emerald-200 rounded-xl p-4 text-center min-w-[100px]">
                  <p className="text-2xl font-bold text-emerald-600">{orders.length}</p>
                  <p className="text-emerald-600 text-sm font-medium">Active Orders</p>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 border border-blue-200 rounded-xl p-4 text-center min-w-[100px]">
                  <p className="text-2xl font-bold text-white">4.8</p>
                  <p className="text-blue-200 text-sm font-medium">Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {orders.map((order) => {
              const farmer = getFarmerForOrder(order);
              const distance = calculateDistance(order.pickupLocation, order.deliveryAddress);
              const estimatedTime = estimateDeliveryTime();
              const earnings = calculateEarnings();

              return (
                <div
                  key={order.id}
                  className="bg-gradient-to-r from-green-500 via-emerald-500 to-lime-500 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="bg-emerald-600 p-6 text-black">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                          {getProductIcon(order.productName)}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-black">Order #{order.id}</h3>
                          <p className="text-emerald-100 text-sm">{order.productName}</p>
                        </div>
                      </div>
                      <div className="bg-white/20 px-3 py-1 rounded-full">
                        <span className="text-xs font-medium uppercase tracking-wide">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Content */}
                  <div className="p-6 space-y-6">
                    {/* Product & Earnings */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="w-4 h-4 text-gray-600" />
                          <span className="text-xs font-semibold text-gray-700 uppercase">Product</span>
                        </div>
                        <p className="font-bold text-gray-900">{order.productName}</p>
                        <p className="text-sm text-gray-600">{order.quantityKg || "N/A"} kg</p>
                      </div>
                      <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-4 h-4 text-yellow-600" />
                          <span className="text-xs font-semibold text-yellow-700 uppercase">Earnings</span>
                        </div>
                        <p className="font-bold text-yellow-700">₹{earnings}</p>
                        <p className="text-sm text-yellow-600">Estimated</p>
                      </div>
                    </div>

                    {/* Route Information */}
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-emerald-100 p-2 rounded-lg flex-shrink-0">
                          <MapPin className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-700 uppercase mb-1">Pickup</p>
                          <p className="font-medium text-gray-900 truncate">{farmer.address}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-center py-2">
                        <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                          <Route className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">{distance} km</span>
                          <Navigation className="w-4 h-4 text-gray-700" />
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                          <MapPin className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-700 uppercase mb-1">Delivery</p>
                          <p className="font-medium text-gray-900 truncate">{order.deliveryAddress}</p>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <Clock className="w-4 h-4 text-gray-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-500 font-medium">Time</p>
                        <p className="font-bold text-gray-900">{estimatedTime}h</p>
                      </div>
                      <div className="text-center bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <Calendar className="w-4 h-4 text-gray-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-500 font-medium">Priority</p>
                        <p className="font-bold text-gray-900">Standard</p>
                      </div>
                    </div>

                    {/* Farmer Contact */}
                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                      <div className="flex items-center gap-3">
                        <div className="bg-orange-100 p-2 rounded-lg">
                          <User className="w-4 h-4 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-orange-800">Farmer Contact</p>
                          <p className="text-orange-700 font-medium truncate">{farmer?.name || 'Loading...'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Phone className="w-3 h-3 text-orange-600" />
                            <span className="text-sm text-orange-600">{farmer?.mobile || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Accept Button */}
                    <button
                      onClick={() => handlePickup(order.id)}
                      disabled={acceptingOrder === order.id}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      {acceptingOrder === order.id ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Accepting...
                        </>
                      ) : (
                        <>
                          <Truck className="w-5 h-5" />
                          Accept Delivery
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 py-12 mt-16">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-2xl">🌾</span>
              <h3 className="text-xl font-bold text-gray-800">Supporting Local Agriculture</h3>
              <span className="text-2xl">🚛</span>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Connect farmers with customers through reliable delivery services.
              Join our network of trusted transporters making a difference in local communities.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}