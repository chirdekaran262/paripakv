import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ContactFarmerButton = ({ product, farmer }) => {
  const navigate = useNavigate();
  const { currentUser, userRole, userId } = useAuth();

  const handleContact = () => {
    // Check if user is authenticated
    if (!currentUser || !userId) {
      // Redirect to login if not authenticated
      navigate('/login', {
        state: {
          returnTo: window.location.pathname,
          message: 'Please login to contact farmers'
        }
      });
      return;
    }

    // Check if user is a buyer
    if (userRole !== 'BUYER') {
      alert('Only buyers can contact farmers');
      return;
    }

    // Validate required data
    if (!farmer?.id || !product?.id) {
      console.error('Missing farmer or product data:', { farmer, product });
      alert('Unable to start conversation. Missing required information.');
      return;
    }

    // Don't allow farmers to contact themselves
    if (userId === farmer.id) {
      return;
    }

    try {
      console.log('Starting conversation with farmer:', {
        farmerId: farmer.id,
        productId: product.id,
        buyerId: userId
      });

      // Navigate to chat window
      navigate(`/chat/${farmer.id}/${product.id}`, {
        state: {
          otherUserName: farmer.name || farmer.username || 'Farmer',
          productName: product.name || product.title || 'Product',
          productImage: product.imageUrl || product.image || product.images?.[0]
        }
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Failed to start conversation. Please try again.');
    }
  };

  // Don't show button if current user is the farmer who owns the product
  if (currentUser && (userId === farmer?.id || userRole === 'FARMER')) {
    return null;
  }

  // Don't show button if required data is missing
  if (!farmer?.id || !product?.id) {
    return null;
  }

  return (
    <button
      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
      onClick={handleContact}
      type="button"
    >
      <span className="text-lg">💬</span>
      <span>Contact Farmer</span>
    </button>
  );
};

export default ContactFarmerButton;