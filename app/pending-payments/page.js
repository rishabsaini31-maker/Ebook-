'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function PendingPayments() {
  const router = useRouter();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    customer_name: '',
    amount: '',
    due_date: '',
    description: '',
  });

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/');
      return;
    }
    fetchPayments();
  }, [router]);

  const fetchPayments = async () => {
    try {
      const token = Cookies.get('token');
      const response = await fetch('/api/pending-payments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = Cookies.get('token');
      const response = await fetch('/api/pending-payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Pending payment added successfully!');
        setFormData({
          customer_name: '',
          amount: '',
          due_date: '',
          description: '',
        });
        fetchPayments();
      } else {
        const data = await response.json();
        alert('Failed to add pending payment: ' + data.error);
      }
    } catch (error) {
      alert('Failed to add pending payment: ' + error.message);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
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
          onClick={() => router.push('/dashboard')}
          className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Dashboard
        </button>
        <h2 className="text-3xl font-bold">Pending Payments</h2>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Add Payment Form */}
        <div className="bg-white/95 p-8 rounded-2xl shadow-2xl backdrop-blur-lg border border-white/30 mb-8">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800">Add Pending Payment</h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
              <input
                type="text"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                placeholder="Customer Name"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:shadow-lg transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Amount"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:shadow-lg transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:shadow-lg transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              Add Pending Payment
            </button>
          </form>
        </div>

        {/* Payments List */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800">Pending Payments History</h3>
          {payments.length === 0 ? (
            <p className="text-center text-gray-600 py-8">No pending payments recorded yet</p>
          ) : (
            <ul className="space-y-3">
              {payments.map((payment) => (
                <li
                  key={payment.id}
                  className="bg-gradient-to-r from-gray-800 to-gray-700 p-4 rounded-lg shadow-md hover:-translate-y-1 hover:shadow-xl transition-all border border-gray-600"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-lg">{payment.customer_name}</p>
                      <p className="text-sm text-gray-300">
                        {payment.due_date ? `Due: ${payment.due_date}` : 'No due date'} - {payment.description || 'No description'}
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-yellow-400">
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}