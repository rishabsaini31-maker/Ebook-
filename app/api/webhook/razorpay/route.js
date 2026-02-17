import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

// Razorpay Webhook Handler - Most Secure Way to Handle Payments
// This endpoint is called by Razorpay servers directly when payment events occur

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    // Verify webhook signature
    const crypto = require("crypto");
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const payload = JSON.parse(body);
    const event = payload.event;

    console.log(`Webhook received: ${event}`);

    // Handle different payment events
    switch (event) {
      case "payment.captured":
        await handlePaymentCaptured(payload);
        break;

      case "payment.failed":
        await handlePaymentFailed(payload);
        break;

      case "order.paid":
        await handleOrderPaid(payload);
        break;

      default:
        console.log(`Unhandled event: ${event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

// Handle successful payment capture
async function handlePaymentCaptured(payload) {
  const payment = payload.payload.payment.entity;
  const orderId = payment.order_id;
  const paymentId = payment.id;
  const notes = payment.notes || {};

  console.log(`Payment captured: ${paymentId} for order: ${orderId}`);

  // Get order details from Razorpay to get plan info
  const Razorpay = require("razorpay");
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const order = await razorpay.orders.fetch(orderId);
  const userId = order.notes?.user_id;
  const plan = order.notes?.plan;

  if (!userId || !plan) {
    console.error("Missing user_id or plan in order notes");
    return;
  }

  // Calculate expiry date based on plan
  const planDays = {
    monthly: 30,
    "6months": 180,
    yearly: 365,
  };

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + (planDays[plan] || 30));

  // Update user to premium
  await pool.query(
    `UPDATE users SET 
      is_premium = TRUE, 
      premium_plan = $1, 
      premium_expiry = $2 
    WHERE id = $3`,
    [plan, expiryDate, userId],
  );

  console.log(
    `Premium activated for user ${userId}, plan: ${plan}, expires: ${expiryDate}`,
  );
}

// Handle payment failure
async function handlePaymentFailed(payload) {
  const payment = payload.payload.payment.entity;
  console.log(
    `Payment failed: ${payment.id}, reason: ${payment.error_description}`,
  );

  // You can log this to a payments table for tracking failed payments
  // Or send notification to user
}

// Handle order paid (alternative event)
async function handleOrderPaid(payload) {
  const order = payload.payload.order.entity;
  const payment = payload.payload.payment?.entity;

  if (payment && payment.status === "captured") {
    await handlePaymentCaptured({
      payload: {
        payment: { entity: payment },
      },
    });
  }
}
