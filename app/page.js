"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import Cookies from "js-cookie";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [showAuth, setShowAuth] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  // Handle Google OAuth session
  useEffect(() => {
    if (session && session.accessToken) {
      Cookies.set("token", session.accessToken);
      Cookies.set("username", session.user.username || session.user.name || "");
      Cookies.set("profile_image", session.user.image || "");
      router.push("/dashboard");
    }
  }, [session, router]);

  const handleEnterApp = () => {
    setShowAuth(true);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        Cookies.set("token", data.token);
        Cookies.set("username", data.username);
        Cookies.set("profile_image", data.profile_image || "");
        router.push("/dashboard");
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Login failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    const username = e.target.username.value;
    const email = e.target.email.value;
    const phone = e.target.phone.value;
    const password = e.target.password.value;

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, phone, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Signup successful! Please login.");
        setShowSignup(false);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Signup failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {!showAuth && (
        <div className="text-center p-12 rounded-3xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl max-w-lg mx-4">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <i className="fas fa-book-open text-4xl text-white"></i>
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              EBOOK
            </h1>
            <p className="text-xl text-gray-300 mb-2">
              Finance Analytics Platform
            </p>
            <p className="text-gray-400">
              Your ultimate financial management tool for businesses
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-gray-300">
              <i className="fas fa-check-circle text-green-400"></i>
              <span>Track Sales & Expenses</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <i className="fas fa-check-circle text-green-400"></i>
              <span>Manage Loans & Payments</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <i className="fas fa-check-circle text-green-400"></i>
              <span>Real-time Analytics & Reports</span>
            </div>
          </div>

          <button
            onClick={handleEnterApp}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl text-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all hover:-translate-y-1 shadow-lg hover:shadow-purple-500/25"
          >
            <i className="fas fa-rocket mr-2"></i>
            Get Started
          </button>
        </div>
      )}

      {showAuth && !showSignup && (
        <div className="max-w-md w-full mx-4 bg-white/95 p-10 rounded-3xl shadow-2xl backdrop-blur-lg border border-white/30">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <i className="fas fa-sign-in-alt text-2xl text-white"></i>
            </div>
            <h2 className="text-3xl text-gray-800 font-bold">Welcome Back</h2>
            <p className="text-gray-500 mt-2">Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="relative">
              <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-lg transition-all text-gray-800"
              />
            </div>
            <div className="relative">
              <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-lg transition-all text-gray-800"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:-translate-y-0.5 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-sign-in-alt mr-2"></i>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-gray-400 text-sm">or continue with</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          <button
            onClick={() => signIn("google")}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-300 hover:-translate-y-0.5 shadow-md"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="font-medium">Google</span>
          </button>

          <p className="text-center mt-6 text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={() => setShowSignup(true)}
              className="text-purple-600 font-semibold hover:underline transition-colors"
            >
              Sign up
            </button>
          </p>

          <button
            onClick={() => setShowAuth(false)}
            className="w-full mt-4 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to welcome
          </button>
        </div>
      )}

      {showSignup && (
        <div className="max-w-md w-full mx-4 bg-white/95 p-10 rounded-3xl shadow-2xl backdrop-blur-lg border border-white/30">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <i className="fas fa-user-plus text-2xl text-white"></i>
            </div>
            <h2 className="text-3xl text-gray-800 font-bold">Create Account</h2>
            <p className="text-gray-500 mt-2">Join EBOOK today</p>
          </div>

          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <div className="relative">
              <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                name="username"
                placeholder="Username"
                required
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-lg transition-all text-gray-800"
              />
            </div>
            <div className="relative">
              <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-lg transition-all text-gray-800"
              />
            </div>
            <div className="relative">
              <i className="fas fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                required
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-lg transition-all text-gray-800"
              />
            </div>
            <div className="relative">
              <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-lg transition-all text-gray-800"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:-translate-y-0.5 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-user-plus mr-2"></i>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-gray-400 text-sm">or continue with</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          <button
            onClick={() => signIn("google")}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-300 hover:-translate-y-0.5 shadow-md"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="font-medium">Google</span>
          </button>

          <p className="text-center mt-6 text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => setShowSignup(false)}
              className="text-purple-600 font-semibold hover:underline transition-colors"
            >
              Sign in
            </button>
          </p>

          <button
            onClick={() => setShowAuth(false)}
            className="w-full mt-4 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to welcome
          </button>
        </div>
      )}
    </div>
  );
}
