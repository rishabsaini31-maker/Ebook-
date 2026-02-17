"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function PendingPayments() {
  const router = useRouter();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    customer_name: "",
    amount: "",
    due_date: "",
    description: "",
  });

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
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = Cookies.get("token");
      const response = await fetch("/api/pending-payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Pending payment added successfully!");
        setFormData({
          customer_name: "",
          amount: "",
          due_date: "",
          description: "",
        });
        fetchPayments();
      } else {
        const data = await response.json();
        alert("Failed to add pending payment: " + data.error);
      }
    } catch (error) {
      alert("Failed to add pending payment: " + error.message);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString("en-IN")}`;
  };

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <i className="fas fa-clock text-white"></i>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Pending
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
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Add Payment Form */}
        <div className="bg-white/10 backdrop-blur-lg p-6 sm:p-8 rounded-2xl border border-white/20 mb-6">
          <h3 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
            <i className="fas fa-plus-circle text-yellow-400"></i>
            Add Pending Payment
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Customer Name
              </label>
              <input
                type="text"
                value={formData.customer_name}
                onChange={(e) =>
                  setFormData({ ...formData, customer_name: e.target.value })
                }
                placeholder="Enter customer name"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all"
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
                Due Date
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>
            <div>
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
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg"
              >
                <i className="fas fa-plus mr-2"></i>
                Add Pending Payment
              </button>
            </div>
          </form>
        </div>

        {/* Payments List */}
        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20">
          <h3 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
            <i className="fas fa-history text-blue-400"></i>
            Pending Payments
          </h3>
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-clock text-4xl text-gray-500 mb-4"></i>
              <p className="text-gray-400">No pending payments recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => {
                const daysUntilDue = getDaysUntilDue(payment.due_date);
                const isUrgent =
                  daysUntilDue !== null &&
                  daysUntilDue >= 0 &&
                  daysUntilDue <= 3;

                return (
                  <div
                    key={payment.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isUrgent
                        ? "bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/50"
                        : "bg-white/5 border-white/10 hover:border-yellow-500/50"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-semibold text-white">
                            {payment.customer_name}
                          </p>
                          {isUrgent && (
                            <span className="px-2 py-0.5 bg-red-500/30 text-red-300 text-xs rounded-full">
                              Urgent
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-400">
                          {payment.due_date && (
                            <span
                              className={`flex items-center gap-1 ${isUrgent ? "text-yellow-300" : ""}`}
                            >
                              <i className="fas fa-calendar text-gray-500"></i>
                              Due:{" "}
                              {new Date(payment.due_date).toLocaleDateString(
                                "en-IN",
                              )}
                              {daysUntilDue !== null &&
                                ` (${daysUntilDue} days)`}
                            </span>
                          )}
                        </div>
                        {payment.description && (
                          <p className="text-gray-400 text-sm mt-1">
                            {payment.description}
                          </p>
                        )}
                      </div>
                      <p className="text-xl font-bold text-yellow-400">
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
