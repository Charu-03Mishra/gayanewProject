import { NextApiResponse } from "next";
import { connect } from "../../../utils/db";
import checkUserAuth from "../auth";

const handleError = (res: NextApiResponse, statusCode: number, message: string) => {
  res.status(statusCode).json({ error: message });
};

export default async function handler(req: any, res: any, next: Function) {
  const { method } = req;
  switch (method) {
    case "POST":
      const {
        chapter_id,
        member_id,
        amount,
        payment_made,
        mf_end_date,
      } = req.body;
      try {
        const conn = await connect();
        const result: any = await conn.query(
          "INSERT INTO members_form (chapter_id, member_id, amount, payment_made, mf_end_date) VALUES (?, ?, ?, ?, ?)",
          [chapter_id, member_id, amount, payment_made, mf_end_date]
        );
        const createdMemberId = result[0].insertId;
        const createdMember = {
          id: createdMemberId,
          chapter_id,
          member_id,
          amount,
          payment_made,
          mf_end_date,
        };
        res.status(201).json({
          message: "Member details created successfully",
          member: createdMember,
        });
      } catch (error: any) {
        handleError(res, 500, "Server Error");
      }
      break;

    case "GET":
      const { chapterId } = req.query;
      try {
        const conn = await connect();
        const members = await conn.query(
          "SELECT id, first_name, last_name FROM members WHERE chapter_id = ?",
          [chapterId]
        );
        res.status(200).json(members[0]);
      } catch (error: any) {
        handleError(res, 500, "Failed to fetch members");
      }
      break;

    default:
      res.setHeader("Allow", ["POST", "GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
