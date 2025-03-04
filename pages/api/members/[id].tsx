import { NextApiRequest, NextApiResponse } from "next";
import { connect } from "../../../utils/db";
import checkUserAuth from "../auth";

const handleError = (
  res: NextApiResponse,
  statusCode: number,
  message: string
) => {
  res.status(statusCode).json({ error: message });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  next: Function
) {
  const {
    method,
    query: { id },
  } = req;

  if (method === "GET") {
    await checkUserAuth(req, res, next);
  }

  switch (method) {
    case "GET":
      try {
        const conn = await connect();
        const [rows]: any = await conn.query(
          "SELECT * FROM members WHERE id = ?",
          [id]
        );
        // conn.end();
        if (rows.length === 0) {
          handleError(res, 404, "Member not found");
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
        const [existingMember]: any = await conn.query(
          "SELECT * FROM members WHERE id = ?",
          [id]
        );

        if (existingMember.length === 0) {
          handleError(res, 404, "Member not found");
          return;
        }

        const updatedMember = { ...existingMember[0], ...req.body };

        await conn.query(
          "UPDATE members SET membership_id = ?, title =?, first_name = ?, last_name = ?, company_name = ?, gst_no = ?, add_line_1 = ?, add_line_2 = ?, city = ?,state = ?, postcode = ?,role = ?, membership_status  = ?,profession = ?,speciality = ?,chapter_id = ?,primary_number = ?,email = ?,permission_LT =? ,permission_SGDC = ? ,flag = ? ,mf_start_date = ?,mf_end_date = ?,membership_start_date = ?,membership_end_date = ?,manual_induction = ?, outstanding_balance = ?  WHERE id = ?",
          [
            updatedMember.membership_id,
            updatedMember.title,
            updatedMember.first_name,
            updatedMember.last_name,
            updatedMember.company_name,
            updatedMember.gst_no,
            updatedMember.add_line_1,
            updatedMember.add_line_2,
            updatedMember.city,
            updatedMember.state,
            updatedMember.postcode,
            updatedMember.role,
            updatedMember.membership_status,
            updatedMember.profession,
            updatedMember.speciality,
            updatedMember.chapter_id,
            updatedMember.primary_number,
            updatedMember.email,
            updatedMember.permission_LT,
            updatedMember.permission_SGDC,
            updatedMember.flag,
            updatedMember.mf_start_date,
            updatedMember.mf_end_date,
            updatedMember.membership_start_date,
            updatedMember.membership_end_date,
            updatedMember.manual_induction,
            updatedMember.outstanding_balance,
            id,
          ]
        );
        // conn.end();
        res.status(200).json({ message: "Member updated successfully" });
      } catch (error) {
        handleError(res, 500, "Server Error");
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "PUT"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
