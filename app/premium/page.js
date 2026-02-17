"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function PremiumPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/");
    }
  }, [router]);

  const plans = [
    {
      id: "monthly",
      name: "Monthly",
      price: 299,
      period: "month",
      description: "Perfect for trying out premium features",
      features: [
        "Unlimited transaction records",
        "Advanced analytics & reports",
        "Export data to PDF/Excel",
        "Priority customer support",
        "Custom categories",
        "Budget planning tools",
      ],
      color: "from-blue-500 to-cyan-500",
      popular: false,
    },
    {
      id: "halfyearly",
      name: "6 Months",
      price: 1499,
      originalPrice: 1794,
      period: "6 months",
      description: "Best value for growing businesses",
      features: [
        "Everything in Monthly",
        "Multi-user access (up to 3)",
        "Advanced loan tracking",
        "Automated backup",
        "Custom reports",
        "Email notifications",
      ],
      color: "from-purple-500 to-pink-500",
      popular: true,
    },
    {
      id: "yearly",
      name: "Yearly",
      price: 2499,
      originalPrice: 3588,
      period: "year",
      description: "Maximum savings for serious businesses",
      features: [
        "Everything in 6 Months",
        "Unlimited users",
        "API access",
        "White-label reports",
        "Dedicated account manager",
        "Custom integrations",
      ],
      color: "from-amber-500 to-yellow-500",
      popular: false,
    },
  ];

  const handleSubscribe = async (plan) => {
    setLoading(true);
    // TODO: Implement payment integration
    alert(
      `Subscription to ${plan.name} plan coming soon! Price: ₹${plan.price}`,
    );
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-gray-900/80 backdrop-blur-lg border-b border-white/10 sticky top-0">
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
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-crown text-white"></i>
              </div>
              <h1 className="text-xl font-bold text-white">Premium Plans</h1>
            </div>

            <div className="w-10"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <i className="fas fa-sparkles"></i>
            Upgrade to Premium
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Unlock the Full Power of{" "}
            <span className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
              EBOOK
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Get access to advanced features, unlimited records, and premium
            support to grow your business faster.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white/10 backdrop-blur-xl rounded-3xl border ${
                plan.popular
                  ? "border-amber-500/50 scale-105"
                  : "border-white/20"
              } overflow-hidden transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-center py-2 text-sm font-bold">
                  <i className="fas fa-star mr-1"></i> MOST POPULAR
                </div>
              )}

              <div className={`p-6 ${plan.popular ? "pt-10" : ""}`}>
                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${plan.color} rounded-2xl flex items-center justify-center shadow-lg`}
                  >
                    <i className="fas fa-crown text-white text-2xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-400 text-lg">₹</span>
                    <span className="text-5xl font-black text-white">
                      {plan.price}
                    </span>
                    <span className="text-gray-400">/{plan.period}</span>
                  </div>
                  {plan.originalPrice && (
                    <p className="text-green-400 text-sm mt-2">
                      <i className="fas fa-tag mr-1"></i>
                      Save ₹{plan.originalPrice - plan.price} (
                      {Math.round(
                        ((plan.originalPrice - plan.price) /
                          plan.originalPrice) *
                          100,
                      )}
                      % off)
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-3 text-gray-300"
                    >
                      <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-check text-green-400 text-xs"></i>
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Subscribe Button */}
                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading}
                  className={`w-full py-4 rounded-xl font-bold transition-all ${
                    plan.popular
                      ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:from-amber-400 hover:to-yellow-400 shadow-lg shadow-amber-500/30"
                      : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                  } disabled:opacity-50`}
                >
                  {loading ? "Processing..." : "Choose Plan"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            <i className="fas fa-chart-bar text-purple-400 mr-2"></i>
            Why Go Premium?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white/5 rounded-2xl">
              <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <i className="fas fa-infinity text-white text-xl"></i>
              </div>
              <h4 className="text-white font-semibold mb-2">
                Unlimited Records
              </h4>
              <p className="text-gray-400 text-sm">
                Store unlimited sales, expenses, and loan records without any
                restrictions.
              </p>
            </div>

            <div className="text-center p-6 bg-white/5 rounded-2xl">
              <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <i className="fas fa-file-export text-white text-xl"></i>
              </div>
              <h4 className="text-white font-semibold mb-2">Export Reports</h4>
              <p className="text-gray-400 text-sm">
                Download your data in PDF or Excel format for offline access.
              </p>
            </div>

            <div className="text-center p-6 bg-white/5 rounded-2xl">
              <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <i className="fas fa-headset text-white text-xl"></i>
              </div>
              <h4 className="text-white font-semibold mb-2">
                Priority Support
              </h4>
              <p className="text-gray-400 text-sm">
                Get 24/7 dedicated support from our expert team.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">Have questions about premium?</p>
          <button className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
            <i className="fas fa-question-circle mr-2"></i>
            View FAQ
          </button>
        </div>
      </div>
    </div>
  );
}
