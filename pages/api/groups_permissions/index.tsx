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
    case "GET":
      try {
        const conn = await connect();
        const [rows] = await conn.query("SELECT * FROM groups_permissions");
        // conn.end();
        res.status(200).json(rows);
      } catch (error) {
        handleError(res, 500, "Server Error");
      }
      break;
    case "POST":
      const { group_id, perm_id, value } = req.body;

      try {
        const conn = await connect();
        await conn.query(
          "INSERT INTO groups_permissions (group_id, perm_id, value) VALUES (?, ?, ?)",
          [group_id, perm_id, value]
        );
        // conn.end();
        res
          .status(201)
          .json({ message: "Groups permissions created successfully" });
      } catch (error) {
        handleError(res, 500, "Server Error");
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
