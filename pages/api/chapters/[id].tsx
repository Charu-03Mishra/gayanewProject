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
  next:Function
) {
  const {
    method,
    query: { id },
  } = req;
  if (method === 'PUT' || method === 'GET' || method === 'DELETE') {
    await checkUserAuth(req, res, next);
  }
  switch (method) {
    case "GET":
      try {
        const conn = await connect();
        const [rows]: any = await conn.query(
          "SELECT * FROM chapters WHERE id = ?",
          [id]
        );
        // conn.end();
        if (rows.length === 0) {
          handleError(res, 404, "Chapter not found");
          return;
        }
        res.status(200).json(rows[0]);
      } catch (error) {
        handleError(res, 500, "Server Error");
      }
      break;
      case "PUT":
        try {
          const conn = await connect();
          const [existingChapter]: any = await conn.query(
            "SELECT * FROM chapters WHERE id = ?",
            [id]
          );
      
          if (existingChapter.length === 0) {
            handleError(res, 404, "Chapter not found");
            return;
          }
      
          const updatedChapter = { ...existingChapter[0], ...req.body };
      
          await conn.query(
            "UPDATE chapters SET chapter_id = ?, chapter_name = ?, is_launched = ?, coffee_table = ?, meeting_day = ?, meeting_time = ?,weekly_meeting_fees =?,monthly_subscription_fees=?, region_id = ?, launched_date = ?, state = ?, country = ?, opening_balance=?, kitty_balance=? WHERE id = ?",
            [
              updatedChapter.chapter_id,
              updatedChapter.chapter_name,
              updatedChapter.is_launched,
              updatedChapter.coffee_table,
              updatedChapter.meeting_day,
              updatedChapter.meeting_time,
              updatedChapter.weekly_meeting_fees,
              updatedChapter.monthly_subscription_fees,
              updatedChapter.region_id,
              updatedChapter.launched_date,
              updatedChapter.state,
              updatedChapter.country,
              updatedChapter.opening_balance,
              updatedChapter.kitty_balance,
              id,
            ]
          );
          // conn.end();
          res.status(200).json({ message: "Chapter updated successfully" });
        } catch (error) {
          handleError(res, 500, "Server Error");
        }
        break;
    case "DELETE":
      try {
        const conn = await connect();
        await conn.query("DELETE FROM chapters WHERE id = ?", [id]);
        // conn.end();
        res.status(200).json({ message: "Chapter deleted successfully" });
      } catch (error) {
        handleError(res, 500, "Server Error");
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
