import { NextApiResponse } from "next";
import { connect } from "../../../utils/db";

const handleError = (
  res: NextApiResponse,
  statusCode: number,
  message: string
) => {
  res.status(statusCode).json({ error: message });
};

export default async function handler(req: any, res: any) {
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const conn = await connect();
        const [rows] = await conn.query(
          `SELECT 
              c.chapter_id, 
              c.chapter_name, 
              c.opening_balance, 
              SUM(CASE WHEN kb.reason IN ('MEETING FEES', 'VISITOR FEES') THEN kb.amount ELSE 0 END) AS received_total, 
              SUM(CASE WHEN kb.reason = 'CHAPTER FUND' THEN kb.amount ELSE 0 END) AS chapter_fund_total, 
              SUM(kb.management_charges) AS management_charges_total 
          FROM 
              kitty_balance kb 
          JOIN 
              chapters c ON kb.chapter_id = c.id  
          WHERE 
              kb.reason IN ('MEETING FEES', 'VISITOR FEES', 'CHAPTER FUND') 
          GROUP BY 
              c.chapter_id, c.chapter_name, c.opening_balance
          ORDER BY 
              c.chapter_id`
        );
        conn.end(); // Close the database connection
        res.status(200).json(rows);
      } catch (error) {
        handleError(res, 500, "Server Error");
      }
      break;

    case "POST":
      const {
        chapter_id,
        reason,
        given_by,
        date,
        amount,
        gst,
        total_amount,
        management_charges,
        kitty_type,
      } = req.body;
      try {
        const conn = await connect();
        const result: any = await conn.query(
          `INSERT INTO kitty_balance 
            (chapter_id, reason, given_by, date, amount, gst, total_amount, management_charges, kitty_type) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            chapter_id,
            reason,
            given_by,
            date,
            amount,
            gst,
            total_amount,
            management_charges,
            kitty_type,
          ]
        );

        if (result.length > 0) {
          const createdKittyBalanceId = result[0].insertId;
          const createdKittyBalance = {
            id: createdKittyBalanceId,
            chapter_id,
            reason,
            given_by,
            date,
            amount,
            gst,
            total_amount,
            management_charges,
            kitty_type,
          };
          conn.end(); // Close the database connection
          res.status(201).json({
            message: "Kitty balance created successfully",
            kittyBalance: createdKittyBalance,
          });
        } else {
          handleError(res, 500, "Failed to insert kitty balance");
        }
      } catch (error: any) {
        handleError(res, 500, "Server Error");
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
