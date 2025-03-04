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
        const [rows] = await conn.query("SELECT * FROM kitty_config");
        // conn.end();
        res.status(200).json(rows);
      } catch (error) {
        handleError(res, 500, "Server Error");
      }
      break;
    
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
