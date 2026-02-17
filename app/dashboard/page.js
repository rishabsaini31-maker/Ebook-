"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Cookies from "js-cookie";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/");
      return;
    }

    fetchUserData();
    fetchDashboardData();
    fetchAlerts();
  }, [router]);

  const fetchUserData = async () => {
    try {
      const token = Cookies.get("token");
      const response = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = Cookies.get("token");
      const response = await fetch("/api/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const token = Cookies.get("token");
      const response = await fetch("/api/alerts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  const handleLogout = async () => {
    // Clear cookies
    Cookies.remove("token");
    Cookies.remove("username");
    Cookies.remove("profile_image");

    // Sign out from next-auth
    await signOut({ redirect: false });

    // Redirect to home
    router.push("/");
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString("en-IN")}`;
  };

  const getProfitColor = (profit) => {
    return profit < 0 ? "text-red-500" : "text-green-500";
  };

  // Get user display info
  const username = user?.username || Cookies.get("username") || "User";
  const profileImage =
    user?.profile_image || Cookies.get("profile_image") || "";

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
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <i className="fas fa-book-open text-white"></i>
              </div>
              <span className="text-white font-bold text-xl hidden sm:block">
                EBOOK
              </span>
            </div>

            {/* Welcome Message */}
            <div className="flex items-center gap-3">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-purple-500 object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-white"></i>
                </div>
              )}
              <span className="text-white font-medium">
                Welcome, <span className="text-purple-300">{username}</span>
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-xl transition-all border border-red-500/30"
            >
              <i className="fas fa-sign-out-alt"></i>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6 space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl shadow-lg flex items-center gap-3 backdrop-blur-lg ${
                  alert.type === "loan_due_soon"
                    ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30"
                    : "bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30"
                }`}
              >
                <i
                  className={`fas ${
                    alert.type === "loan_due_soon"
                      ? "fa-exclamation-triangle text-yellow-400"
                      : "fa-exclamation-circle text-red-400"
                  } text-2xl`}
                ></i>
                <p className="font-medium text-white">{alert.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Today */}
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 hover:border-purple-500/50 transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Today</h3>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <i className="fas fa-calendar-day text-white text-xl"></i>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              {new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Income</span>
                <span className="font-bold text-white">
                  {formatCurrency(dashboardData?.today?.income || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Expenses</span>
                <span className="font-bold text-white">
                  {formatCurrency(dashboardData?.today?.expenses || 0)}
                </span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                <span className="text-gray-300 font-medium">Profit</span>
                <span
                  className={`font-bold text-lg ${getProfitColor(
                    dashboardData?.today?.profit || 0,
                  )}`}
                >
                  {formatCurrency(dashboardData?.today?.profit || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Monthly */}
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 hover:border-purple-500/50 transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Monthly</h3>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <i className="fas fa-calendar-alt text-white text-xl"></i>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              {new Date().toLocaleDateString("en-IN", {
                month: "long",
                year: "numeric",
              })}
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Income</span>
                <span className="font-bold text-white">
                  {formatCurrency(dashboardData?.monthly?.income || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Expenses</span>
                <span className="font-bold text-white">
                  {formatCurrency(dashboardData?.monthly?.expenses || 0)}
                </span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                <span className="text-gray-300 font-medium">Profit</span>
                <span
                  className={`font-bold text-lg ${getProfitColor(
                    dashboardData?.monthly?.profit || 0,
                  )}`}
                >
                  {formatCurrency(dashboardData?.monthly?.profit || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Yearly */}
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 hover:border-purple-500/50 transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Yearly</h3>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <i className="fas fa-calendar text-white text-xl"></i>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Year {new Date().getFullYear()}
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Income</span>
                <span className="font-bold text-white">
                  {formatCurrency(dashboardData?.yearly?.income || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Expenses</span>
                <span className="font-bold text-white">
                  {formatCurrency(dashboardData?.yearly?.expenses || 0)}
                </span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                <span className="text-gray-300 font-medium">Profit</span>
                <span
                  className={`font-bold text-lg ${getProfitColor(
                    dashboardData?.yearly?.profit || 0,
                  )}`}
                >
                  {formatCurrency(dashboardData?.yearly?.profit || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="mb-8">
          <h3 className="text-2xl text-center mb-6 text-white font-semibold">
            Our Services
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => router.push("/sales")}
              className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 hover:border-green-500/50 transition-all hover:-translate-y-1 group"
            >
              <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="fas fa-shopping-cart text-white text-2xl"></i>
              </div>
              <p className="font-semibold text-white">Sales</p>
            </button>

            <button
              onClick={() => router.push("/expenses")}
              className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 hover:border-red-500/50 transition-all hover:-translate-y-1 group"
            >
              <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="fas fa-money-bill-wave text-white text-2xl"></i>
              </div>
              <p className="font-semibold text-white">Expenses</p>
            </button>

            <button
              onClick={() => router.push("/pending-payments")}
              className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 hover:border-yellow-500/50 transition-all hover:-translate-y-1 group"
            >
              <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="fas fa-clock text-white text-2xl"></i>
              </div>
              <p className="font-semibold text-white">Pending</p>
            </button>

            <button
              onClick={() => router.push("/loans")}
              className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 hover:border-teal-500/50 transition-all hover:-translate-y-1 group"
            >
              <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="fas fa-hand-holding-usd text-white text-2xl"></i>
              </div>
              <p className="font-semibold text-white">Loans</p>
            </button>

            <button
              onClick={() => router.push("/reports/sales")}
              className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 hover:border-blue-500/50 transition-all hover:-translate-y-1 group"
            >
              <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="fas fa-chart-line text-white text-2xl"></i>
              </div>
              <p className="font-semibold text-white">Sales Report</p>
            </button>

            <button
              onClick={() => router.push("/reports/expenses")}
              className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 hover:border-purple-500/50 transition-all hover:-translate-y-1 group"
            >
              <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="fas fa-chart-bar text-white text-2xl"></i>
              </div>
              <p className="font-semibold text-white">Expenses Report</p>
            </button>

            <button
              onClick={() => router.push("/reports/pending-payments")}
              className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 hover:border-orange-500/50 transition-all hover:-translate-y-1 group"
            >
              <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="fas fa-hourglass-half text-white text-2xl"></i>
              </div>
              <p className="font-semibold text-white text-sm">Pending Report</p>
            </button>

            <button
              onClick={() => router.push("/reports/loans")}
              className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 hover:border-indigo-500/50 transition-all hover:-translate-y-1 group"
            >
              <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="fas fa-file-invoice-dollar text-white text-2xl"></i>
              </div>
              <p className="font-semibold text-white">Loans Report</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
