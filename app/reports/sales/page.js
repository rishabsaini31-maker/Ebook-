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

  const profileImage = Cookies.get("profile_image") || "";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <i className="fas fa-arrow-left"></i>
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <i className="fas fa-chart-line text-white"></i>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white">
                Sales Report
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border-2 border-purple-500 object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-white text-sm"></i>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Period Buttons */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6">
          {["daily", "weekly", "monthly", "yearly"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all text-sm sm:text-base ${
                period === p
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {/* Total Card */}
        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Sales</p>
              <p className="text-3xl font-bold text-green-400">
                {formatCurrency(getTotal())}
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <i className="fas fa-shopping-cart text-white text-xl"></i>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-white/20">
          <h3 className="text-xl font-semibold mb-4 text-white">
            Sales {period.charAt(0).toUpperCase() + period.slice(1)}
          </h3>

          {sales.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-chart-line text-4xl text-gray-500 mb-4"></i>
              <p className="text-gray-400">No sales data for this period.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sales.map((sale) => (
                <div
                  key={sale.id}
                  className="bg-white/5 p-4 rounded-xl border border-white/10 hover:border-green-500/50 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <i className="fas fa-calendar text-gray-400 text-sm"></i>
                        <span className="text-gray-300 text-sm">
                          {sale.date}
                        </span>
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full uppercase">
                          {sale.payment_mode}
                        </span>
                      </div>
                      {sale.notes && (
                        <p className="text-gray-400 text-sm">{sale.notes}</p>
                      )}
                    </div>
                    <p className="text-xl font-bold text-green-400">
                      {formatCurrency(sale.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
