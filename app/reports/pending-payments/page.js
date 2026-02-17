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
                <i className="fas fa-file-invoice text-white"></i>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white">
                Pending Report
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
        {/* Total Card */}
        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Pending</p>
              <p className="text-3xl font-bold text-yellow-400">
                {formatCurrency(getTotal())}
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <i className="fas fa-clock text-white text-xl"></i>
            </div>
          </div>
        </div>

        {/* Payments List */}
        <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-white/20">
          <h3 className="text-xl font-semibold mb-4 text-white">
            Pending Payments
          </h3>

          {payments.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-file-invoice text-4xl text-gray-500 mb-4"></i>
              <p className="text-gray-400">No pending payments recorded yet.</p>
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
