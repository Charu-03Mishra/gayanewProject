import { NextApiResponse } from "next";
import { connect } from "../../../utils/db";
import checkUserAuth from "../auth";
import expenseUpload from "@/utils/expenseMiddleware";
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
	if (method === "POST" || method === "GET") {
		await checkUserAuth(req, res, next);
	}

	switch (method) {
		case "GET":
			const {
				page,
				pageSize,
				role,
				search,
				startDate,
				endDate,
				expense_type,
				paid_status,
				status,
				expense_head,
				chapter_id
			}: any = req.query;
			const parsedPage = parseInt(page) || 1;
			const parsedPageSize = parseInt(pageSize) || 10;

			try {
				const offset = (parsedPage - 1) * parsedPageSize;
				const searchQuery = search ? `%${search}%` : "%";

				const conn = await connect();

				const fields = [
					"expense.expense_type",
					"expense.expense",
					"expense.expense_head",
					"expense.invoice_no",
					"expense.amount",
					"chapters.chapter_name",
					"vendor_master.vendor_name",
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

				// Adding date range condition
				if (startDate && endDate) {
					const formattedStartDate = moment(startDate).format(
						"YYYY-MM-DD 00:00:00"
					);
					const formattedEndDate = moment(endDate).format(
						"YYYY-MM-DD 23:59:59"
					);
					whereClauses.push(`expense.date_of_meeting BETWEEN ? AND ?`);
					queryParams.push(formattedStartDate, formattedEndDate);
				}

				// Check for selected expense_type
				if (expense_type && expense_type !== "") {
					whereClauses.push("expense.expense_type = ?");
					queryParams.push(expense_type);
				}

				// Check for selected status
				if (status && status !== "") {
					whereClauses.push("expense.status = ?");
					queryParams.push(status);
				}

				// Check for selected paid_status
				if (paid_status && paid_status !== "") {
					whereClauses.push("expense.paid_status = ?");
					queryParams.push(paid_status);
				}

				// Check for selected status
				if (expense_head && expense_head !== "") {
					whereClauses.push("expense.expense_head = ?");
					queryParams.push(expense_head);
				}
        // Check for selected chapter
				if (chapter_id && chapter_id !== "" && chapter_id!=="all") {
					whereClauses.push("expense.chapter_id = ?");
					queryParams.push(chapter_id);
				}

				// Adding role-based permissions
				if (role === "vendor") {
					whereClauses.push(`expense.vendor_id = ?`);
					queryParams.push(req.user[0][0].id);
				} else if (req.user[0][0].permission_LT) {
					const [ltRows]: any = await conn.query(
						`SELECT chapter_id FROM leadership WHERE id = ?`,
						[req.user[0][0].permission_LT]
					);
					const chapterId = ltRows[0].chapter_id;
					whereClauses.push(`expense.chapter_id = ?`);
					queryParams.push(chapterId);
				}

				if (chapter_id && chapter_id !== "all") {
					whereClauses.push(`expense.chapter_id = ?`);
					queryParams.push(chapter_id);
				}

				const whereClause =
					whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

				let query = `
          SELECT expense.*, chapters.chapter_name AS chapter_name,
          vendor_master.vendor_name AS vendor_name
          FROM expense
          LEFT JOIN chapters ON expense.chapter_id = chapters.id
          LEFT JOIN vendor_master ON expense.vendor_id = vendor_master.id
          ${whereClause}
          LIMIT ? OFFSET ?
        `;

				let countQuery = `
          SELECT COUNT(*) AS count
          FROM expense
          LEFT JOIN chapters ON expense.chapter_id = chapters.id
          LEFT JOIN vendor_master ON expense.vendor_id = vendor_master.id
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

				// conn.end();

				res.status(200).json({
					expense: rows,
					pagination: {
						currentPage: parsedPage,
						totalPages: totalPages,
						totalItems: totalItems,
						pageSize: parsedPageSize,
					},
				});
			} catch (error) {
				console.log("error", error);
				handleError(res, 500, "Server Error");
			}
			break;

		case "POST":
			expenseUpload.single("document")(req, res, async (err) => {
				if (err) {
					console.error("Error uploading file:", err);
					return res.status(500).json({ error: "Error uploading file" });
				}

				try {
					const {
						chapter_id,
						date_of_meeting,
						expense,
						expense_type,
						expense_head,
						vendor_id,
						amount,
						paid_status,
						status,
						invoice_no,
						created_by,
					} = req.body;
					const fileName = req.file.filename;
					const conn = await connect();
					// Check if an entry with the same chapter_id, date_of_meeting, and invoice_no exists
					const [existingEntries] = await conn.query(
						"SELECT * FROM expense WHERE chapter_id = ? AND date_of_meeting = ? AND invoice_no = ?",
						[chapter_id, date_of_meeting, invoice_no]
					);

					if (existingEntries.length > 0) {
						// If a record already exists, return a conflict error response
						return res
							.status(200)
							.json({
								message:
									"An expense with the same Chapter ID, Date of Meeting, and Invoice Number already exists.",
							});
					}
					await conn.query(
						"INSERT INTO expense (chapter_id, date_of_meeting, expense, expense_type, expense_head, vendor_id, amount, document, paid_status, status,invoice_no, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
						[
							chapter_id,
							date_of_meeting,
							expense,
							expense_type,
							expense_head,
							vendor_id,
							amount,
							`expense/${fileName}`,
							paid_status,
							status,
							invoice_no,
							created_by,
						]
					);
					// conn.end();
					return res
						.status(201)
						.json({ message: "Expense created successfully" });
				} catch (error) {
					console.error("Error inserting data into database:", error);
					return res.status(500).json({ error: "Server Error" });
				}
			});
			break;
		default:
			res.setHeader("Allow", ["GET", "POST"]);
			res.status(405).end(`Method ${method} Not Allowed`);
	}
}

