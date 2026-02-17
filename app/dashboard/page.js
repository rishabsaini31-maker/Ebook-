"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("username");
    Cookies.remove("profile_image");
    router.push("/");
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString("en-IN")}`;
  };

  const getProfitColor = (profit) => {
    return profit < 0 ? "text-red-500" : "text-green-500";
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
        <h1 className="text-xl font-semibold absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap overflow-hidden text-ellipsis max-w-[60%]">
          Welcome {user?.username || "User"} - EBOOK Web App 2.0
        </h1>
        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all"
          >
            <i className="fas fa-sign-out-alt mr-2"></i>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6 space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg shadow-md flex items-center gap-3 ${
                  alert.type === "loan_due_soon"
                    ? "bg-gradient-to-r from-yellow-500 to-orange-500 border-yellow-500"
                    : "bg-gradient-to-r from-red-500 to-red-600 border-red-500"
                }`}
              >
                <i
                  className={`fas ${
                    alert.type === "loan_due_soon"
                      ? "fa-exclamation-triangle"
                      : "fa-exclamation-circle"
                  } text-2xl`}
                ></i>
                <p className="font-medium">{alert.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Today */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold text-gray-800">Today</h3>
              <i className="fas fa-calendar-day text-4xl text-green-500"></i>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              {new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
            <div className="space-y-2">
              <p className="text-lg">
                Income:{" "}
                <span className="font-bold text-gray-800">
                  {formatCurrency(dashboardData?.today?.income || 0)}
                </span>
              </p>
              <p className="text-lg">
                Expenses:{" "}
                <span className="font-bold text-gray-800">
                  {formatCurrency(dashboardData?.today?.expenses || 0)}
                </span>
              </p>
              <p className="text-xl font-bold">
                Profit:{" "}
                <span
                  className={getProfitColor(dashboardData?.today?.profit || 0)}
                >
                  {formatCurrency(dashboardData?.today?.profit || 0)}
                </span>
              </p>
            </div>
          </div>

          {/* Monthly */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold text-gray-800">Monthly</h3>
              <i className="fas fa-calendar-alt text-4xl text-blue-500"></i>
            </div>
            <div className="space-y-2">
              <p className="text-lg">
                Income:{" "}
                <span className="font-bold text-gray-800">
                  {formatCurrency(dashboardData?.monthly?.income || 0)}
                </span>
              </p>
              <p className="text-lg">
                Expenses:{" "}
                <span className="font-bold text-gray-800">
                  {formatCurrency(dashboardData?.monthly?.expenses || 0)}
                </span>
              </p>
              <p className="text-xl font-bold">
                Profit:{" "}
                <span
                  className={getProfitColor(
                    dashboardData?.monthly?.profit || 0,
                  )}
                >
                  {formatCurrency(dashboardData?.monthly?.profit || 0)}
                </span>
              </p>
            </div>
          </div>

          {/* Yearly */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold text-gray-800">Yearly</h3>
              <i className="fas fa-calendar text-4xl text-yellow-500"></i>
            </div>
            <div className="space-y-2">
              <p className="text-lg">
                Income:{" "}
                <span className="font-bold text-gray-800">
                  {formatCurrency(dashboardData?.yearly?.income || 0)}
                </span>
              </p>
              <p className="text-lg">
                Expenses:{" "}
                <span className="font-bold text-gray-800">
                  {formatCurrency(dashboardData?.yearly?.expenses || 0)}
                </span>
              </p>
              <p className="text-xl font-bold">
                Profit:{" "}
                <span
                  className={getProfitColor(dashboardData?.yearly?.profit || 0)}
                >
                  {formatCurrency(dashboardData?.yearly?.profit || 0)}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="mb-8">
          <h3 className="text-3xl text-center mb-6 text-white font-semibold">
            Our Services
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => router.push("/sales")}
              className="bg-gradient-to-br from-white to-gray-100 p-6 rounded-xl shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all border border-gray-200"
            >
              <i className="fas fa-shopping-cart text-4xl text-green-500 mb-3"></i>
              <p className="font-semibold text-gray-800">Sales</p>
            </button>
            <button
              onClick={() => router.push("/expenses")}
              className="bg-gradient-to-br from-white to-gray-100 p-6 rounded-xl shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all border border-gray-200"
            >
              <i className="fas fa-money-bill-wave text-4xl text-red-500 mb-3"></i>
              <p className="font-semibold text-gray-800">Expenses</p>
            </button>
            <button
              onClick={() => router.push("/pending-payments")}
              className="bg-gradient-to-br from-white to-gray-100 p-6 rounded-xl shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all border border-gray-200"
            >
              <i className="fas fa-clock text-4xl text-yellow-500 mb-3"></i>
              <p className="font-semibold text-gray-800">Pending Payments</p>
            </button>
            <button
              onClick={() => router.push("/loans")}
              className="bg-gradient-to-br from-white to-gray-100 p-6 rounded-xl shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all border border-gray-200"
            >
              <i className="fas fa-hand-holding-usd text-4xl text-teal-500 mb-3"></i>
              <p className="font-semibold text-gray-800">Loans</p>
            </button>
            <button
              onClick={() => router.push("/reports/sales")}
              className="bg-gradient-to-br from-white to-gray-100 p-6 rounded-xl shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all border border-gray-200"
            >
              <i className="fas fa-chart-line text-4xl text-blue-500 mb-3"></i>
              <p className="font-semibold text-gray-800">Sales Report</p>
            </button>
            <button
              onClick={() => router.push("/reports/expenses")}
              className="bg-gradient-to-br from-white to-gray-100 p-6 rounded-xl shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all border border-gray-200"
            >
              <i className="fas fa-chart-bar text-4xl text-purple-500 mb-3"></i>
              <p className="font-semibold text-gray-800">Expenses Report</p>
            </button>
            <button
              onClick={() => router.push("/reports/pending-payments")}
              className="bg-gradient-to-br from-white to-gray-100 p-6 rounded-xl shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all border border-gray-200"
            >
              <i className="fas fa-hourglass-half text-4xl text-orange-500 mb-3"></i>
              <p className="font-semibold text-gray-800">
                Pending Payments Report
              </p>
            </button>
            <button
              onClick={() => router.push("/reports/loans")}
              className="bg-gradient-to-br from-white to-gray-100 p-6 rounded-xl shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all border border-gray-200"
            >
              <i className="fas fa-file-invoice-dollar text-4xl text-purple-500 mb-3"></i>
              <p className="font-semibold text-gray-800">Loans Report</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
