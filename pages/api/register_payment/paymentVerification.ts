import { razorpayInstance } from "./razorpay"; // Adjust the import path as necessary
import crypto from "crypto";
import util from "util";
import { connect } from "../../../utils/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
  }

  const razorpay = razorpayInstance;
  console.log("req", req.body);

  const { user_id, member } = req.query;
  console.log("user_id", user_id);

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  console.log("body", body);

  const expectedSignature = crypto
      .createHmac("sha256", razorpay.key_secret)
      .update(body.toString())
      .digest("hex");

  console.log("expectedSignature", expectedSignature);
  console.log("razorpay_signature", razorpay_signature);

  const isAuthentic = expectedSignature === razorpay_signature;
  console.log("isAuthentic", isAuthentic);

  if (isAuthentic) {
      // Database connection
      const conn = await connect();

      try {
          const amountToPay = member === "Association member"? 1400 * 0.9 : 1400
          const sql = "INSERT INTO _payments (razorpay_order_id, razorpay_payment_id, razorpay_signature, user_id, total_amount) VALUES (?, ?, ?, ?, ?)";
          await conn.execute(sql, [razorpay_order_id, razorpay_payment_id, razorpay_signature, user_id, amountToPay]);
          res.redirect(`${process.env.NEXT_PUBLIC_PUBLIC_URL}/auth/register_payment/_Payment?reference=${razorpay_payment_id}`);
      } catch (error) {
          console.error('Error inserting payment data:', error);
          res.status(500).json({
              success: false,
              message: 'Internal server error'
          });
      } finally {
          // conn.end();
      }
  } else {
      res.status(400).json({
          success: false,
          message: 'Invalid signature'
      });
  }
}