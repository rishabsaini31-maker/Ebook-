"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function PendingPaymentsReport() {
  const router = useRouter();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/");
      return;
    }
    fetchPayments();
  }, [router]);

  const fetchPayments = async () => {
    try {
      const token = Cookies.get("token");
      const response = await fetch("/api/pending-payments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (error) {
      console.error("Error fetching pending payments report:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString("en-IN")}`;
  };

  const getTotal = () => {
    return payments.reduce(
      (sum, payment) => sum + parseFloat(payment.amount || 0),
      0,
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center px-5 py-3 bg-gradient-to-r from-gray-800 to-gray-700 text-white shadow-lg">
        <button
          onClick={() => router.push("/dashboard")}
          className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Dashboard
        </button>
        <h2 className="text-3xl font-bold">Pending Payments Report</h2>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Report Content */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">
            Pending Payments
          </h3>
          <p className="text-xl mb-6 text-gray-700">
            Total:{" "}
            <span className="font-bold text-yellow-600">
              {formatCurrency(getTotal())}
            </span>
          </p>

          {payments.length === 0 ? (
            <p className="text-center text-gray-600 py-8">
              No pending payments recorded yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-yellow-600 text-white">
                    <th className="px-6 py-4 text-left font-semibold">
                      Customer Name
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">
                      Due Date
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment, index) => (
                    <tr
                      key={payment.id}
                      className={`${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-gray-100 transition-colors`}
                    >
                      <td className="px-6 py-4 border-b border-gray-200 font-semibold">
                        {payment.customer_name}
                      </td>
                      <td className="px-6 py-4 border-b border-gray-200 font-bold text-yellow-600">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 border-b border-gray-200">
                        {payment.due_date || "-"}
                      </td>
                      <td className="px-6 py-4 border-b border-gray-200">
                        {payment.description || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
