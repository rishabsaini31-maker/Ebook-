"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AnalysisPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("daily");
  const [data, setData] = useState(null);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/");
      return;
    }
    fetchAnalysisData();
  }, [router, period]);

  const fetchAnalysisData = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const response = await fetch(`/api/analysis?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Error fetching analysis:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString("en-IN")}`;
  };

  const COLORS = [
    "#10B981",
    "#EF4444",
    "#3B82F6",
    "#F59E0B",
    "#8B5CF6",
    "#EC4899",
  ];
  const PIE_COLORS = [
    "#10B981",
    "#3B82F6",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
  ];

  const periods = [
    { id: "daily", label: "Daily", icon: "fa-calendar-day" },
    { id: "weekly", label: "Weekly", icon: "fa-calendar-week" },
    { id: "monthly", label: "Monthly", icon: "fa-calendar-alt" },
    { id: "yearly", label: "Yearly", icon: "fa-calendar" },
  ];

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Analysis...</p>
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
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-chart-pie text-white"></i>
              </div>
              <h1 className="text-xl font-bold text-white">Full Analysis</h1>
            </div>

            <div className="w-10"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Period Selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {periods.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                period === p.id
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              <i className={`fas ${p.icon}`}></i>
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        {data?.summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Sales</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {formatCurrency(data.summary.totalSales)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <i className="fas fa-chart-line text-blue-400 text-xl"></i>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Expenses</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {formatCurrency(data.summary.totalExpenses)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                  <i className="fas fa-receipt text-yellow-400 text-xl"></i>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Net Profit</p>
                  <p
                    className={`text-2xl font-bold ${data.summary.totalProfit >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {formatCurrency(data.summary.totalProfit)}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 ${data.summary.totalProfit >= 0 ? "bg-green-500/20" : "bg-red-500/20"} rounded-xl flex items-center justify-center`}
                >
                  <i
                    className={`fas ${data.summary.totalProfit >= 0 ? "fa-arrow-up" : "fa-arrow-down"} ${data.summary.totalProfit >= 0 ? "text-green-400" : "text-red-400"} text-xl`}
                  ></i>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Line Chart - Sales, Expenses, Profit/Loss Trend */}
        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">
            <i className="fas fa-chart-line text-cyan-400 mr-2"></i>
            Sales, Expenses & Profit/Loss Trend
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "none",
                    borderRadius: "12px",
                  }}
                  labelStyle={{ color: "#fff" }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: "#3B82F6" }}
                  name="Sales"
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  dot={{ fill: "#F59E0B" }}
                  name="Expenses"
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: "#10B981" }}
                  name="Profit"
                />
                <Line
                  type="monotone"
                  dataKey="loss"
                  stroke="#EF4444"
                  strokeWidth={3}
                  dot={{ fill: "#EF4444" }}
                  name="Loss"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart & Pie Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bar Chart */}
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">
              <i className="fas fa-chart-bar text-purple-400 mr-2"></i>
              Comparison Chart
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.chartData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "none",
                      borderRadius: "12px",
                    }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar
                    dataKey="sales"
                    fill="#3B82F6"
                    name="Sales"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="expenses"
                    fill="#F59E0B"
                    name="Expenses"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="profit"
                    fill="#10B981"
                    name="Profit"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="loss"
                    fill="#EF4444"
                    name="Loss"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expense Categories Pie Chart */}
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">
              <i className="fas fa-chart-pie text-pink-400 mr-2"></i>
              Expense Categories
            </h3>
            <div className="h-72">
              {data?.categoryData?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {data.categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <i className="fas fa-inbox text-4xl mb-2"></i>
                    <p>No expense data</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Modes Pie Chart */}
        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">
            <i className="fas fa-credit-card text-amber-400 mr-2"></i>
            Payment Mode Distribution
          </h3>
          <div className="h-72">
            {data?.paymentModeData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.paymentModeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {data.paymentModeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <i className="fas fa-inbox text-4xl mb-2"></i>
                  <p>No payment data</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white/5 backdrop-blur-lg p-4 rounded-xl border border-white/10 mb-8">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-gray-300">Sales (Blue)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-gray-300">Expenses (Yellow)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-300">Profit (Green)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-gray-300">Loss (Red)</span>
            </div>
          </div>
        </div>

        {/* Profit/Loss Summary */}
        {data?.summary && (
          <div className={`p-8 rounded-3xl border-2 ${data.summary.totalProfit >= 0 ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/50" : "bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-500/50"}`}>
            <div className="text-center">
              <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${data.summary.totalProfit >= 0 ? "bg-green-500/30" : "bg-red-500/30"}`}>
                <i className={`fas ${data.summary.totalProfit >= 0 ? "fa-arrow-trend-up" : "fa-arrow-trend-down"} text-4xl ${data.summary.totalProfit >= 0 ? "text-green-400" : "text-red-400"}`}></i>
              </div>
              
              <h2 className={`text-3xl font-bold mb-2 ${data.summary.totalProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                {data.summary.totalProfit >= 0 ? "🎉 You're in PROFIT!" : "📉 You're in LOSS!"}
              </h2>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-center gap-4 text-lg">
                  <span className="text-gray-400">Total Sales:</span>
                  <span className="font-bold text-blue-400">{formatCurrency(data.summary.totalSales)}</span>
                </div>
                <div className="flex items-center justify-center gap-4 text-lg">
                  <span className="text-gray-400">Total Expenses:</span>
                  <span className="font-bold text-yellow-400">{formatCurrency(data.summary.totalExpenses)}</span>
                </div>
                <div className="border-t border-white/10 pt-3 mt-3">
                  <div className="flex items-center justify-center gap-4 text-xl">
                    <span className="text-gray-300 font-medium">Net Result:</span>
                    <span className={`font-bold ${data.summary.totalProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {formatCurrency(Math.abs(data.summary.totalProfit))}
                      {data.summary.totalProfit >= 0 ? " Profit" : " Loss"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white/5 rounded-xl">
                <p className="text-gray-300 text-sm">
                  {data.summary.totalProfit >= 0
                    ? `💰 Great job! Your sales exceeded expenses by ${formatCurrency(data.summary.totalProfit)}. You're running a profitable business!`
                    : `⚠️ Your expenses exceeded sales by ${formatCurrency(Math.abs(data.summary.totalProfit))}. Consider reviewing your expenses to improve profitability.`
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
