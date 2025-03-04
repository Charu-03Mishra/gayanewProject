import { NextApiResponse } from "next";
import { connect } from "../../../utils/db";

const handleError = (
  res: NextApiResponse,
  statusCode: number,
  message: string
) => {
  res.status(statusCode).json({ error: message });
};

export default async function handler(
  req: any,
  res: NextApiResponse,
) {
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const conn = await connect();
        const [rows]: any = await conn.query(
          "SELECT invoice_no FROM payments where status = 'captured' order by invoice_no desc limit 1"
        );
        // conn.end();

        if (rows.length > 0) {
          res.status(200).json({ lastGeneratedId: rows[0].invoice_no });
        } else {
          res.status(200).json({ lastGeneratedId: null });
        }
      } catch (error) {
        console.log('error', error)
        handleError(res, 500, "Server Error");
      }
      break;

    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
