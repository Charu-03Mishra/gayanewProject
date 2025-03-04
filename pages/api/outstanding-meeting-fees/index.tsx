import { NextApiRequest, NextApiResponse } from "next";
import { connect } from "../../../utils/db";

const handleError = (
  res: NextApiResponse,
  statusCode: number,
  message: string
) => {
  res.status(statusCode).json({ error: message });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const conn = await connect();
        const [rows] = await conn.query(
          `SELECT
              SUM(CEIL(DATEDIFF(LAST_DAY(CURDATE() + INTERVAL 1 DAY), mf_end_date) / 7) * 944) AS total_due_amount 
            FROM
              members
            WHERE
              membership_status = "Active"
              AND chapter_id NOT IN (25, 29, 10, 14, 18, 21, 23, 24, 26, 36)
              AND DATE_FORMAT(DATE_ADD(mf_end_date, INTERVAL 8 DAY), '%Y-%m-%d') <  DATE_FORMAT(NOW() + INTERVAL 1 MONTH, '%Y-%m-01') ;`
        );

        res.status(200).json(rows);
      } catch (error) {
        console.error("Error fetching data:", error);
        handleError(res, 500, 'Server Error');
      }
      break;

    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
