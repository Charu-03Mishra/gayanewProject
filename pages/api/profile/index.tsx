import { NextApiResponse } from "next";
import { connect } from "../../../utils/db";
import checkUserAuth from "../auth";
import jwt from "jsonwebtoken";

const handleError = (
  res: NextApiResponse,
  statusCode: number,
  message: string
) => {
  res.status(statusCode).json({ error: message });
};

export default async function handler(req: any, res: any, next: Function) {
  const { method } = req;
  if (method === "GET") {
    await checkUserAuth(req, res, next);
  }

  switch (method) {
    case "GET":
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded: any = jwt.verify(token, process.env.SECRET_KEY || "");
        const userId = decoded.id;
        const conn = await connect();
        const [rows]: any = await conn.query("SELECT * FROM members");
        // conn.end();
        const user = rows.find((u: any) => u.id === userId);
        if (user && decoded.role === "admin" || decoded.role === "member" || decoded.role === null ||  decoded.role === "") {
          res.json({ user: user });
        } else {
          res.status(404).json({ message: "User not found" });
        }
      } catch (error) {
        handleError(res, 500, "Server Error");
      }
      break;
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
