import { useState } from "react";

function PaymentPage() {
  const [amount, setAmount] = useState(500);

  // ✅ Create Razorpay order
  const createOrder = async () => {
    const res = await fetch("http://localhost:8089/api/payment/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amount }),
    });

    return await res.json(); // order details from backend
  };

  // ✅ Handle Razorpay Payment
  const handlePayment = async () => {
    const order = await createOrder();

    const options = {
      key: order.key, // from backend
      amount: order.amount,
      currency: order.currency,
      name: "Paripakv Store",
      description: "Crop Purchase Payment",
      order_id: order.id,
      handler: async function (response) {
        // Call backend to verify
        const verifyRes = await fetch("http://localhost:8089/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response),
        });

        const result = await verifyRes.text();
        alert(result);
      },
      prefill: {
        name: "Karan",
        email: "karan@example.com",
        contact: "9876543210",
      },
      theme: { color: "#3399cc" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Paripakv Payment</h1>

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="border px-4 py-2 rounded-md shadow-sm"
        placeholder="Enter amount"
      />

      <button
        onClick={handlePayment}
        className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Pay Now
      </button>
    </div>
  );
}

export default PaymentPage;
