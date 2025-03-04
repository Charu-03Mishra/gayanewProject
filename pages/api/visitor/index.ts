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
        const [rows] = await conn.query('SELECT * FROM visitor');
        // conn.end();
        res.status(200).json(rows);
      } catch (error) {
        handleError(res, 500, 'Server Error');
      }
      break;
    case "POST":
      const { visitor_name, phone_no, email, gst, chapter } = req.body;

      try {
        const conn = await connect();
        const result: any = await conn.query(
          "INSERT INTO visitor (visitor_name, phone_no, email, gst, chapter) VALUES (?,?,?,?,?)",
          [visitor_name, phone_no, email, gst, chapter]
        );
        const createdVisitorId = result[0].insertId;
        const createVisitor = {
          id: createdVisitorId,
          visitor_name, phone_no, email, gst, chapter
        }
        // conn.end();
        res.status(201).json({ message: "Visitor created successfully", visitor:  createVisitor});
      } catch (error) {
        handleError(res, 500, "Server Error");
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
