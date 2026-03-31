"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Cookies from "js-cookie";

export default function Expenses() {
  const router = useRouter();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entryLimit, setEntryLimit] = useState(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [period, setPeriod] = useState("daily");
  const getLocalDateString = () => {
    return new Date()
      .toLocaleString("en-CA", { timeZone: "Asia/Kolkata" })
      .split(",")[0];
  };

  const getLastDayOfMonthDate = (year, monthStr) => {
    const month = parseInt(monthStr, 10);
    const lastDay = new Date(year, month, 0).getDate();
    return `${year}-${monthStr}-${String(lastDay).padStart(2, "0")}`;
  };

  const getDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    const dateObj = new Date(year, parseInt(month) - 1, day);
    return dateObj.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const [formData, setFormData] = useState({
    date: getLocalDateString(),
    amount: "",
    category: "",
    rent: "",
    transport: "",
    salary: "",
    purchase: "",
    electricity: "",
    miscellaneous: "",
    description: "",
  });

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/");
      return;
    }
    fetchExpenses();
    fetchEntryLimit();
  }, [router]);

  const fetchExpenses = async () => {
    try {
      const token = Cookies.get("token");
      // You can manage page/limit in state if you want to support pagination UI
      const page = 1;
      const limit = 20;
      const response = await fetch(
        `/api/expenses?page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        const result = await response.json();
        setExpenses(result.data);
        // Optionally, store result.total, result.page, result.limit for pagination UI
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
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

    if (entryLimit?.used >= entryLimit?.limit) {
      setShowPremiumModal(true);
      return;
    }

    // Optimistic update of entry limit
    if (entryLimit) {
      try {
        const token = Cookies.get("token");
        await fetch("/api/entry-limit/increment", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        console.error("Error incrementing entry count:", error);
      }
    }
    try {
      const token = Cookies.get("token");
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, period }),
      });

      if (response.ok) {
        alert("Expense added successfully!");
        const todayDate = getLocalDateString();
        setFormData({
          date:
            period === "monthly"
              ? getLastDayOfMonthDate(
                  todayDate.split("-")[0],
                  todayDate.split("-")[1],
                )
              : todayDate,
          amount: "",
          category: "rent",
          description: "",
        });
        fetchExpenses();
        fetchEntryLimit();
      } else {
        const data = await response.json();
        alert("Failed to add expense: " + data.error);
      }
    } catch (error) {
      alert("Failed to add expense: " + error.message);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString("en-IN")}`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      rent: "from-blue-500 to-blue-600",
      "stock purchase": "from-purple-500 to-purple-600",
      transport: "from-yellow-500 to-yellow-600",
      electricity: "from-cyan-500 to-cyan-600",
      salary: "from-green-500 to-green-600",
      miscellaneous: "from-gray-500 to-gray-600",
    };
    return colors[category] || "from-gray-500 to-gray-600";
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
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                <i className="fas fa-money-bill-wave text-white"></i>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Expenses
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
        {/* Add Expense Form */}
        <div className="bg-white/10 backdrop-blur-lg p-6 sm:p-8 rounded-2xl border border-white/20 mb-6">
          <h3 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
            <i className="fas fa-plus-circle text-red-400"></i>
            Add Expense
          </h3>
          {/* Period Selector */}
          <div className="flex flex-wrap gap-2 mb-6">
            {["daily", "monthly"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setPeriod(p);
                  const todayDate = getLocalDateString();
                  if (p === "monthly") {
                    const [year, month] = todayDate.split("-");
                    setFormData({
                      ...formData,
                      date: getLastDayOfMonthDate(year, month),
                    });
                  } else {
                    setFormData({ ...formData, date: todayDate });
                  }
                }}
                className={`px-4 py-2 rounded-xl font-semibold transition-all text-sm ${period === p ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg" : "bg-white/10 text-gray-300 hover:bg-white/20"}`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          {period === "monthly" && (
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-start gap-3 shadow-inner">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                <i className="fas fa-info-circle text-blue-400"></i>
              </div>
              <div>
                <p className="text-gray-200 font-semibold mb-1">
                  Monthly Expense Date Rule
                </p>
                <p className="text-gray-400 text-sm">
                  You can enter data on the last date of every month. Just
                  select the target month below.
                </p>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {period === "monthly" && (
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Date
                    </label>
                    <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded-md mb-1">
                      <i className="fas fa-calendar-alt mr-1"></i>
                      {getDisplayDate(formData.date)}
                    </span>
                  </div>
                  <input
                    type="month"
                    value={formData.date.substring(0, 7)}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        const [yr, mo] = val.split("-");
                        setFormData({
                          ...formData,
                          date: getLastDayOfMonthDate(yr, mo),
                        });
                      }
                    }}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rent
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.rent}
                    onChange={(e) =>
                      setFormData({ ...formData, rent: e.target.value })
                    }
                    placeholder="Enter rent amount"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Transport
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.transport}
                    onChange={(e) =>
                      setFormData({ ...formData, transport: e.target.value })
                    }
                    placeholder="Enter transport amount"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Salary
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.salary}
                    onChange={(e) =>
                      setFormData({ ...formData, salary: e.target.value })
                    }
                    placeholder="Enter salary amount"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Stock Purchase
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.purchase}
                    onChange={(e) =>
                      setFormData({ ...formData, purchase: e.target.value })
                    }
                    placeholder="Enter purchase amount"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Electricity
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.electricity}
                    onChange={(e) =>
                      setFormData({ ...formData, electricity: e.target.value })
                    }
                    placeholder="Enter electricity amount"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Miscellaneous
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.miscellaneous}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        miscellaneous: e.target.value,
                      })
                    }
                    placeholder="Enter miscellaneous amount"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all"
                  />
                </div>
              </div>
            )}
            {period === "daily" && (
              <>
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Date
                    </label>
                    <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md mb-1">
                      <i className="fas fa-lock mr-1"></i>Locked to Present
                    </span>
                  </div>
                  <input
                    type="date"
                    value={formData.date}
                    readOnly
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 cursor-not-allowed focus:outline-none transition-all"
                  />
                </div>
                <div className="sm:col-span-2">
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
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder="Enter category"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all"
                    required
                  />
                </div>
              </>
            )}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Optional description"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all shadow-lg"
              >
                <i className="fas fa-plus mr-2"></i>
                Add Expense
              </button>
            </div>
          </form>
        </div>

        {/* Expenses List */}
        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20">
          <h3 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
            <i className="fas fa-history text-blue-400"></i>
            Expenses History
          </h3>
          {expenses.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-money-bill-wave text-4xl text-gray-500 mb-4"></i>
              <p className="text-gray-400">No expenses recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses
                .filter((e) => e.period === period)
                .map((expense) => (
                  <div
                    key={expense.id}
                    className="bg-white/5 p-4 rounded-xl border border-white/10 hover:border-red-500/50 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <i className="fas fa-calendar text-gray-400 text-sm"></i>
                          <span className="text-gray-300 text-sm">
                            {expense.date}
                          </span>
                          <span
                            className={`px-2 py-0.5 bg-gradient-to-r ${getCategoryColor(expense.category)} text-white text-xs rounded-full`}
                          >
                            {expense.category}
                          </span>
                        </div>
                        {expense.description && (
                          <p className="text-gray-400 text-sm">
                            {expense.description}
                          </p>
                        )}
                      </div>
                      <p className="text-xl font-bold text-red-400">
                        {formatCurrency(expense.amount)}
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
              <h3 className="text-2xl font-bold text-white mb-2">
                Entry Limit Reached
              </h3>
              <p className="text-gray-400 mb-6">
                You've used all {entryLimit?.limit} free entries this month.
                Upgrade to Premium for unlimited entries!
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
