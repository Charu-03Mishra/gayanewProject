// pages/api/regions/index.ts

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
        const [rows] = await conn.query(`SELECT chapter_expense.chapter_id AS id, chapter_expense.chapter_name, 
          ROUND(chapter_expense.total_chapter_expense / user_count.active_user_count, 2) AS expense_per_user 
          FROM (SELECT ch.id AS chapter_id, ch.chapter_name,
        SUM(e.amount) AS total_chapter_expense
           FROM 
               expense e
           JOIN 
               chapters ch ON e.chapter_id = ch.id
           WHERE 
               e.date_of_meeting >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
           GROUP BY 
               ch.id, ch.chapter_name) AS chapter_expense
      JOIN 
          (SELECT 
               ch.id AS chapter_id,
               COUNT(m.id) AS active_user_count
           FROM 
               members m
           JOIN 
               chapters ch ON m.chapter_id = ch.id
           WHERE 
               m.membership_status = "Active"
           GROUP BY 
               ch.id) AS user_count ON chapter_expense.chapter_id = user_count.chapter_id`);
        // conn.end();
        res.status(200).json(rows);
      } catch (error) {
        handleError(res, 500, 'Server Error');
      }
      break;
    
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
