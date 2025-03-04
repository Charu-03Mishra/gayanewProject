import { NextApiResponse } from "next";
import { connect } from "../../../../utils/db";
import checkUserAuth from "../../auth";

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
  if (method === "GET" || method === "POST") {
    await checkUserAuth(req, res, next);
  }

  switch (method) {
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
