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
  const { method } = req;
if (method === "GET") {
      await checkUserAuth(req, res, next);
    }
  switch (method) {
    
    case 'GET':
      try {
        const conn = await connect();
        const [rows] = await conn.query(`SELECT
    chapter_id,
    -- Sum payment amounts for each of the last four months
    COALESCE(SUM(CASE WHEN MONTH(createdAt) = MONTH(DATE_SUB(CURDATE(), INTERVAL 3 MONTH)) AND YEAR(createdAt) = YEAR(CURDATE()) AND (payment_type = 'meeting fees' OR payment_type = 'renewal fees') THEN amount ELSE 0 END), 0) AS month1,
    COALESCE(SUM(CASE WHEN MONTH(createdAt) = MONTH(DATE_SUB(CURDATE(), INTERVAL 2 MONTH)) AND YEAR(createdAt) = YEAR(CURDATE()) AND (payment_type = 'meeting fees' OR payment_type = 'renewal fees') THEN amount ELSE 0 END), 0) AS month2,
    COALESCE(SUM(CASE WHEN MONTH(createdAt) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND YEAR(createdAt) = YEAR(CURDATE()) AND (payment_type = 'meeting fees' OR payment_type = 'renewal fees') THEN amount ELSE 0 END), 0) AS month3,
    COALESCE(SUM(CASE WHEN MONTH(createdAt) = MONTH(CURDATE()) AND YEAR(createdAt) = YEAR(CURDATE()) AND (payment_type = 'meeting fees' OR payment_type = 'renewal fees') THEN amount ELSE 0 END), 0) AS month4,
    -- Total payment amount over the last four months
    COALESCE(SUM(amount), 0) AS total_amount
FROM
    payments
WHERE
    -- Filter payments from the current year
    YEAR(createdAt) = YEAR(CURDATE())
GROUP BY
    chapter_id
ORDER BY
    chapter_id`);
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
