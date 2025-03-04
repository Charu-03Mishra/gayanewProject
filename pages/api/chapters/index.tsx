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
  if (method === "POST") {
    await checkUserAuth(req, res, next);
  }

  switch (method) {
    case "GET":
      try {
        const conn = await connect();
        const [rows] = await conn.query("SELECT * FROM chapters");
        // conn.end();
        res.status(200).json(rows);
      } catch (error) {
        handleError(res, 500, "Server Error");
      }
      break;
    case "POST":
      const {
        chapter_id,
        chapter_name,
        is_launched,
        coffee_table,
        meeting_day,
        meeting_time,
        region_id,
        launched_date,
        state,
        country,
        weekly_meeting_fees,
        opening_balance,
        kitty_balance
      } = req.body;
      try {
        const conn = await connect();
        await conn.query(
          "INSERT INTO chapters (chapter_id, chapter_name, is_launched, coffee_table, meeting_day,meeting_time, region_id ,launched_date,state,country,weekly_meeting_fees, opening_balance, kitty_balance) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            chapter_id,
            chapter_name,
            is_launched,
            coffee_table,
            meeting_day,
            meeting_time,
            region_id,
            launched_date,
            state,
            country,
            weekly_meeting_fees,
            opening_balance,
            kitty_balance
          ]
        );
        // conn.end();
        res.status(201).json({ message: "Chapter created successfully" });
      } catch (error) {
        handleError(res, 500, "Server Error");
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
