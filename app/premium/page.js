"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function PremiumPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/");
      return;
    }
    fetchProfile();
  }, [router]);

  const fetchProfile = async () => {
    try {
      const token = Cookies.get("token");
      const response = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const plans = [
    {
      id: "trial",
      name: "1 Day Trial",
      price: 1,
      period: "day",
      description: "Test premium features for 1 day",
      features: [
        "Unlimited transaction records",
        "Full Analysis & advanced charts",
        "Export data to PDF/Excel",
        "Priority customer support",
        "Custom categories",
        "Budget planning tools",
      ],
      color: "from-green-500 to-emerald-500",
      popular: false,
    },
    {
      id: "monthly",
      name: "Monthly",
      price: 149,
      period: "month",
      description: "Perfect for trying out premium features",
      features: [
        "Unlimited transaction records",
        "Full Analysis & advanced charts",
        "Export data to PDF/Excel",
        "Priority customer support",
        "Custom categories",
        "Budget planning tools",
      ],
      color: "from-blue-500 to-cyan-500",
      popular: false,
    },
    {
      id: "6months",
      name: "6 Months",
      price: 699,
      originalPrice: 894,
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
      price: 1299,
      originalPrice: 1788,
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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (plan) => {
    setLoading(true);
    setSelectedPlan(plan.id);

    try {
      const token = Cookies.get("token");

      // Create Razorpay order
      const orderResponse = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: plan.id }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }

      const orderData = await orderResponse.json();

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Failed to load Razorpay SDK. Please try again.");
        setLoading(false);
        return;
      }

      // Open Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "EBOOK Premium",
        description: orderData.planName,
        image: "/logo.png",
        handler: async (response) => {
          try {
            // Verify payment
            const verifyResponse = await fetch("/api/payment", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: plan.id,
                planDays: orderData.planDays,
              }),
            });

            if (verifyResponse.ok) {
              alert("🎉 Premium activated successfully!");
              fetchProfile();
              router.push("/dashboard");
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } catch (error) {
            console.error("Error verifying payment:", error);
            alert("Error verifying payment. Please contact support.");
          }
        },
        prefill: {
          name: profile?.username || "",
          email: profile?.email || "",
          contact: profile?.phone || "",
        },
        theme: {
          color: "#8B5CF6",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setSelectedPlan(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Error initiating payment:", error);
      alert("Failed to initiate payment. Please try again.");
    }

    setLoading(false);
    setSelectedPlan(null);
  };

  // Check if user is already premium
  if (profile?.is_premium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-xl p-12 rounded-3xl border border-amber-500/50">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center">
            <i className="fas fa-crown text-white text-4xl"></i>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            You're Already Premium!
          </h2>
          <p className="text-gray-300 mb-2">Plan: {profile.premium_plan}</p>
          <p className="text-gray-400 mb-6">
            Expires:{" "}
            {new Date(profile.premium_expiry).toLocaleDateString("en-IN")}
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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
                  {loading && selectedPlan === plan.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </span>
                  ) : (
                    "Choose Plan"
                  )}
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
                <i className="fas fa-chart-pie text-white text-xl"></i>
              </div>
              <h4 className="text-white font-semibold mb-2">Full Analysis</h4>
              <p className="text-gray-400 text-sm">
                Access detailed charts and analytics to understand your business
                better.
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

        {/* Free vs Premium */}
        <div className="mt-12 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            <i className="fas fa-balance-scale text-cyan-400 mr-2"></i>
            Free vs Premium
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-gray-400">Feature</th>
                  <th className="text-center py-4 px-4 text-gray-400">Free</th>
                  <th className="text-center py-4 px-4 text-amber-400">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-4 text-gray-300">Monthly Entries</td>
                  <td className="py-4 px-4 text-center text-gray-400">5</td>
                  <td className="py-4 px-4 text-center text-green-400">
                    Unlimited
                  </td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-4 text-gray-300">Full Analysis</td>
                  <td className="py-4 px-4 text-center text-red-400">
                    <i className="fas fa-times"></i>
                  </td>
                  <td className="py-4 px-4 text-center text-green-400">
                    <i className="fas fa-check"></i>
                  </td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-4 text-gray-300">Export Reports</td>
                  <td className="py-4 px-4 text-center text-red-400">
                    <i className="fas fa-times"></i>
                  </td>
                  <td className="py-4 px-4 text-center text-green-400">
                    <i className="fas fa-check"></i>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-300">Priority Support</td>
                  <td className="py-4 px-4 text-center text-red-400">
                    <i className="fas fa-times"></i>
                  </td>
                  <td className="py-4 px-4 text-center text-green-400">
                    <i className="fas fa-check"></i>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
