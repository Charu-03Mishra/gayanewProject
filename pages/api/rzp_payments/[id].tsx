import { NextApiRequest, NextApiResponse } from "next";
import { connect } from "../../../utils/db";
import checkUserAuth from "../auth";

const handleError = (
  res: NextApiResponse,
  statusCode: number,
  message: string
) => {
  res.status(statusCode).json({ error: message });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  next: Function
) {
  const {
    method,
    query: { id },
  } = req;

  if (method === "GET") {
    await checkUserAuth(req, res, next);
  }
  switch (method) {
    case "GET":
      try {
        const conn = await connect();
        const [rows]: any = await conn.query(
          "SELECT * FROM payments WHERE member_id = ?",
          [id]
        );
        // conn.end();
        if (rows.length === 0) {
          handleError(res, 404, "payment details not found");
          return;
        }
        res.status(200).json(rows);
      } catch (error) {
        handleError(res, 500, "Server Error");
      }
      break;
    case "PUT":
      try {
        const conn = await connect();
        const [existingPayment]: any = await conn.query(
          "SELECT * FROM payments WHERE id = ?",
          [id]
        );

        if (existingPayment.length === 0) {
          handleError(res, 404, "Payment record not found");
          return;
        }

        const updatedPayment = { ...existingPayment[0], ...req.body };

        await conn.query(
          "UPDATE payments SET member_id = ?,chapter_id = ?, payment_id =?, payment_type=?,entity=?, amount=?,discount=?, cgst=?,sgst=?,total_amount=?, currency=?, status=?,mode=?, order_id=?, email=?, contact=?,verification_code=?,invoice_no = ? ,start_payment_date=?, end_payment_date =? WHERE id = ?",
          [
            updatedPayment.member_id,
            updatedPayment.chapter_id,
            updatedPayment.payment_id,
            updatedPayment.payment_type,
            updatedPayment.entity,
            updatedPayment.amount,
            updatedPayment.discount,
            updatedPayment.cgst,
            updatedPayment.sgst,
            updatedPayment.total_amount,
            updatedPayment.currency,
            updatedPayment.status,
            updatedPayment.mode,
            updatedPayment.order_id,
            updatedPayment.email,
            updatedPayment.contact,
            updatedPayment.verification_code,
            updatedPayment.invoice_no,
            updatedPayment.start_payment_date,
            updatedPayment.end_payment_date,
            id,
          ]
        );
        // conn.end();
        res.status(200).json({ message: "Payment updated successfully" });
      } catch (error) {
        handleError(res, 500, "Server Error");
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "PUT"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
