"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function Loans() {
  const router = useRouter();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    lender_name: "",
    amount: "",
    paid_amount: "0",
    start_date: new Date().toISOString().split("T")[0],
    due_date: new Date().toISOString().split("T")[0],
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
          start_date: new Date().toISOString().split("T")[0],
          due_date: new Date().toISOString().split("T")[0],
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
        <h2 className="text-3xl font-bold">Loans</h2>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Add Loan Form */}
        <div className="bg-white/95 p-8 rounded-2xl shadow-2xl backdrop-blur-lg border border-white/30 mb-8">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800">
            Add Loan
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lender Name
              </label>
              <input
                type="text"
                value={formData.lender_name}
                onChange={(e) =>
                  setFormData({ ...formData, lender_name: e.target.value })
                }
                placeholder="Lender Name"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:shadow-lg transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                placeholder="Total Amount"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:shadow-lg transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Already Paid
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.paid_amount}
                onChange={(e) =>
                  setFormData({ ...formData, paid_amount: e.target.value })
                }
                placeholder="Amount Already Paid"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:shadow-lg transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:shadow-lg transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:shadow-lg transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Description"
                rows="3"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:shadow-lg transition-all"
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl hover:from-secondary hover:to-primary transition-all shadow-lg"
            >
              <i className="fas fa-plus mr-2"></i>
              Add Loan
            </button>
          </form>
        </div>

        {/* Loans List */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800">
            Loans History
          </h3>
          {loans.length === 0 ? (
            <p className="text-center text-gray-600 py-8">
              No loans recorded yet
            </p>
          ) : (
            <ul className="space-y-4">
              {loans.map((loan) => {
                const totalAmount = parseFloat(loan.amount || 0);
                const paidAmount = parseFloat(loan.paid_amount || 0);
                const pendingAmount = totalAmount - paidAmount;
                const daysUntilDue = getDaysUntilDue(loan.due_date);
                const urgent = isUrgent(loan);

                return (
                  <li
                    key={loan.id}
                    className={`p-5 rounded-xl shadow-md hover:-translate-y-1 hover:shadow-xl transition-all border ${
                      urgent
                        ? "bg-gradient-to-r from-red-500 to-red-600 border-red-500"
                        : "bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <p className="font-bold text-xl text-white">
                          {loan.lender_name || "Unknown Lender"}
                        </p>
                        <div className="flex flex-col gap-2 mt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-green-400">
                              {formatCurrency(totalAmount)}
                            </span>
                            {paidAmount > 0 && (
                              <span className="text-lg text-green-300">
                                Paid: {formatCurrency(paidAmount)}
                              </span>
                            )}
                            {pendingAmount > 0 && (
                              <span className="text-lg text-orange-400 font-bold">
                                Pending: {formatCurrency(pendingAmount)}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-4 text-sm text-gray-300">
                            {loan.start_date && (
                              <span className="flex items-center gap-1">
                                <i className="fas fa-calendar"></i>
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
                                <i className="fas fa-clock"></i>
                                Due:{" "}
                                {new Date(loan.due_date).toLocaleDateString(
                                  "en-IN",
                                )}{" "}
                                ({daysUntilDue} days)
                              </span>
                            )}
                          </div>
                        </div>
                        {loan.description && (
                          <p className="text-sm text-gray-400 italic mt-2">
                            {loan.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {pendingAmount > 0 && (
                      <div className="mt-3 text-right">
                        <button
                          onClick={() =>
                            handlePayment(
                              loan.id,
                              pendingAmount,
                              loan.lender_name,
                            )
                          }
                          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-500 transition-all shadow-lg"
                        >
                          <i className="fas fa-credit-card mr-2"></i>
                          Record Payment
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
