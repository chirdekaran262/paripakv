
// import { createContext, useContext, useState, useEffect } from 'react';
// import axios from 'axios';
// import Cookies from 'js-cookie';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//     const [isAuthenticated, setIsAuthenticated] = useState(false);
//     const [userRole, setUserRole] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [userId, setUserId] = useState(null);
//     const [currUserAddress, setCurrUserAddress] = useState(null);
//     const [currentUser, setCurrentUser] = useState(null);
//     useEffect(() => {
//         const token = Cookies.get('token');
//         console.log('AuthProvider token:', token);
//         if (token) {
//             setIsAuthenticated(true);
//             axios.get(`${import.meta.env.VITE_API_URL}/users/profile`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`
//                 }
//             })
//                 .then(res => {
//                     console.log("User role:", res.data.role);
//                     setUserRole(res.data.role);
//                     setUserId(res.data.id); // Store user ID
//                     setCurrUserAddress(res.data.address); // Store current user address
//                     setCurrentUser(res.data); // Store entire user object
//                 })
//                 .catch(err => {
//                     console.error("Error fetching role:", err);
//                 })
//                 .finally(() => setLoading(false));
//         } else {
//             setIsAuthenticated(false);
//             setLoading(false);
//         }
//     }, []);

//     const login = (token) => {
//         Cookies.set('token', token, {
//             expires: 7,
//             path: '/',
//         });
//         console.log('Token set in cookies:', token);
//         setIsAuthenticated(true);

//         // Fetch role immediately after login
//         axios.get('http://localhost:8089/users/profile', {
//             headers: {
//                 Authorization: `Bearer ${token}`
//             }
//         })
//             .then(res => {
//                 console.log("Fetched role after login:", res.data.role);
//                 setUserRole(res.data.role);
//             })
//             .catch(err => {
//                 console.error("Error fetching role after login:", err);
//             });
//     };


//     const logout = () => {
//         Cookies.remove('token');
//         setIsAuthenticated(false);
//         setUserRole(null);
//     };

//     return (
//         <AuthContext.Provider value={{ isAuthenticated, login, logout, userRole, loading, userId, currUserAddress, currentUser }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => useContext(AuthContext);

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const [currUserAddress, setCurrUserAddress] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const token = Cookies.get('token');
        console.log('AuthProvider token:', token);

        if (token) {
            setIsAuthenticated(true);
            axios.get(`${import.meta.env.VITE_API_URL}/users/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => {
                    console.log("User role:", res.data.role);
                    setUserRole(res.data.role);
                    setUserId(res.data.id);
                    setCurrUserAddress(res.data.address);
                    setCurrentUser(res.data);
                })
                .catch(err => {
                    console.error("Error fetching role:", err);
                })
                .finally(() => setLoading(false));
        } else {
            setIsAuthenticated(false);
            setLoading(false);
        }
    }, []);

    const login = (token) => {
        Cookies.set('token', token, { expires: 7, path: '/' });
        console.log('Token set in cookies:', token);
        setIsAuthenticated(true);
        axios.get(`${import.meta.env.VITE_API_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                console.log("Fetched role after login:", res.data.role);
                setUserRole(res.data.role);
                setUserId(res.data.id);
                setCurrUserAddress(res.data.address);
                setCurrentUser(res.data);
            })
            .catch(err => {
                console.error("Error fetching role after login:", err);
            })
            .finally(() => setLoading(false));
    };

    const logout = () => {
        Cookies.remove('token');
        setIsAuthenticated(false);
        setUserRole(null);
        setUserId(null);
        setCurrUserAddress(null);
        setCurrentUser(null);
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated, login, logout, userRole, loading, userId, currUserAddress, currentUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
