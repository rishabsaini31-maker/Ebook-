"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function LoansReport() {
  const router = useRouter();
  const [loans, setLoans] = useState([]);
  const [period, setPeriod] = useState("all");
  const [loading, setLoading] = useState(true);

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
      console.error("Error fetching loans report:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString("en-IN")}`;
  };

  const getFilteredLoans = () => {
    const today = new Date();

    if (period === "active") {
      return loans.filter((loan) => {
        const dueDate = new Date(loan.due_date);
        return dueDate >= today;
      });
    } else if (period === "due-soon") {
      return loans.filter((loan) => {
        const dueDate = new Date(loan.due_date);
        const daysUntilDue = Math.ceil(
          (dueDate - today) / (1000 * 60 * 60 * 24),
        );
        return daysUntilDue >= 0 && daysUntilDue <= 30;
      });
    }
    return loans;
  };

  const filteredLoans = getFilteredLoans();

  const getTotalAmount = () => {
    return filteredLoans.reduce(
      (sum, loan) => sum + parseFloat(loan.amount || 0),
      0,
    );
  };

  const getTotalPending = () => {
    const today = new Date();
    return filteredLoans
      .filter((loan) => {
        const dueDate = new Date(loan.due_date);
        return dueDate >= today;
      })
      .reduce((sum, loan) => sum + parseFloat(loan.amount || 0), 0);
  };

  const getTotalPaid = () => {
    return filteredLoans
      .filter((loan) => {
        const totalAmount = parseFloat(loan.amount || 0);
        const paidAmount = parseFloat(loan.paid_amount || 0);
        return paidAmount >= totalAmount;
      })
      .reduce((sum, loan) => sum + parseFloat(loan.amount || 0), 0);
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

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatus = (loan) => {
    const totalAmount = parseFloat(loan.amount || 0);
    const paidAmount = parseFloat(loan.paid_amount || 0);
    const daysUntilDue = getDaysUntilDue(loan.due_date);

    if (paidAmount >= totalAmount) return "Paid";
    if (daysUntilDue === null) return "Unknown";
    if (daysUntilDue < 0) return "Overdue";
    if (daysUntilDue <= 5) return "Due Soon";
    if (daysUntilDue <= 30) return "Upcoming";
    return "Active";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "text-green-400";
      case "Overdue":
        return "text-red-400";
      case "Due Soon":
        return "text-orange-400";
      case "Upcoming":
        return "text-yellow-400";
      case "Active":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
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
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <i className="fas fa-file-invoice-dollar text-white"></i>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white">
                Loans Report
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
          {["all", "active", "due-soon"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all text-sm sm:text-base ${
                period === p
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1).replace("-", " ")}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-white/20">
            <div className="text-2xl sm:text-3xl mb-2">🧮</div>
            <p className="text-xs sm:text-sm text-gray-400">Total Amount</p>
            <p className="text-lg sm:text-xl font-bold text-green-400">
              {formatCurrency(getTotalAmount())}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-white/20">
            <div className="text-2xl sm:text-3xl mb-2">🕐</div>
            <p className="text-xs sm:text-sm text-gray-400">Active Loans</p>
            <p className="text-lg sm:text-xl font-bold text-yellow-400">
              {formatCurrency(getTotalPending())}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-white/20">
            <div className="text-2xl sm:text-3xl mb-2">✅</div>
            <p className="text-xs sm:text-sm text-gray-400">Completed</p>
            <p className="text-lg sm:text-xl font-bold text-green-400">
              {formatCurrency(getTotalPaid())}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-white/20">
            <div className="text-2xl sm:text-3xl mb-2">🔢</div>
            <p className="text-xs sm:text-sm text-gray-400">Count</p>
            <p className="text-lg sm:text-xl font-bold text-blue-400">
              {filteredLoans.length}
            </p>
          </div>
        </div>

        {/* Loans List */}
        <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-white/20">
          <h3 className="text-xl font-semibold mb-4 text-white">
            {period.charAt(0).toUpperCase() + period.slice(1).replace("-", " ")}{" "}
            Loans
          </h3>

          {filteredLoans.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-file-invoice-dollar text-4xl text-gray-500 mb-4"></i>
              <p className="text-gray-400">No loans found for this period.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLoans.map((loan) => {
                const totalAmount = parseFloat(loan.amount || 0);
                const paidAmount = parseFloat(loan.paid_amount || 0);
                const pendingAmount = totalAmount - paidAmount;
                const daysUntilDue = getDaysUntilDue(loan.due_date);
                const status = getStatus(loan);

                return (
                  <div
                    key={loan.id}
                    className="bg-white/5 p-4 rounded-xl border border-white/10 hover:border-indigo-500/50 transition-all"
                  >
                    <div className="flex flex-col gap-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-bold text-lg text-white">
                            {loan.lender_name || "N/A"}
                          </p>
                          {loan.description && (
                            <p className="text-gray-400 text-sm italic">
                              {loan.description}
                            </p>
                          )}
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)} bg-white/10`}
                        >
                          {status}
                        </span>
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
                          <span className="flex items-center gap-1">
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
