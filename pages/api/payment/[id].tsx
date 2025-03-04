import { Request, Response } from 'express';
import Razorpay from 'razorpay';

export default async function handler(req: Request, res: Response) {
  if (req.method === "GET") {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY as string,
      key_secret: process.env.RAZORPAY_SECRET as string,
    });

    const paymentId: string = req.query.id as string;

    try {
      const response = await razorpay.payments.fetch(paymentId);
      res.status(200).json(response);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  } else {
    res.status(405).end();
  }
}
