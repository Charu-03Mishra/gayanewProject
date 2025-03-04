import { NextApiResponse } from "next";
import { connect } from "../../../utils/db";
import checkUserAuth from "../auth";

export const config = {
  api: {
    bodyParser: false,
  },
};

const handleError = (res: NextApiResponse, statusCode: number, message: string) => {
  res.status(statusCode).json({ error: message });
};

export default async function handler(
  req: any,
  res: any,
  next: Function
) {
  const { method } = req;
  if (method === "GET") {
    await checkUserAuth(req, res, next);
  }

  switch (method) {
    case 'GET':
      try {
        const conn = await connect();
        const [rows]: any = await conn.query(`
        SELECT chapter_name, highest_paid_fees
        FROM (
            SELECT c.chapter_name, COUNT(*) AS highest_paid_fees
            FROM chapters c
            JOIN members m ON c.id = m.chapter_id
            WHERE CONCAT(YEAR(CURDATE()), '-', LPAD(MONTH(CURDATE()), 2, '0')) <= CONCAT(YEAR(m.mf_end_date), '-', LPAD(MONTH(m.mf_end_date), 2, '0'))
            GROUP BY c.chapter_name
        ) AS chapter_counts
        ORDER BY highest_paid_fees DESC
        LIMIT 1              
        `);
        // conn.end();
        res.status(200).json(rows);
      } catch (error) {
        handleError(res, 500, 'Server Error');
      }
      break;
    
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
