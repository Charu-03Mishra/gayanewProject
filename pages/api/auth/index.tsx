import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { connect } from "../../../utils/db";

// export default checkUserAuth;
const checkUserAuth = async (
  req: any,
  res: NextApiResponse,
  next: Function
) => {
  let token;
  const { authorization } = req.headers;
  if (authorization && authorization.startsWith("Bearer")) {
    try {
      token = authorization.split(" ")[1];

      const decoded: any = jwt.verify(token, process.env.SECRET_KEY || "");
      console.log("decoded", decoded);
      const conn = await connect();
      if (
        decoded.role === "member" ||
        decoded.role === "admin" ||
        decoded.role === null ||
        decoded.role === ""
      ) {
        req.user = await conn.query("SELECT * FROM members WHERE id = ?", [
          decoded.id,
        ]);
      } else if (decoded.role === "vendor") {
        req.user = await conn.query(
          "SELECT * FROM vendor_master WHERE id = ?",
          [decoded.id]
        );
      } else {
        res
          .status(401)
          .json({ status: "failed", message: "Unauthorized User" });
      }
    } catch (error) {
      res.status(401).json({ status: "failed", message: "Unauthorized User" });
    }
  } else {
    res
      .status(401)
      .json({ status: "failed", message: "Unauthorized User, No Token" });
  }
};

export default checkUserAuth;
