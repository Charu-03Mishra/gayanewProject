import { NextApiRequest, NextApiResponse } from "next";
import { connect } from "../../../utils/db";
import upload from "@/utils/uploadMiddleware";
import checkUserAuth from "../auth";

export const config = {
  api: {
    bodyParser: false,
  },
};
const handleError = (
  res: NextApiResponse,
  statusCode: number,
  message: string
) => {
  res.status(statusCode).json({ error: message });
};

export default async function handler(req: any, res: any, next: Function) {
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
          "SELECT * FROM tds_records WHERE id = ?",
          [id]
        );
        // conn.end();
        if (rows.length === 0) {
          handleError(res, 404, "Tds record not found");
          return;
        }
        res.status(200).json(rows[0]);
      } catch (error) {
        handleError(res, 500, "Server Error");
      }
      break;
    case "PUT":
      upload.single("attachment")(req, res, async (err) => {
        if (err) {
          handleError(res, 500, "Error uploading file");
          return;
        }

        const {
          member_id,
          chapter_id,
          tan,
          tds_amount,
          income_head,
          account_name,
          bank_name,
          bank_account_number,
          ifsc_code,
          branch,
          status,
          created_by,
        } = req.body;

        const attachment = req.file ? `upload/${req.file.filename}` : null;

        try {
          const conn = await connect();
          await conn.query(
            "UPDATE tds_records SET member_id = ?, chapter_id = ?, tan = ?, tds_amount = ?, income_head = ?, account_name = ?, bank_name = ?, bank_account_number = ?, ifsc_code = ?, branch = ?, attachment = ?, status = ?, created_by = ? WHERE id = ?",
            [
              member_id,
              chapter_id,
              tan,
              tds_amount,
              income_head,
              account_name,
              bank_name,
              bank_account_number,
              ifsc_code,
              branch,
              attachment,
              status,
              created_by,
              id,
            ]
          );
          // conn.end();
          return res
            .status(200)
            .json({ message: "Tds record updated successfully" });
        } catch (error) {
          handleError(res, 500, "Server Error");
        }
      });
      break;
    case "DELETE":
      try {
        const conn = await connect();
        await conn.query("DELETE FROM tds_records WHERE id = ?", [id]);
        // conn.end();
        res.status(200).json({ message: "Tds record deleted successfully" });
      } catch (error) {
        handleError(res, 500, "Server Error");
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
