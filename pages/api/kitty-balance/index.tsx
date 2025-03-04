import { NextApiResponse } from "next";
import { connect } from "../../../utils/db";

const handleError = (
  res: NextApiResponse,
  statusCode: number,
  message: string,
  sqlMessage?: any
) => {
  res.status(statusCode).json({ error: message });
};

export default async function handler(req: any, res: any, next: Function) {
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const conn = await connect();
        // const [rows] = await conn.query("SELECT * FROM kitty_balance where kitty_type = 't2'");
        const [rows] = await conn.query(
          "SELECT c.chapter_id, c.chapter_name, c.opening_balance, SUM(CASE WHEN kb.reason IN ('MEETING FEES', 'VISITOR FEES') THEN kb.amount ELSE 0 END) AS received_total, SUM(CASE WHEN kb.reason = 'CHAPTER FUND' THEN kb.amount ELSE 0 END) AS chapter_fund_total FROM kitty_balance kb JOIN chapters c ON kb.chapter_id = c.id WHERE kb.reason IN ('MEETING FEES', 'VISITOR FEES', 'CHAPTER FUND') GROUP BY c.chapter_id, c.chapter_name, c.opening_balance ORDER BY c.chapter_id"
        );
        // conn.end();
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
          "INSERT INTO kitty_balance(chapter_id,reason,given_by,date,amount,gst,total_amount,management_charges,kitty_type) VALUES (?,?,?,?,?,?,?,?,?)",
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
        const createdKittyBalaceId = result[0].insertId;
        const createdKittyBalace = {
          id: createdKittyBalaceId,
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
        // conn.end();
        res.status(201).json({
          message: "Kitty balance created successfully",
          kittyBalace: createdKittyBalace,
        });
      } catch (error: any) {
        handleError(res, 500, "Server Error");
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
