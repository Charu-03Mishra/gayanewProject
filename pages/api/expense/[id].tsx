import { NextApiRequest, NextApiResponse } from "next";
import { connect } from "../../../utils/db";
import checkUserAuth from "../auth";
import expenseUpload from "@/utils/expenseMiddleware";

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

export default async function handler(
  req: any,
  res: any,
  next: Function
) {
  const {
    method,
    query: { id },
  } = req;
  if (method === "PUT" || method === "GET" || method === "DELETE") {
    await checkUserAuth(req, res, next);
  }
  switch (method) {
    case "GET":
      try {
        const conn = await connect();
        const [rows]: any = await conn.query(
          "SELECT * FROM expense WHERE id = ?",
          [id]
        );
        // conn.end();
        if (rows.length === 0) {
          handleError(res, 404, "Expense not found");
          return;
        }
        res.status(200).json(rows[0]);
      } catch (error) {
        handleError(res, 500, "Server Error");
      }
      break;
      case "PUT":
        expenseUpload.single('document')(req, res, async (err) => {
      
          if (err) {
            handleError(res, 500, "Error uploading file");
            return;
          }
      
          const { id } = req.query; // Extract the `id` from the request body
      
          // Get the new document path from the uploaded file
          const document = req.file ? `expense/${req.file.filename}` : null;
      
          // Prepare the parameters for the SQL query
          const params = {
            id,
            chapter_id: req.body.chapter_id,
            date_of_meeting: req.body.date_of_meeting,
            expense: req.body.expense,
            expense_type: req.body.expense_type,
            expense_head: req.body.expense_head,
            vendor_id: req.body.vendor_id,
            amount: req.body.amount,
            document,
            paid_status: req.body.paid_status,
            status: req.body.status,
            invoice_no: req.body.invoice_no,
            created_by: req.body.created_by,
          };

          // Construct the SQL query based on the presence of the `paid_status` field
          let sql;
          let values;
          if ('paid_status' in req.body) {
            sql = `UPDATE expense SET paid_status = ? WHERE id = ?`;
            values = [req.body.paid_status, id];
          } else if('status' in req.body){
            sql = `UPDATE expense SET status = ? WHERE id = ?`;
            values = [req.body.status, id];
          } else {
            sql = `UPDATE expense SET ? WHERE id = ?`;
            values = [params, id];
          }
      
          try {
            const conn = await connect();
            await conn.query(sql, values);
            // conn.end();
            return res.status(200).json({ message: "Expense updated successfully" });
          } catch (error) {
            handleError(res, 500, "Server Error");
          }
        });
        break;
      
    case "DELETE":
      try {
        const conn = await connect();
        await conn.query("DELETE FROM expense WHERE id = ?", [id]);
        // conn.end();
        res.status(200).json({ message: "Expense deleted successfully" });
      } catch (error) {
        handleError(res, 500, "Server Error");
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
