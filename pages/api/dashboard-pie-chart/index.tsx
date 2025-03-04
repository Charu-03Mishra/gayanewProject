import { NextApiResponse } from "next";
import { connect } from "../../../utils/db";
import checkUserAuth from "../auth";
import moment from "moment";

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
  const { method } = req;
  if (method === "GET") {
    await checkUserAuth(req, res, next);
  }

  switch (method) {
    case "GET":
      try {
        const conn = await connect();
        const chapterId = req.query.chapter_id;
        let query = `SELECT 
    SUM(CASE 
            WHEN MONTH(members.mf_end_date) = MONTH(CURDATE()) 
                 AND YEAR(members.mf_end_date) = YEAR(CURDATE()) THEN 1
            ELSE 0
        END) AS paidCurrent,
    SUM(CASE 
            WHEN members.mf_end_date < CURDATE() THEN 1
            ELSE 0
        END) AS pendingCount,
    SUM(CASE 
            WHEN members.mf_end_date >= LAST_DAY(CURDATE()) + INTERVAL 1 DAY THEN 1
            ELSE 0
        END) AS paidAdvance
FROM members
LEFT JOIN payments as p on p.member_id = members.id
where p.payment_type='meeting fees' and p.status = 'captured' and membership_status='Active'`
        // let query = `SELECT * FROM members`;
        // let query = "SELECT * FROM members where membership_status='Active'";
        let queryParams: any[] = [];

        if (chapterId && chapterId !== "all") {
          // query+=` LEFT JOIN payments as p on p.member_id = members.id and p.chapter_id = ?`
          // queryParams.push(chapterId);
          query += " AND members.chapter_id = ?";
          queryParams.push(chapterId);
        }
        // query += ` where membership_status='Active' ${chapterId && chapterId !== "all" ? `and p.status = 'captured'` : ''}`

        const [rows]: any = await conn.query(query, queryParams);

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();

        // Filter for pending meeting fees
        // const pendingCount = rows.filter((member: any) => {
        //   if (member.mf_end_date) {
        //     const mfEndDate = new Date(member.mf_end_date);
        //     return mfEndDate < currentDate; // End date is in the past
        //   }
        //   return false;
        // }).length;

        // // Filter for meeting fees paid in the current month
        // const paidCurrent = rows.filter((member: any) => {
        //   if (member.mf_end_date) {
        //     const mfEndDate = new Date(member.mf_end_date);
        //     return (
        //       mfEndDate.getFullYear() === currentYear &&
        //       mfEndDate.getMonth() === currentMonth
        //     );
        //   }
        //   return false;
        // }).length;

        // // Filter for meeting fees paid in advance
        // const paidAdvance = rows.filter((member: any) => {
        //   if (member.mf_end_date) {
        //     const mfEndDate = new Date(member.mf_end_date);
        //     return (
        //       mfEndDate.getFullYear() > currentYear ||
        //       (mfEndDate.getFullYear() === currentYear &&
        //         mfEndDate.getMonth() > currentMonth)
        //     );
        //   }
        //   return false;
        // }).length;

        // const responseData = {
        //   pendingCount,
        //   paidCurrent,
        //   paidAdvance,
        // };
        const responseData = {
          pendingCount: parseInt(rows[0].pendingCount),
          paidCurrent: parseInt(rows[0].paidCurrent),
          paidAdvance: parseInt(rows[0].paidAdvance),
        };

        console.log("Response Data:", responseData);

        res.status(200).json(responseData);
      } catch (error) {
        console.error("Error fetching member data:", error);
        handleError(res, 500, "Server Error");
      }
      break;

    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
