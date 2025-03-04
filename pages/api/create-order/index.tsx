import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import shortid from 'shortid';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY as string,
  key_secret: process.env.RAZORPAY_SECRET as string,
});

export default async function handler(req: Request, res: Response) {
  if (req.method === "POST") {
    const { amount, currency,chapter_id,gstin,member_email,member_name,member_phone, remark,type, start_at, end_at, penalty_fees, outstanding_balance } = req.body;

    // Create options for the Razorpay order
    const options: any= {
      amount: parseInt(amount), // amount in paisa
      currency: currency || "INR",
      receipt: shortid.generate(), // Generate a unique receipt ID
      payment_capture: 1, // Auto-capture payment
      notes: {
        chapter_id:chapter_id,
        gstin:gstin,
        member_email:member_email,
        member_name:member_name,
        member_phone:member_phone,
        remark:remark,
        type:type,
        penalty_fees: penalty_fees,
        outstanding_balance: outstanding_balance,
        start_at: start_at,
        end_at: end_at,
      },
    };

    try {
      const response = await razorpay.orders.create(options);

      res.status(200).json(response);
    } catch (err: any) {
      res.status(400).json({ error: "Failed to create order" });
    }
  } else {
    res.status(405).end();
  }
}
