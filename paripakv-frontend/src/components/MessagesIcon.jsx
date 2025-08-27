// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import ChatService from '../services/ChatService';
// import { useAuth } from '../context/AuthContext';

// const MessagesIcon = () => {
//     const navigate = useNavigate();
//     const [unreadCount, setUnreadCount] = useState(0);
//     const [loading, setLoading] = useState(false);
//     const { currentUser, userId } = useAuth();

//     // Memoize the loadUnreadCount function to prevent unnecessary re-renders
//     const loadUnreadCount = useCallback(async () => {
//         if (!currentUser || !userId || loading) return;

//         try {
//             setLoading(true);

//             // Try to get unread count from API first
//             let totalUnread = 0;

//             try {
//                 totalUnread = await ChatService.getUnreadCount();
//             } catch (error) {
//                 console.warn('Failed to get unread count from API, falling back to chats method');

//                 // Fallback: calculate from chats
//                 try {
//                     const chats = await ChatService.getUserChats();
//                     totalUnread = chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
//                 } catch (chatsError) {
//                     console.error('Failed to load chats for unread count:', chatsError);
//                     totalUnread = 0;
//                 }
//             }

//             setUnreadCount(Math.max(0, totalUnread)); // Ensure non-negative

//         } catch (error) {
//             console.error('Error loading unread count:', error);
//             setUnreadCount(0);
//         } finally {
//             setLoading(false);
//         }
//     }, [currentUser, userId, loading]);

//     useEffect(() => {
//         if (currentUser && userId) {
//             loadUnreadCount();

//             // Poll for new messages every 30 seconds
//             const interval = setInterval(() => {
//                 loadUnreadCount();
//             }, 30000);

//             return () => clearInterval(interval);
//         }
//     }, [currentUser, userId, loadUnreadCount]);

//     // Listen for storage events to sync across tabs
//     useEffect(() => {
//         const handleStorageChange = (e) => {
//             if (e.key === 'chat_update') {
//                 loadUnreadCount();
//             }
//         };

//         window.addEventListener('storage', handleStorageChange);
//         return () => window.removeEventListener('storage', handleStorageChange);
//     }, [loadUnreadCount]);

//     const handleClick = () => {
//         console.log('Messages icon clicked', currentUser);
//         if (!currentUser) {
//             navigate('/login', {
//                 state: {
//                     returnTo: '/messages',
//                     message: 'Please login to view your messages'
//                 }
//             });
//             return;
//         }

//         navigate('/messages');
//     };

//     const displayCount = unreadCount > 999 ? '999+' : unreadCount;

//     return (
//         <div
//             className="relative cursor-pointer p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex flex-col items-center space-y-1 group"
//             onClick={handleClick}
//             role="button"
//             tabIndex={0}
//             onKeyDown={(e) => {
//                 if (e.key === 'Enter' || e.key === ' ') {
//                     e.preventDefault();
//                     handleClick();
//                 }
//             }}
//             aria-label={`Messages ${unreadCount > 0 ? `(${displayCount} unread)` : ''}`}
//         >
//             <div className="relative">
//                 <div className="text-2xl group-hover:scale-110 transition-transform duration-200">
//                     💬
//                 </div>
//                 {unreadCount > 0 && (
//                     <div
//                         className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-semibold animate-pulse"
//                         style={{
//                             fontSize: unreadCount > 99 ? '10px' : '11px',
//                             minWidth: unreadCount > 99 ? '22px' : '18px'
//                         }}
//                     >
//                         {displayCount}
//                     </div>
//                 )}
//                 {loading && (
//                     <div className="absolute -top-1 -right-1 w-3 h-3">
//                         <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//                     </div>
//                 )}
//             </div>
//             <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-200">
//                 Messages
//             </span>
//         </div>
//     );
// };

// export default MessagesIcon;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatService from '../services/ChatService';
import { useAuth } from '../context/AuthContext';

const MessagesIcon = () => {
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);
    const { currentUser } = useAuth();

    useEffect(() => {
        console.log('MessagesIcon currentUser:', currentUser);
        if (currentUser) {
            loadUnreadCount();

            // Poll for new messages every 30 seconds
            const interval = setInterval(loadUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [currentUser]);

    const loadUnreadCount = async () => {
        try {
            const chats = await ChatService.getUserChats();
            const totalUnread = chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
            setUnreadCount(totalUnread);
        } catch (error) {
            console.error('Error loading unread count:', error);
        }
    };

    const handleClick = () => {
        navigate('/messages');
    };

    return (
        <div
            className="relative cursor-pointer p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex flex-col items-center space-y-1"
            onClick={handleClick}
        >
            <div className="relative">
                <div className="text-2xl">💬</div>
                {unreadCount > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-semibold">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </div>
                )}
            </div>
            <span className="text-sm font-medium text-gray-700">Messages</span>
        </div>
    );
};

export default MessagesIcon;