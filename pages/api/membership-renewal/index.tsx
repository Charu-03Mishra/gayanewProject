import { NextApiRequest, NextApiResponse } from "next";
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
        const [rows]: any = await conn.query(`
          SELECT 
            SUM(CASE WHEN MONTH(membership_end_date) = MONTH(CURDATE()) AND YEAR(membership_end_date) = YEAR(CURDATE()) THEN 1 ELSE 0 END) AS current_month,
            SUM(CASE WHEN MONTH(membership_end_date) = MONTH(CURDATE() + INTERVAL 1 MONTH) AND YEAR(membership_end_date) = YEAR(CURDATE() + INTERVAL 1 MONTH) THEN 1 ELSE 0 END) AS next_month,
            SUM(CASE WHEN MONTH(membership_end_date) = MONTH(CURDATE() + INTERVAL 2 MONTH) AND YEAR(membership_end_date) = YEAR(CURDATE() + INTERVAL 2 MONTH) THEN 1 ELSE 0 END) AS next_next_month
          FROM members
        `);
        // conn.end();
        res.status(200).json(rows[0]);
      } catch (error) {
        console.error("Error fetching membership renewal data:", error);
        handleError(res, 500, 'Server Error');
      }
      break;
    
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
