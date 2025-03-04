import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import shortid from 'shortid';

const razorpay = new Razorpay({
  //key_id: process.env.RAZORPAY_KEY as string,
  key_id: "rzp_test_fs1Cph1IswWFtY",
  //key_secret: process.env.RAZORPAY_SECRET as string,
  key_secret: "km9dy29QO8uQIWSWGzghsU7N",
});

export default async function handler(req: Request, res: Response) {
  if (req.method === "POST") {
    const {start_at, end_at, total_count, advance} = req.body;
    // Create options for the Razorpay order
    const options: any= {
        plan_id: "plan_Ngi4TlVi6gm8Cu",
        customer_notify: 1,
        quantity: 1,
        total_count: total_count,
        start_at: start_at,
        end_at: end_at,
        addons: [
            {
              item: {
                name: "Pending Payment",
                amount: advance,
                currency: "INR"
              }
            }
          ],
    };

    try {
      const response = await razorpay.subscriptions.create(options);

      res.status(200).json(
        response
      );
    } catch (err: any) {
      res.status(400).json({ error: "Failed to create subscriptions" });
    }
  } else {
    res.status(405).end();
  }
}
