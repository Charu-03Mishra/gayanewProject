import { NextApiRequest, NextApiResponse } from "next";
import { connect } from "../../../utils/db";
import checkUserAuth from "../auth";
import moment from "moment";
import { Readable } from 'stream';

const handleError = (res: NextApiResponse, statusCode: number, message: string) => {
  res.status(statusCode).json({ error: message });
};

export default async function handler(req: any, res: any, next: Function) {
  const { method } = req;

  if (method === "GET") {
    await checkUserAuth(req, res, next);
  }

  switch (method) {
    case 'GET':
      const { search, startDate, endDate }: any = req.query;
      const searchQuery = search ? `%${search}%` : '%';

      try {
        const conn = await connect();

        const fields = [
            "CONCAT(m.first_name, ' ', m.last_name)",
            "c.chapter_name",
          ];
  

        let whereClauses = [];
        let queryParams = [];
        whereClauses.push('m.membership_status = ?');
        queryParams.push("Active");
        // Constructing search condition
        if (search) {
          whereClauses.push(`(${fields.map(field => `${field} LIKE ?`).join(' OR ')})`);
          queryParams.push(...fields.map(() => searchQuery));
        }

        if (req.user[0][0].permission_SGDC) {
            whereClauses.push('m.chapter_id IN (?)');
            const querySGDC = `SELECT chapter_id FROM sgdc WHERE id = ?`;
            const [sgdcRows]: any = await conn.query(querySGDC, [req.user[0][0].permission_SGDC]);
            const chapterId = JSON.parse(sgdcRows[0].chapter_id);
            queryParams.push(chapterId);
          } else if (req.user[0][0].permission_LT) {
            whereClauses.push(`m.chapter_id = ?`);
            const queryLT = `SELECT chapter_id FROM leadership WHERE id = ?`;
            const [ltRows]: any = await conn.query(queryLT, [req.user[0][0].permission_LT]);
            const chapterId = ltRows[0].chapter_id;
            queryParams.push(chapterId);
          }

        const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        const query = `
        SELECT 
        m.id AS member_id,
        CONCAT(m.first_name, ' ', m.last_name) AS member_name,
        m.chapter_id,
        DATE_FORMAT(m.mf_end_date, "%M %e, %Y") AS mf_end_date,
        c.meeting_day,
        c.id AS chapter_id,
        c.chapter_name AS chapter_name,
        SUM(CASE WHEN DAYNAME(DATE_ADD(
            COALESCE(m.mf_end_date), 
            INTERVAL n.number DAY)) = c.meeting_day THEN 1 ELSE 0 END) AS meeting_count
      FROM 
        members m
      JOIN 
        chapters c ON m.chapter_id = c.id
      JOIN 
        (SELECT @row := @row + 1 AS number FROM 
            (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3) t1,
            (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3) t2,
            (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3) t3,
            (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3) t4,
            (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3) t5,
            (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3) t6,
            (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3) t7,
            (SELECT @row := -1) t) n
            ON DATE_ADD(
                    COALESCE(m.mf_end_date),
                    INTERVAL n.number DAY
            ) <= CURDATE()
      ${whereClause}
      GROUP BY 
        m.id
        `;

        // Execute main query
        const [rows]: any = await conn.query(query, queryParams);

        // conn.end();

        // Write CSV headers
        res.setHeader('Content-Disposition', 'attachment; filename=All_Transaction_Payment_Report.csv');
        res.setHeader('Content-Type', 'text/csv');
        res.write('"Chapter Name","Member Name","Meeting due date","Pending amount"\n');

        // Process rows and write to response
        rows.forEach((row: any) => {
          const rowData = `"${row.chapter_name}","${row.member_name}","${row.mf_end_date}","${row.meeting_count * 944}"\n`;
          res.write(rowData);
        });

        res.end();

      } catch (error) {
        console.error('Error generating CSV:', error);
        handleError(res, 500, 'Server Error');
      }
      break;

    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
