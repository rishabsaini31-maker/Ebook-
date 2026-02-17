"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function SalesReport() {
  const router = useRouter();
  const [sales, setSales] = useState([]);
  const [period, setPeriod] = useState("daily");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/");
      return;
    }
    fetchSales();
  }, [router, period]);

  const fetchSales = async () => {
    try {
      const token = Cookies.get("token");
      const response = await fetch(`/api/reports/sales?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSales(data);
      }
    } catch (error) {
      console.error("Error fetching sales report:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString("en-IN")}`;
  };

  const getTotal = () => {
    return sales.reduce((sum, sale) => sum + parseFloat(sale.amount || 0), 0);
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
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
        <h2 className="text-3xl font-bold">Sales Report</h2>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Period Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          {["daily", "weekly", "monthly", "yearly"].map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                period === p
                  ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
                  : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 hover:from-gray-200 hover:to-gray-300"
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {/* Report Content */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">
            Sales {period.charAt(0).toUpperCase() + period.slice(1)}
          </h3>
          <p className="text-xl mb-6 text-gray-700">
            Total:{" "}
            <span className="font-bold text-green-600">
              {formatCurrency(getTotal())}
            </span>
          </p>

          {sales.length === 0 ? (
            <p className="text-center text-gray-600 py-8">
              No sales data for this period.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="px-6 py-4 text-left font-semibold">Date</th>
                    <th className="px-6 py-4 text-left font-semibold">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">
                      Payment Mode
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale, index) => (
                    <tr
                      key={sale.id}
                      className={`${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-gray-100 transition-colors`}
                    >
                      <td className="px-6 py-4 border-b border-gray-200">
                        {sale.date}
                      </td>
                      <td className="px-6 py-4 border-b border-gray-200 font-semibold text-green-600">
                        {formatCurrency(sale.amount)}
                      </td>
                      <td className="px-6 py-4 border-b border-gray-200">
                        {sale.payment_mode.toUpperCase()}
                      </td>
                      <td className="px-6 py-4 border-b border-gray-200">
                        {sale.notes || "-"}
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
