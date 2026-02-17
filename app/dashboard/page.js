"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Cookies from "js-cookie";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [entryLimit, setEntryLimit] = useState(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/");
      return;
    }

    fetchUserData();
    fetchDashboardData();
    fetchAlerts();
    fetchEntryLimit();
  }, [router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const fetchEntryLimit = async () => {
    try {
      const token = Cookies.get("token");
      const response = await fetch("/api/entry-limit", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setEntryLimit(data);
      }
    } catch (error) {
      console.error("Error fetching entry limit:", error);
    }
  };

  const handleLogout = async () => {
    Cookies.remove("token");
    Cookies.remove("username");
    Cookies.remove("profile_image");
    await signOut({ redirect: false });
    router.push("/");
  };

  const handleServiceClick = async (path, requiresPremium = false) => {
    // Check if trying to access Full Analysis (premium only)
    if (path === "/analysis" && !user?.is_premium) {
      setShowPremiumModal(true);
      return;
    }
    router.push(path);
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString("en-IN")}`;
  };

  const getProfitColor = (profit) => {
    return profit < 0 ? "text-red-500" : "text-green-500";
  };

  const username = user?.username || Cookies.get("username") || "User";
  const profileImage =
    user?.profile_image || Cookies.get("profile_image") || "";
  const isPremium = user?.is_premium || false;

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
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Profile Dropdown - Left Side */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-all border border-white/10"
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className={`w-9 h-9 rounded-full object-cover ${isPremium ? "border-2 border-amber-400 ring-2 ring-amber-400/30" : "border-2 border-purple-500"}`}
                  />
                ) : (
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${isPremium ? "bg-gradient-to-br from-amber-400 to-yellow-500 ring-2 ring-amber-400/30" : "bg-gradient-to-br from-purple-500 to-pink-500"}`}
                  >
                    <i
                      className={`fas fa-user text-white text-sm ${isPremium ? "text-black" : ""}`}
                    ></i>
                  </div>
                )}
                <div className="text-left hidden sm:block">
                  <p className="text-white font-medium text-sm">{username}</p>
                  <p
                    className={`text-xs ${isPremium ? "text-amber-400 font-medium" : "text-gray-400"}`}
                  >
                    {isPremium ? "⭐ Premium" : "Free Plan"}
                  </p>
                </div>
                <i
                  className={`fas fa-chevron-down text-gray-400 text-xs transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                ></i>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* User Info Header */}
                  <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Profile"
                          className="w-12 h-12 rounded-full border-2 border-purple-500 object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <i className="fas fa-user text-white"></i>
                        </div>
                      )}
                      <div>
                        <p className="text-white font-semibold">{username}</p>
                        <p className="text-gray-400 text-sm">
                          {user?.email || ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    {!isPremium && (
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          router.push("/premium");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 transition-all group"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center">
                          <i className="fas fa-crown text-white text-sm"></i>
                        </div>
                        <div className="text-left">
                          <p className="font-medium">Upgrade to Premium</p>
                          <p className="text-xs text-gray-400">
                            Unlock all features
                          </p>
                        </div>
                        <i className="fas fa-arrow-right ml-auto text-gray-500 group-hover:text-amber-300 transition-colors"></i>
                      </button>
                    )}
                    {isPremium && (
                      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-xl mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center">
                          <i className="fas fa-crown text-black text-sm"></i>
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-amber-300">
                            Premium Active
                          </p>
                          <p className="text-xs text-gray-400">
                            Plan: {user?.premium_plan}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="border-t border-white/10 my-2"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/20 text-red-300 transition-all"
                    >
                      <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <i className="fas fa-sign-out-alt text-red-400"></i>
                      </div>
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Logo - Center */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <i className="fas fa-book-open text-white"></i>
              </div>
              <span className="text-white font-bold text-xl hidden sm:block">
                EBOOK
              </span>
            </div>

            {/* Premium Button - Right */}
            {!isPremium ? (
              <button
                onClick={() => router.push("/premium")}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-4 py-2 rounded-xl font-semibold hover:from-amber-400 hover:to-yellow-400 transition-all shadow-lg shadow-amber-500/20"
              >
                <i className="fas fa-crown"></i>
                <span className="hidden sm:inline">Premium</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 text-amber-300 px-4 py-2 rounded-xl">
                <i className="fas fa-crown"></i>
                <span className="hidden sm:inline">Premium</span>
              </div>
            )}
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
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 hover:border-purple-500/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Today</h3>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
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
                  className={`font-bold text-lg ${getProfitColor(dashboardData?.today?.profit || 0)}`}
                >
                  {formatCurrency(dashboardData?.today?.profit || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Monthly */}
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 hover:border-purple-500/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Monthly</h3>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
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
                  className={`font-bold text-lg ${getProfitColor(dashboardData?.monthly?.profit || 0)}`}
                >
                  {formatCurrency(dashboardData?.monthly?.profit || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Yearly */}
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 hover:border-purple-500/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Yearly</h3>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
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
                  className={`font-bold text-lg ${getProfitColor(dashboardData?.yearly?.profit || 0)}`}
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
            {/* Full Analysis - Featured (Premium Only) */}
            <button
              onClick={() => handleServiceClick("/analysis", true)}
              className={`bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-lg p-6 rounded-2xl border transition-all hover:-translate-y-1 group col-span-2 md:col-span-1 relative overflow-hidden ${isPremium ? "border-cyan-500/30 hover:border-cyan-400/50" : "border-cyan-500/30 hover:border-amber-500/50"}`}
            >
              {!isPremium && (
                <div className="absolute top-2 right-2 bg-amber-500 text-black text-xs px-2 py-1 rounded-full font-bold">
                  <i className="fas fa-crown mr-1"></i>PREMIUM
                </div>
              )}
              <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/30">
                <i className="fas fa-chart-pie text-white text-2xl"></i>
              </div>
              <p className="font-semibold text-white">Full Analysis</p>
              <p className="text-xs text-cyan-300 mt-1">Charts & Graphs</p>
            </button>

            <button
              onClick={() => router.push("/sales")}
              className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 hover:border-green-500/50 transition-all hover:-translate-y-1 group"
            >
              <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <i className="fas fa-shopping-cart text-white text-2xl"></i>
              </div>
              <p className="font-semibold text-white">Sales</p>
            </button>

            <button
              onClick={() => router.push("/expenses")}
              className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 hover:border-red-500/50 transition-all hover:-translate-y-1 group"
            >
              <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <i className="fas fa-money-bill-wave text-white text-2xl"></i>
              </div>
              <p className="font-semibold text-white">Expenses</p>
            </button>

            <button
              onClick={() => router.push("/pending-payments")}
              className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 hover:border-yellow-500/50 transition-all hover:-translate-y-1 group"
            >
              <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <i className="fas fa-clock text-white text-2xl"></i>
              </div>
              <p className="font-semibold text-white">Pending</p>
            </button>

            <button
              onClick={() => router.push("/loans")}
              className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 hover:border-teal-500/50 transition-all hover:-translate-y-1 group"
            >
              <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <i className="fas fa-hand-holding-usd text-white text-2xl"></i>
              </div>
              <p className="font-semibold text-white">Loans</p>
            </button>

            <button
              onClick={() => router.push("/reports/sales")}
              className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 hover:border-blue-500/50 transition-all hover:-translate-y-1 group"
            >
              <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <i className="fas fa-chart-line text-white text-2xl"></i>
              </div>
              <p className="font-semibold text-white">Sales Report</p>
            </button>

            <button
              onClick={() => router.push("/reports/expenses")}
              className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 hover:border-purple-500/50 transition-all hover:-translate-y-1 group"
            >
              <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <i className="fas fa-chart-bar text-white text-2xl"></i>
              </div>
              <p className="font-semibold text-white">Expenses Report</p>
            </button>

            <button
              onClick={() => router.push("/reports/pending-payments")}
              className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 hover:border-orange-500/50 transition-all hover:-translate-y-1 group"
            >
              <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <i className="fas fa-hourglass-half text-white text-2xl"></i>
              </div>
              <p className="font-semibold text-white text-sm">Pending Report</p>
            </button>

            <button
              onClick={() => router.push("/reports/loans")}
              className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 hover:border-indigo-500/50 transition-all hover:-translate-y-1 group"
            >
              <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <i className="fas fa-file-invoice-dollar text-white text-2xl"></i>
              </div>
              <p className="font-semibold text-white">Loans Report</p>
            </button>
          </div>
        </div>

        {/* Entry Limit Warning for Free Users */}
        {entryLimit && !entryLimit.isPremium && entryLimit.entriesUsed >= 3 && (
          <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 backdrop-blur-xl p-4 rounded-2xl border border-amber-500/30 shadow-xl z-40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-amber-400"></i>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium text-sm">
                  Entry Limit Warning
                </p>
                <p className="text-gray-400 text-xs">
                  {entryLimit.entriesRemaining} entries remaining this month
                </p>
              </div>
              <button
                onClick={() => router.push("/premium")}
                className="bg-amber-500 text-black px-3 py-1 rounded-lg text-sm font-medium hover:bg-amber-400 transition-colors"
              >
                Upgrade
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Premium Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl border border-amber-500/30 p-8 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center">
                <i className="fas fa-crown text-black text-3xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Premium Feature
              </h3>
              <p className="text-gray-400 mb-6">
                Full Analysis is a premium feature. Upgrade to access detailed
                charts, graphs, and unlimited entries!
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPremiumModal(false)}
                  className="flex-1 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
                >
                  Maybe Later
                </button>
                <button
                  onClick={() => {
                    setShowPremiumModal(false);
                    router.push("/premium");
                  }}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold hover:from-amber-400 hover:to-yellow-400 transition-colors"
                >
                  <i className="fas fa-crown mr-2"></i>Upgrade
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
