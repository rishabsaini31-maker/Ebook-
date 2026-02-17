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
    <div className="min-h-screen flex items-center justify-center">
      {!showAuth && (
        <div className="text-center bg-white/10 p-12 rounded-2xl backdrop-blur-lg border border-white/20 shadow-2xl max-w-md">
          <h1 className="text-5xl mb-5 text-shadow">Welcome to EBOOK</h1>
          <p className="text-xl mb-8">
            Your ultimate financial management tool for businesses.
          </p>
          <button
            onClick={handleEnterApp}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-full text-xl hover:from-red-600 hover:to-red-700 transition-all hover:-translate-y-0.5 shadow-lg"
          >
            Enter App
          </button>
        </div>
      )}

      {showAuth && !showSignup && (
        <div className="max-w-md mx-auto bg-white/95 p-10 rounded-3xl shadow-2xl backdrop-blur-lg border border-white/30 animate-slideIn">
          <h2 className="text-3xl text-center mb-8 text-gray-800 font-semibold">
            <i className="fas fa-sign-in-alt mr-2 text-primary"></i>
            Login
          </h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="relative">
              <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-primary z-10"></i>
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                className="w-full pl-12 pr-4 py-3 border-2 border-white/30 rounded-xl bg-white/90 backdrop-blur-sm focus:outline-none focus:border-primary focus:shadow-lg focus:-translate-y-0.5 transition-all text-gray-800"
              />
            </div>
            <div className="relative">
              <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-primary z-10"></i>
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                className="w-full pl-12 pr-4 py-3 border-2 border-white/30 rounded-xl bg-white/90 backdrop-blur-sm focus:outline-none focus:border-primary focus:shadow-lg focus:-translate-y-0.5 transition-all text-gray-800"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 shadow-lg disabled:opacity-50"
            >
              <i className="fas fa-sign-in-alt mr-2"></i>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
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
            <span className="font-medium">Continue with Google</span>
          </button>
          <p className="text-center mt-6 text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={() => setShowSignup(true)}
              className="text-primary font-semibold hover:underline transition-colors"
            >
              Sign up
            </button>
          </p>
        </div>
      )}

      {showSignup && (
        <div className="max-w-md mx-auto bg-white/95 p-10 rounded-3xl shadow-2xl backdrop-blur-lg border border-white/30 animate-slideIn">
          <h2 className="text-3xl text-center mb-8 text-gray-800 font-semibold">
            <i className="fas fa-user-plus mr-2 text-primary"></i>
            Sign Up
          </h2>
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <div className="relative">
              <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-primary z-10"></i>
              <input
                type="text"
                name="username"
                placeholder="Username"
                required
                className="w-full pl-12 pr-4 py-3 border-2 border-white/30 rounded-xl bg-white/90 backdrop-blur-sm focus:outline-none focus:border-primary focus:shadow-lg focus:-translate-y-0.5 transition-all text-gray-800"
              />
            </div>
            <div className="relative">
              <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-primary z-10"></i>
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                className="w-full pl-12 pr-4 py-3 border-2 border-white/30 rounded-xl bg-white/90 backdrop-blur-sm focus:outline-none focus:border-primary focus:shadow-lg focus:-translate-y-0.5 transition-all text-gray-800"
              />
            </div>
            <div className="relative">
              <i className="fas fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-primary z-10"></i>
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                required
                className="w-full pl-12 pr-4 py-3 border-2 border-white/30 rounded-xl bg-white/90 backdrop-blur-sm focus:outline-none focus:border-primary focus:shadow-lg focus:-translate-y-0.5 transition-all text-gray-800"
              />
            </div>
            <div className="relative">
              <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-primary z-10"></i>
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                className="w-full pl-12 pr-4 py-3 border-2 border-white/30 rounded-xl bg-white/90 backdrop-blur-sm focus:outline-none focus:border-primary focus:shadow-lg focus:-translate-y-0.5 transition-all text-gray-800"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 shadow-lg disabled:opacity-50"
            >
              <i className="fas fa-user-plus mr-2"></i>
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>
          
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
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
            <span className="font-medium">Sign up with Google</span>
          </button>
          <p className="text-center mt-6 text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => setShowSignup(false)}
              className="text-primary font-semibold hover:underline transition-colors"
            >
              Login
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
