"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Cookies from "js-cookie";

export default function Sales() {
  const router = useRouter();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entryLimit, setEntryLimit] = useState(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    amount: "",
    payment_mode: "cash",
    notes: "",
  });

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/");
      return;
    }
    fetchSales();
    fetchEntryLimit();
  }, [router]);

  const fetchSales = async () => {
    try {
      const token = Cookies.get("token");
      const response = await fetch("/api/sales", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSales(data);
      }
    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      setLoading(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check entry limit for free users
    if (entryLimit && !entryLimit.isPremium) {
      if (!entryLimit.canAddEntry) {
        setShowPremiumModal(true);
        return;
      }
      
      // Increment entry count
      try {
        const token = Cookies.get("token");
        const incrementResponse = await fetch("/api/entry-limit", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!incrementResponse.ok) {
          const data = await incrementResponse.json();
          if (data.needsPremium) {
            setShowPremiumModal(true);
            return;
          }
        }
      } catch (error) {
        console.error("Error incrementing entry count:", error);
      }
    }
    
    try {
      const token = Cookies.get("token");
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Sale added successfully!");
        setFormData({
          date: new Date().toISOString().split("T")[0],
          amount: "",
          payment_mode: "cash",
          notes: "",
        });
        fetchSales();
        fetchEntryLimit();
      } else {
        const data = await response.json();
        alert("Failed to add sale: " + data.error);
      }
    } catch (error) {
      alert("Failed to add sale: " + error.message);
    }
  };

  const handleLogout = async () => {
    Cookies.remove("token");
    Cookies.remove("username");
    Cookies.remove("profile_image");
    await signOut({ redirect: false });
    router.push("/");
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString("en-IN")}`;
  };

  const username = Cookies.get("username") || "User";
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
            {/* Back Button */}
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <i className="fas fa-arrow-left"></i>
              <span className="hidden sm:inline">Back</span>
            </button>

            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <i className="fas fa-shopping-cart text-white"></i>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Sales
              </h1>
            </div>

            {/* Profile */}
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
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Add Sale Form */}
        <div className="bg-white/10 backdrop-blur-lg p-6 sm:p-8 rounded-2xl border border-white/20 mb-6">
          <h3 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
            <i className="fas fa-plus-circle text-green-400"></i>
            Add Sale
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                placeholder="Enter amount"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Payment Mode
              </label>
              <select
                value={formData.payment_mode}
                onChange={(e) =>
                  setFormData({ ...formData, payment_mode: e.target.value })
                }
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all"
              >
                <option value="cash" className="bg-gray-800">
                  Cash
                </option>
                <option value="upi" className="bg-gray-800">
                  UPI
                </option>
                <option value="card" className="bg-gray-800">
                  Card
                </option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notes
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Optional notes"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
              >
                <i className="fas fa-plus mr-2"></i>
                Add Sale
              </button>
            </div>
          </form>
        </div>

        {/* Sales List */}
        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20">
          <h3 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
            <i className="fas fa-history text-blue-400"></i>
            Sales History
          </h3>
          {sales.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-shopping-cart text-4xl text-gray-500 mb-4"></i>
              <p className="text-gray-400">No sales recorded yet</p>
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
                      <div className="flex items-center gap-2 mb-1">
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

      {/* Premium Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl border border-amber-500/30 p-8 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center">
                <i className="fas fa-crown text-black text-3xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Entry Limit Reached</h3>
              <p className="text-gray-400 mb-6">
                You've used all {entryLimit?.limit} free entries this month. Upgrade to Premium for unlimited entries!
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
