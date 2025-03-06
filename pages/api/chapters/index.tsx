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
	const { method } = req;
	if (method === "POST" || method === "GET") {
		await checkUserAuth(req, res, next);
	}
	const { is_launched }: any = req.query;
	const { chapter_name }: any = req.query;

	switch (method) {
		case "GET":
			const { page, pageSize, search }: any = req.query;
			const parsedPage = parseInt(page) || 1;
			const parsedPageSize = parseInt(pageSize) || 10;

			try {
				const offset = (parsedPage - 1) * parsedPageSize;
				const searchQuery = search ? `%${search}%` : "%";

				const pool = await connect(); // Ensure `connect()` returns a connection pool
				const conn = await pool.getConnection(); // Get a connection from the pool

				const fields = [
					"chapters.chapter_name",
					"chapters.meeting_day",
					"chapters.meeting_time",
					"chapters.weekly_meeting_fees",
					"chapters.opening_balance",
					"chapters.kitty_balance",
				];

				let whereClauses = [];
				let queryParams = [];

				// Search condition
				if (search) {
					whereClauses.push(
						`(${fields.map((field) => `${field} LIKE ?`).join(" OR ")})`
					);
					queryParams.push(...fields.map(() => searchQuery));
				}

				// Check for `is_launched`
				// if (
				// 	is_launched !== undefined &&
				// 	(is_launched == 0 || is_launched == 1)
				// ) {
				// 	whereClauses.push("chapters.is_launched = ?");
				// 	queryParams.push(is_launched);
				// }

				if (chapter_name && chapter_name !== "" && chapter_name !== "all") {
					whereClauses.push("chapters.chapter_name = ?");
					queryParams.push(chapter_name);
				}
				const whereClause =
					whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

				let query = `
      SELECT chapters.*
      FROM chapters
      ${whereClause}
      LIMIT ? OFFSET ?
    `;

				let countQuery = `
      SELECT COUNT(*) AS count
      FROM chapters
      ${whereClause}
    `;

				// Execute the main query with pagination parameters
				const [rows]: any = await conn.query(query, [
					...queryParams,
					parsedPageSize,
					offset,
				]);

				// Execute the count query to get the total number of items
				const [countResult]: any = await conn.query(countQuery, queryParams);
				const totalItems = countResult[0].count;
				const totalPages = Math.ceil(totalItems / parsedPageSize);

				conn.release(); // Release connection back to the pool

				res.status(200).json({
					chapters: rows,
					pagination: {
						currentPage: parsedPage,
						totalPages: totalPages,
						totalItems: totalItems,
						pageSize: parsedPageSize,
					},
				});
			} catch (error) {
				console.log("Error in GET API:", error);
				handleError(res, 500, "Server Error");
			}
			break;

		case "POST":
			const {
				chapter_id,
				coffee_table,
				meeting_day,
				meeting_time,
				region_id,
				launched_date,
				state,
				country,
				weekly_meeting_fees,
				opening_balance,
				kitty_balance,
			} = req.body;
			try {
				const conn = await connect();
				await conn.query(
					"INSERT INTO chapters (chapter_id, chapter_name, is_launched, coffee_table, meeting_day,meeting_time, region_id ,launched_date,state,country,weekly_meeting_fees, opening_balance, kitty_balance) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
					[
						chapter_id,
						chapter_name,
						is_launched,
						coffee_table,
						meeting_day,
						meeting_time,
						region_id,
						launched_date,
						state,
						country,
						weekly_meeting_fees,
						opening_balance,
						kitty_balance,
					]
				);
				// conn.end();
				res.status(201).json({ message: "Chapter created successfully" });
			} catch (error) {
				handleError(res, 500, "Server Error");
			}
			break;
		default:
			res.setHeader("Allow", ["GET", "POST"]);
			res.status(405).end(`Method ${method} Not Allowed`);
	}
}

