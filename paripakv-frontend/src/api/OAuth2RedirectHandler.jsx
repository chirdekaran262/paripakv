import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Cookies from 'js-cookie';
function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default function OAuth2RedirectHandler() {
    const query = useQuery();
    const token = query.get('token');
    const { login } = useAuth();
    const navigate = useNavigate();
    Cookies.set('token', token, { expires: 7 }); // Store token in cookies for 7 days
    useEffect(() => {
        if (token) {
            login(token); // depends on your `login` function in AuthContext
            navigate('/listings');
        } else {
            alert('Login failed. Token not found.');
            navigate('/login');
        }
    }, []);

    return <div className="text-center mt-20 text-lg text-green-700">Redirecting, please wait...</div>;
}
