import { useState } from "react";
import axios from "axios";

export default function OrderForm({ productId }) {
    const [quantity, setQuantity] = useState('');
    const [villageName, setVillageName] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:8080/orders', {
                productId,
                quantity,
                villageName
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            alert("Order placed successfully!");
            // Optional: redirect or clear form
        } catch (err) {
            console.error("Order Error:", err);
            alert("Failed to place order.");
        }
    };

    const handleVillageInput = async (e) => {
        const value = e.target.value;
        setVillageName(value);
        if (value.length > 2) {
            const { data } = await axios.get(`https://api.opencagedata.com/geocode/v1/json`, {
                params: {
                    q: value,
                    key: "53cb118d16df41d0b048e5c954f567bb",
                    countrycode: "in",
                    limit: 5
                }
            });
            const results = data.results.map(result => result.formatted);
            setSuggestions(results);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (value) => {
        setVillageName(value);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded p-4 max-w-md mx-auto">
            <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Quantity</label>
                <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                    required
                />
            </div>

            <div className="mb-4 relative">
                <label className="block text-gray-700 font-bold mb-2">Village Name</label>
                <input
                    type="text"
                    value={villageName}
                    onChange={handleVillageInput}
                    className="w-full px-3 py-2 border rounded"
                    required
                />
                {showSuggestions && suggestions.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto mt-1">
                        {suggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="p-2 cursor-pointer hover:bg-green-100"
                            >
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Place Order
            </button>
        </form>
    );
}
