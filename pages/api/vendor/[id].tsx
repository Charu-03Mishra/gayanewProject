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
  const {
    method,
    query: { id },
  } = req;

  switch (method) {
    case "GET":
      try {
        const conn = await connect();
        const [rows]: any = await conn.query(
          "SELECT * FROM vendor_master WHERE id = ?",
          [id]
        );
        // conn.end();
        if (rows.length === 0) {
          handleError(res, 404, "Vendor not found");
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
        const [existingVendor]: any = await conn.query(
          "SELECT * FROM vendor_master WHERE id = ?",
          [id]
        );

        if (existingVendor.length === 0) {
          handleError(res, 404, "Vendor not found");
          return;
        }

        const updatedVendor = { ...existingVendor[0], ...req.body };
        await conn.query(
          "UPDATE vendor_master SET vendor_name = ?, gst_no = ?, gst_charges = ?, tds = ?, status = ?,login_access=?, primary_number =? WHERE id = ?",
          [
            updatedVendor.vendor_name,
            updatedVendor.gst_no,
            updatedVendor.gst_charges,
            updatedVendor.tds,
            updatedVendor.status,
            updatedVendor.login_access,
            updatedVendor.primary_number,
            id,
          ]
        );
        // conn.end();
        res.status(200).json({ message: "Vendor updated successfully", vendor: updatedVendor });
      } catch (error) {
        handleError(res, 500, "Server Error");
      }
      break;

    case "DELETE":
      try {
        const conn = await connect();
        await conn.query("DELETE FROM vendor_master WHERE id = ?", [id]);
        // conn.end();
        res.status(200).json({ message: "Vendor deleted successfully" });
      } catch (error) {
        handleError(res, 500, "Server Error");
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
