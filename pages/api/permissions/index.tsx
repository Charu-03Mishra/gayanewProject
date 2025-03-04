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
        const [rows] = await conn.query("SELECT * FROM permissions");
        // conn.end();
        res.status(200).json(rows);
      } catch (error) {
        handleError(res, 500, "Server Error");
      }
      break;
    case "POST":
      const { perm_key, perm_name } = req.body;

      try {
        const conn = await connect();

        // Check if the perm_key already exists
        const [existingPermission]: any[] = await conn.query(
          "SELECT COUNT(*) AS count FROM permissions WHERE perm_key = ?",
          [perm_key]
        );

        if (existingPermission[0].count > 0) {
          // conn.end();
          return res
            .status(400)
            .json({ error: "Permission key already exists" });
        }

        await conn.query(
          "INSERT INTO permissions (perm_key , perm_name) VALUES (?, ?)",
          [perm_key, perm_name]
        );
        // conn.end();
        res.status(201).json({ message: "Permissions created successfully" });
      } catch (error) {
        handleError(res, 500, "Server Error");
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
