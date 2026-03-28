"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Cookies from "js-cookie";

export default function Loans() {
  const router = useRouter();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const getLocalDateString = () => {
    return new Date().toLocaleString('en-CA', { timeZone: 'Asia/Kolkata' }).split(',')[0];
  };

  const [formData, setFormData] = useState({
    lender_name: "",
    amount: "",
    paid_amount: "0",
    start_date: getLocalDateString(),
    due_date: getLocalDateString(),
    description: "",
  });

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/");
      return;
    }
    fetchLoans();
  }, [router]);

  const fetchLoans = async () => {
    try {
      const token = Cookies.get("token");
      const response = await fetch("/api/loans", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setLoans(data);
      }
    } catch (error) {
      console.error("Error fetching loans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = Cookies.get("token");
      const response = await fetch("/api/loans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Loan added successfully!");
        setFormData({
          lender_name: "",
          amount: "",
          paid_amount: "0",
          start_date: getLocalDateString(),
          due_date: getLocalDateString(),
          description: "",
        });
        fetchLoans();
      } else {
        const data = await response.json();
        alert("Failed to add loan: " + data.error);
      }
    } catch (error) {
      alert("Failed to add loan: " + error.message);
    }
  };

  const handlePayment = async (loanId, maxAmount, lenderName) => {
    const paymentAmount = prompt(
      `Record payment for ${lenderName}\nEnter payment amount (max: ₹${parseFloat(maxAmount).toLocaleString("en-IN")}):`,
    );

    if (
      paymentAmount &&
      !isNaN(paymentAmount) &&
      parseFloat(paymentAmount) > 0
    ) {
      if (parseFloat(paymentAmount) > parseFloat(maxAmount)) {
        alert("Payment amount cannot exceed pending amount!");
        return;
      }

      try {
        const token = Cookies.get("token");
        const response = await fetch(`/api/loans/${loanId}/pay`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ paid_amount: parseFloat(paymentAmount) }),
        });

        if (response.ok) {
          alert(
            `Payment of ₹${parseFloat(paymentAmount).toLocaleString("en-IN")} recorded successfully for ${lenderName}!`,
          );
          fetchLoans();
        } else {
          const data = await response.json();
          alert("Failed to record payment: " + data.error);
        }
      } catch (error) {
        alert("Failed to record payment: " + error.message);
      }
    }
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString("en-IN")}`;
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isUrgent = (loan) => {
    const totalAmount = parseFloat(loan.amount || 0);
    const paidAmount = parseFloat(loan.paid_amount || 0);
    const daysUntilDue = getDaysUntilDue(loan.due_date);
    return paidAmount < totalAmount && daysUntilDue >= 0 && daysUntilDue <= 5;
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
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <i className="fas fa-hand-holding-usd text-white"></i>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Loans
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
        {/* Add Loan Form */}
        <div className="bg-white/10 backdrop-blur-lg p-6 sm:p-8 rounded-2xl border border-white/20 mb-6">
          <h3 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
            <i className="fas fa-plus-circle text-teal-400"></i>
            Add Loan
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Lender Name
              </label>
              <input
                type="text"
                value={formData.lender_name}
                onChange={(e) =>
                  setFormData({ ...formData, lender_name: e.target.value })
                }
                placeholder="Enter lender name"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Total Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                placeholder="Enter total amount"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount Already Paid
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.paid_amount}
                onChange={(e) =>
                  setFormData({ ...formData, paid_amount: e.target.value })
                }
                placeholder="Enter paid amount"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all"
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
                required
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
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all shadow-lg"
              >
                <i className="fas fa-plus mr-2"></i>
                Add Loan
              </button>
            </div>
          </form>
        </div>

        {/* Loans List */}
        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20">
          <h3 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
            <i className="fas fa-history text-blue-400"></i>
            Loans History
          </h3>
          {loans.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-hand-holding-usd text-4xl text-gray-500 mb-4"></i>
              <p className="text-gray-400">No loans recorded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {loans.map((loan) => {
                const totalAmount = parseFloat(loan.amount || 0);
                const paidAmount = parseFloat(loan.paid_amount || 0);
                const pendingAmount = totalAmount - paidAmount;
                const daysUntilDue = getDaysUntilDue(loan.due_date);
                const urgent = isUrgent(loan);

                return (
                  <div
                    key={loan.id}
                    className={`p-4 sm:p-5 rounded-xl border transition-all ${
                      urgent
                        ? "bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/50"
                        : "bg-white/5 border-white/10 hover:border-teal-500/50"
                    }`}
                  >
                    <div className="flex flex-col gap-3">
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-bold text-lg text-white">
                            {loan.lender_name || "Unknown Lender"}
                          </p>
                          {loan.description && (
                            <p className="text-gray-400 text-sm italic">
                              {loan.description}
                            </p>
                          )}
                        </div>
                        {urgent && (
                          <span className="px-2 py-1 bg-red-500/30 text-red-300 text-xs rounded-full flex items-center gap-1">
                            <i className="fas fa-exclamation-triangle"></i>
                            Urgent
                          </span>
                        )}
                      </div>

                      {/* Amount Info */}
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-xl font-bold text-green-400">
                          {formatCurrency(totalAmount)}
                        </span>
                        {paidAmount > 0 && (
                          <span className="text-sm text-green-300 bg-green-500/20 px-2 py-0.5 rounded-full">
                            Paid: {formatCurrency(paidAmount)}
                          </span>
                        )}
                        {pendingAmount > 0 && (
                          <span className="text-sm text-orange-400 bg-orange-500/20 px-2 py-0.5 rounded-full font-medium">
                            Pending: {formatCurrency(pendingAmount)}
                          </span>
                        )}
                      </div>

                      {/* Dates */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        {loan.start_date && (
                          <span className="flex items-center gap-1">
                            <i className="fas fa-calendar text-gray-500"></i>
                            Start:{" "}
                            {new Date(loan.start_date).toLocaleDateString(
                              "en-IN",
                            )}
                          </span>
                        )}
                        {loan.due_date && (
                          <span
                            className={`flex items-center gap-1 ${urgent ? "text-yellow-300 font-bold" : ""}`}
                          >
                            <i className="fas fa-clock text-gray-500"></i>
                            Due:{" "}
                            {new Date(loan.due_date).toLocaleDateString(
                              "en-IN",
                            )}{" "}
                            ({daysUntilDue} days)
                          </span>
                        )}
                      </div>

                      {/* Payment Button */}
                      {pendingAmount > 0 && (
                        <button
                          onClick={() =>
                            handlePayment(
                              loan.id,
                              pendingAmount,
                              loan.lender_name,
                            )
                          }
                          className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all text-sm font-medium"
                        >
                          <i className="fas fa-credit-card mr-2"></i>
                          Record Payment
                        </button>
                      )}
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
