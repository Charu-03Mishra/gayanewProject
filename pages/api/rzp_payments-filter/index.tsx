import { NextApiRequest, NextApiResponse } from "next";
import { connect } from "../../../utils/db";
import checkUserAuth from "../auth";
import moment from "moment";

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
	const { method } = req;

	if (method === "GET") {
		await checkUserAuth(req, res, next);
	}

	switch (method) {
		case "GET":
			const { page, pageSize, search, startDate, endDate, chapter_id,payment_type }: any =
				req.query;
			const parsedPage = parseInt(page) || 1;
			const parsedPageSize = parseInt(pageSize) || 10;
			const searchQuery = search ? `%${search}%` : "%";

			try {
				const offset = (parsedPage - 1) * parsedPageSize;
				const conn = await connect();

				const fields = [
					"payments.payment_type",
					"payments.total_amount",
					"payments.invoice_no",
					"payments.order_id",
					"visitor.visitor_name",
					"CONCAT(members.first_name, ' ', members.last_name)",
					"chapters.chapter_name",
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

				if (startDate && endDate) {
					const formattedStartDate = moment(startDate).format(
						"YYYY-MM-DD 00:00:00"
					);
					const formattedEndDate = moment(endDate).format(
						"YYYY-MM-DD 23:59:59"
					);
					whereClauses.push(`payments.createdAt BETWEEN ? AND ?`);
					queryParams.push(formattedStartDate, formattedEndDate);
				}
				if (chapter_id && chapter_id !== "") {
					whereClauses.push("payments.chapter_id = ?");
					queryParams.push(chapter_id);
				}
				if (payment_type && payment_type !== "") {
					whereClauses.push("payments.payment_type = ?");
					queryParams.push(payment_type);
				}
				if (req.user[0][0].permission_SGDC) {
					whereClauses.push("payments.chapter_id IN (?)");
					const querySGDC = `SELECT chapter_id FROM sgdc WHERE id = ?`;
					const [sgdcRows]: any = await conn.query(querySGDC, [
						req.user[0][0].permission_SGDC,
					]);
					const chapterId = JSON.parse(sgdcRows[0].chapter_id);
					queryParams.push(chapterId);
				} else if (req.user[0][0].permission_LT) {
					whereClauses.push(`payments.chapter_id = ?`);
					const queryLT = `SELECT chapter_id FROM leadership WHERE id = ?`;
					const [ltRows]: any = await conn.query(queryLT, [
						req.user[0][0].permission_LT,
					]);
					const chapterId = ltRows[0].chapter_id;
					queryParams.push(chapterId);
				}

				whereClauses.push(`payments.status = 'captured'`);
				const whereClause =
					whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

				const query = `
          SELECT 
            payments.*, 
            IF(payments.payment_type = 'visitor fees', 
              visitor.visitor_name, 
              CONCAT(members.first_name, ' ', members.last_name)
            ) AS memberName,
            IF(payments.payment_type = 'visitor fees', 
              visitor.gst, 
              members.gst_no
            ) AS memberGST,
            IF(payments.payment_type = 'visitor fees', 
              NULL,
              members.company_name
            ) AS companyName,
            chapters.chapter_name AS chapterName
          FROM payments
          LEFT JOIN members ON payments.member_id = members.id
          LEFT JOIN chapters ON payments.chapter_id = chapters.id
          LEFT JOIN visitor ON payments.member_id = visitor.id AND payments.payment_type = 'visitor fees'
          ${whereClause}
          LIMIT ? OFFSET ?
        `;

				const countQuery = `
          SELECT COUNT(*) AS count
          FROM payments
          LEFT JOIN members ON payments.member_id = members.id
          LEFT JOIN chapters ON payments.chapter_id = chapters.id
          LEFT JOIN visitor ON payments.member_id = visitor.id AND payments.payment_type = 'visitor fees'
          ${whereClause}
        `;

				// Execute count query
				const [countResult]: any = await conn.query(countQuery, queryParams);
				const totalItems = countResult[0].count;
				const totalPages = Math.ceil(totalItems / parsedPageSize);

				// Execute main query
				const [rows]: any = await conn.query(query, [
					...queryParams,
					parsedPageSize,
					offset,
				]);

				// conn.end();

				res.status(200).json({
					payments: rows,
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

