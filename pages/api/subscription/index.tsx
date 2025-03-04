import { NextApiRequest, NextApiResponse } from "next";
import Razorpay from "razorpay";

interface SubscriptionRequest {
  plan_id: string;
  total_count: number;
  quantity: number;
  customer_id: null;
  customer_notify: boolean;
  current_start: number;
  current_end: number;
  ended_at: null;
  addons: {
    item: {
      name: string;
      amount: number;
      currency: string;
    };
  }[];
  offer_id: string;
  notes: {
    [key: string]: string;
  };
}

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY as string,
  key_secret: process.env.RAZORPAY_SECRET as string,
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const subscriptionRequest: SubscriptionRequest = req.body;

    instance.subscriptions.create(
      subscriptionRequest,
      (error: any, subscription: any) => {
        if (error) {
          console.error(error);
          res
            .status(500)
            .json({
              error: "An error occurred while creating the subscription.",
            });
        } else {
          res.status(200).json({subscription});
        }
      }
    );
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
};
