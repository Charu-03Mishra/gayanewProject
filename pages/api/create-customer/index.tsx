import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import shortid from 'shortid';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY as string,
  key_secret: process.env.RAZORPAY_SECRET as string,
});

export default async function handler(req: Request, res: Response) {
  if (req.method === "POST") {
    const {name,contact,email } = req.body;

    // Create options for the Razorpay order
    const options: any= {
        name: name,
        contact:contact,
        email: email,
        fail_existing: 0
    };

    try {
      const response = await razorpay.customers.create(options);

      res.status(200).json({
        id: response.id,
        name: response.name,
        contact:response.contact,
        email: response.email,
      });
    } catch (err: any) {
      res.status(400).json({ error: "Failed to create customer" });
    }
  } else {
    res.status(405).end();
  }
}
