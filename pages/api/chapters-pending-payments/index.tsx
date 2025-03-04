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
  req: any,
  res: NextApiResponse,
  next: Function
) {
  const { method, query } = req;

  if (method === "GET") {
    await checkUserAuth(req, res, next);
  }

  switch (method) {
    case "GET":
      const {
        page = "1",
        pageSize = "10",
        search = "",
        startDate = "",
        endDate = "",
      } = query as any;

      const parsedPage = parseInt(page, 10) || 1;
      const parsedPageSize = parseInt(pageSize, 10) || 10;
      const searchQuery = `%${search}%`;

      try {
        const conn = await connect();

        const fields = [
          "CONCAT(m.first_name, ' ', m.last_name)",
          "c.chapter_name",
        ];

        let whereClauses = [];
        let queryParams = [];

        // Constructing search condition
        if (search) {
          whereClauses.push(
            `(${fields.map((field) => `${field} LIKE ?`).join(" OR ")})`
          );
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

        const whereClause =
          whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

        // Query to fetch paginated data
        const query = `
          SELECT 
            m.id AS member_id,
            CONCAT(m.first_name, ' ', m.last_name) AS member_name,
            m.chapter_id,
            m.mf_end_date,
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
            c.id
          LIMIT ? OFFSET ?
        `;

        // Query to count total items
        const countQuery = `
          SELECT COUNT(*) AS totalItems
          FROM (
            SELECT 
              m.id AS member_id,
              CONCAT(m.first_name, ' ', m.last_name) AS member_name,
              m.chapter_id AS member_chapter_id,
              m.mf_end_date,
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
              c.id
          ) AS subquery
        `;

        const [rows]: any = await conn.query(query, [
          ...queryParams,
          parsedPageSize,
          (parsedPage - 1) * parsedPageSize,
        ]);

        const [countResult]: any = await conn.query(countQuery, queryParams);

        // conn.end();

        const totalItems = countResult[0].totalItems;
        const totalPages = Math.ceil(totalItems / parsedPageSize);

        const dayCounts = rows.map((row: any) => ({
          member_id: row.member_id,
          member_name: row.member_name,
          chapter_id: row.chapter_id,
          meeting_count: row.meeting_count.toString(),
          meeting_day: row.meeting_day,
          chapter_name: row.chapter_name,
          pending_amount: row.meeting_count * 944,
        }));

        res.status(200).json({
          data: dayCounts,
          pagination: {
            currentPage: parsedPage,
            totalPages: totalPages,
            totalItems: totalItems,
            pageSize: parsedPageSize,
          },
        });
      } catch (error) {
        console.error("Error fetching payment data:", error);
        handleError(res, 500, "Server Error");
      }
      break;

    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
