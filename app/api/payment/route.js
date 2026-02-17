import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import pool from "../../../lib/db";
import { authenticateToken } from "../../../lib/auth";

// Get Razorpay instance lazily
const getRazorpay = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// Create Razorpay order
export async function POST(request) {
  const user = authenticateToken(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { plan } = body;

    // Define plan prices (in paise - Indian currency)
    const plans = {
      trial: { amount: 100, name: "1 Day Trial Plan", days: 1 }, // ₹1
      monthly: { amount: 14900, name: "Monthly Plan", days: 30 }, // ₹149
      "6months": { amount: 69900, name: "6 Months Plan", days: 180 }, // ₹699
      yearly: { amount: 129900, name: "Yearly Plan", days: 365 }, // ₹1299
    };

    if (!plans[plan]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const selectedPlan = plans[plan];

    // Create Razorpay order
    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: selectedPlan.amount,
      currency: "INR",
      receipt: `receipt_${user.id}_${Date.now()}`,
      notes: {
        user_id: user.id.toString(),
        plan: plan,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: selectedPlan.amount,
      currency: "INR",
      planName: selectedPlan.name,
      planDays: selectedPlan.days,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Verify payment and update premium status
export async function PUT(request) {
  const user = authenticateToken(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
      planDays,
    } = body;

    // Verify signature
    const generatedSignature = require("crypto")
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + planDays);

    // Update user to premium
    await pool.query(
      `UPDATE users SET 
        is_premium = TRUE, 
        premium_plan = $1, 
        premium_expiry = $2 
      WHERE id = $3`,
      [plan, expiryDate, user.id],
    );

    return NextResponse.json({
      success: true,
      message: "Premium activated successfully!",
      expiryDate: expiryDate.toISOString(),
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
