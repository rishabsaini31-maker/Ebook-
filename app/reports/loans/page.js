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

  const getTotalPaid = () => {
    return filteredLoans
      .filter((loan) => {
        const totalAmount = parseFloat(loan.amount || 0);
        const paidAmount = parseFloat(loan.paid_amount || 0);
        return paidAmount >= totalAmount;
      })
      .reduce((sum, loan) => sum + parseFloat(loan.amount || 0), 0);
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
        return "text-green-600 font-bold";
      case "Overdue":
        return "text-red-600 font-bold";
      case "Due Soon":
        return "text-orange-600 font-bold";
      case "Upcoming":
        return "text-yellow-600 font-bold";
      case "Active":
        return "text-green-600 font-bold";
      default:
        return "text-gray-600";
    }
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
        <h2 className="text-3xl font-bold">Loans Report</h2>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Period Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          {["all", "active", "due-soon"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                period === p
                  ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
                  : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 hover:from-gray-200 hover:to-gray-300"
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1).replace("-", " ")}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="text-4xl mb-2">🧮</div>
            <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Total Loan Amount
            </h4>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {formatCurrency(getTotalAmount())}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="text-4xl mb-2">🕐</div>
            <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Active Loans
            </h4>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {formatCurrency(getTotalPending())}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="text-4xl mb-2">✅</div>
            <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Completed Loans
            </h4>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {formatCurrency(getTotalPaid())}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="text-4xl mb-2">🔢</div>
            <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Number of Loans
            </h4>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {filteredLoans.length}
            </p>
          </div>
        </div>

        {/* Report Content */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">
            {period.charAt(0).toUpperCase() + period.slice(1).replace("-", " ")}{" "}
            Loans
          </h3>

          {filteredLoans.length === 0 ? (
            <p className="text-center text-gray-600 py-8">
              No loans found for this period.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-purple-600 text-white">
                    <th className="px-4 py-3 text-left font-semibold text-sm">
                      Lender Name
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-sm">
                      Total Amount
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-sm">
                      Paid Amount
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-sm">
                      Pending Amount
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-sm">
                      Start Date
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-sm">
                      Due Date
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-sm">
                      Days Left
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-sm">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-sm">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLoans.map((loan, index) => {
                    const totalAmount = parseFloat(loan.amount || 0);
                    const paidAmount = parseFloat(loan.paid_amount || 0);
                    const pendingAmount = totalAmount - paidAmount;
                    const daysUntilDue = getDaysUntilDue(loan.due_date);
                    const status = getStatus(loan);

                    return (
                      <tr
                        key={loan.id}
                        className={`${
                          index % 2 === 0 ? "bg-gray-50" : "bg-white"
                        } hover:bg-gray-100 transition-colors`}
                      >
                        <td className="px-4 py-3 border-b border-gray-200 font-semibold">
                          {loan.lender_name || "N/A"}
                        </td>
                        <td className="px-4 py-3 border-b border-gray-200 font-bold text-red-600">
                          {formatCurrency(totalAmount)}
                        </td>
                        <td className="px-4 py-3 border-b border-gray-200 text-green-600">
                          {formatCurrency(paidAmount)}
                        </td>
                        <td className="px-4 py-3 border-b border-gray-200 font-bold text-orange-600">
                          {formatCurrency(pendingAmount)}
                        </td>
                        <td className="px-4 py-3 border-b border-gray-200">
                          {loan.start_date
                            ? new Date(loan.start_date).toLocaleDateString(
                                "en-IN",
                              )
                            : "-"}
                        </td>
                        <td className="px-4 py-3 border-b border-gray-200">
                          {loan.due_date
                            ? new Date(loan.due_date).toLocaleDateString(
                                "en-IN",
                              )
                            : "-"}
                        </td>
                        <td className="px-4 py-3 border-b border-gray-200">
                          {daysUntilDue !== null ? daysUntilDue : "N/A"}
                        </td>
                        <td
                          className={`px-4 py-3 border-b border-gray-200 ${getStatusColor(status)}`}
                        >
                          {status}
                        </td>
                        <td className="px-4 py-3 border-b border-gray-200">
                          {loan.description || "-"}
                        </td>
                        <td className="px-4 py-3 border-b border-gray-200">
                          {pendingAmount > 0 ? (
                            <button
                              onClick={() =>
                                handlePayment(
                                  loan.id,
                                  pendingAmount,
                                  loan.lender_name,
                                )
                              }
                              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-lg text-sm hover:from-green-600 hover:to-green-500 transition-all"
                            >
                              Pay
                            </button>
                          ) : (
                            <span className="text-green-600 font-bold text-sm">
                              Paid
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
