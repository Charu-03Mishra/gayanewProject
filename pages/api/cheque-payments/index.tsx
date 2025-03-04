import { NextApiRequest, NextApiResponse } from "next";
import { connect } from "../../../utils/db";
import moment from "moment";

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
	const { method } = req;

	switch (method) {
		case "GET":
			const { page, pageSize, search, startDate, endDate, chapter_id }: any =
				req.query;
			const parsedPage = parseInt(page) || 1;
			const parsedPageSize = parseInt(pageSize) || 10;
			const searchQuery = search ? `%${search}%` : "%";

			try {
				const offset = (parsedPage - 1) * parsedPageSize;
				const conn = await connect();

				// List of fields to search in
				const fields = [
					"payments.total_amount",
					"chapters.chapter_name",
					"members.first_name",
					"members.last_name",
					"payments.verification_code",
				];

				let whereClauses = [`payments.mode = 'cheque'`];
				let queryParams: (string | number)[] = [];

				// Constructing search condition
				if (search) {
					whereClauses.push(
						`(${fields.map((field) => `${field} LIKE ?`).join(" OR ")})`
					);
					queryParams.push(...fields.map(() => searchQuery));
				}
				if (chapter_id && chapter_id!== "" &&chapter_id !== "all") {
					whereClauses.push("payments.chapter_id = ?");
					queryParams.push(chapter_id);
				}

				// Constructing date filter condition
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

				const whereClause =
					whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

				// Query to get paginated payments filtered by search query and date range
				const query = `
        SELECT payments.*, 
          chapters.chapter_name AS chapter_name, 
          members.company_name AS companyName,
          members.gst_no AS memberGST,
          CONCAT(members.first_name, ' ', members.last_name) AS memberName
        FROM payments
        LEFT JOIN chapters ON payments.chapter_id = chapters.id
        LEFT JOIN members ON payments.member_id = members.id
        ${whereClause}
        LIMIT ? OFFSET ?
        `;

				// Query to get the total count of payments filtered by search query and date range
				const countQuery = `
        SELECT COUNT(*) AS count
        FROM payments
        LEFT JOIN chapters ON payments.chapter_id = chapters.id
        LEFT JOIN members ON payments.member_id = members.id
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
				console.error(error);
				handleError(res, 500, "Server Error");
			}
			break;

		default:
			res.setHeader("Allow", ["GET"]);
			res.status(405).end(`Method ${method} Not Allowed`);
	}
}

