import { NextApiRequest, NextApiResponse } from "next";
import { connect } from "../../../utils/db";
import checkUserAuth from "../auth";

const handleError = (res: NextApiResponse, statusCode: number, message: string) => {
  res.status(statusCode).json({ error: message });
};

export default async function handler(req: any, res: NextApiResponse, next: Function) {
  const { method, query } = req;
  
  if (method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  await checkUserAuth(req, res, next);

  const { page = "1", pageSize = "10", search = "", startDate = "", endDate = "", chapter_id = "all" } = query;
  const parsedPage = parseInt(page as string, 10) || 1;
  const parsedPageSize = parseInt(pageSize as string, 10) || 10;
  const searchQuery = `%${search}%`;

  try {
    const conn = await connect();
    let whereClauses = [`m.membership_status = 'Active'`];
    let queryParams: any[] = [];

    // Add search condition
    if (search) {
      whereClauses.push(`CONCAT(m.first_name, ' ', m.last_name) LIKE ?`);
      queryParams.push(searchQuery);
    }

    if (chapter_id && chapter_id !== "all") {
      whereClauses.push(` m.chapter_id = ?`)
      queryParams.push(chapter_id);
    }

    // Add user permission filtering
    if (req.user[0][0].permission_SGDC) {
      whereClauses.push('m.chapter_id IN (?)');
      const [sgdcRows] = await conn.query(`SELECT chapter_id FROM sgdc WHERE id = ?`, [req.user[0][0].permission_SGDC]);
      queryParams.push(JSON.parse(sgdcRows[0].chapter_id));
    } else if (req.user[0][0].permission_LT) {
      whereClauses.push('m.chapter_id = ?');
      const [ltRows] = await conn.query(`SELECT chapter_id FROM leadership WHERE id = ?`, [req.user[0][0].permission_LT]);
      queryParams.push(ltRows[0].chapter_id);
    }

    // Where clause string
    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // Consolidated query for both data and count
    const query = `
      SELECT 
        m.id AS member_id,
        CONCAT(m.first_name, ' ', m.last_name) AS member_name,
        m.chapter_id,
        m.mf_end_date,
        c.chapter_name,
        CEIL(DATEDIFF(LAST_DAY(CURDATE() + INTERVAL 1 DAY), m.mf_end_date) / 7) AS weeks_difference,
        CEIL(DATEDIFF(LAST_DAY(CURDATE() + INTERVAL 1 DAY), m.mf_end_date) / 7) * 944 AS total_due_amount,
        COUNT(*) OVER() AS totalItems
      FROM 
        members m
      JOIN 
        chapters c ON m.chapter_id = c.id
      JOIN payments as p on p.member_id = m.id
      ${whereClause}
      AND m.mf_end_date < CURDATE() AND p.payment_type='meeting fees' and p.status = 'captured'
      LIMIT ? OFFSET ?
    `;

    // Execute the query
    const [rows] = await conn.query(query, [...queryParams, parsedPageSize, (parsedPage - 1) * parsedPageSize]);
    const totalItems = rows.length > 0 ? rows[0].totalItems : 0;
    const totalPages = Math.ceil(totalItems / parsedPageSize);

    // Prepare response data
    const data = rows.map((row: any) => ({
      member_id: row.member_id,
      member_name: row.member_name,
      chapter_id: row.chapter_id,
      meeting_count: row.weeks_difference,
      meeting_due_date: row.mf_end_date,
      chapter_name: row.chapter_name,
      pending_amount: row.total_due_amount,
    }));

    res.status(200).json({
      data,
      pagination: {
        currentPage: parsedPage,
        totalPages,
        totalItems,
        pageSize: parsedPageSize,
      },
    });
  } catch (error) {
    console.error("Error fetching payment data:", error);
    handleError(res, 500, "Server Error");
  }
}
