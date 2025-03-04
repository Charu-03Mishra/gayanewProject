import { NextApiResponse } from "next";
import { connect } from "../../../utils/db";
import checkUserAuth from "../auth";

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

	const { membership_status, mf_end_date }: any = req.query;

	switch (method) {
		case "GET":
			const { page, pageSize, search, chapters }: any = req.query;
			const parsedPage = parseInt(page) || 10;
			const parsedPageSize = parseInt(pageSize) || 1;
			const searchQuery = search ? `%${search}%` : "%";

			try {
				const offset: any = (parsedPage - 1) * parsedPageSize;
				const conn = await connect();

				// List of fields to search in both members and chapters tables
				const fields = [
					"members.first_name",
					"members.last_name",
					"members.email",
					"members.primary_number",
					"chapters.chapter_name",
					"members.company_name",
					"members.membership_status",
					"members.mf_end_date",
				];

				let whereClauses = [];
				let queryParams = [];

				if (search) {
					whereClauses.push(
						`(${fields.map((field) => `${field} LIKE ?`).join(" OR ")})`
					);
					queryParams.push(...fields.map(() => searchQuery));
				}

				// Check for selected chapter
				if (chapters && chapters !== "") {
					whereClauses.push("chapters.chapter_name = ?");
					queryParams.push(chapters);
				}

				if (mf_end_date && mf_end_date !== "") {
					whereClauses.push("members.mf_end_date = ?");
					queryParams.push(mf_end_date);
				}
				if (membership_status && membership_status !== "") {
					whereClauses.push("members.membership_status = ?");
					queryParams.push(membership_status);
				}

				if (req.user[0][0].permission_LT) {
					const [ltRows]: any = await conn.query(
						`SELECT chapter_id FROM leadership WHERE id = ?`,
						[req.user[0][0].permission_LT]
					);
					const chapterId = ltRows[0].chapter_id;
					whereClauses.push(`members.chapter_id = ?`);
					queryParams.push(chapterId);
				} else if (req.user[0][0].permission_SGDC) {
					whereClauses.push("members.chapter_id IN (?)");
					const [sgdcRows]: any = `SELECT chapter_id FROM sgdc WHERE id = ?`;
					const chapterId = JSON.parse(sgdcRows[0].chapter_id);
					queryParams.push(chapterId);
				}

				const whereClause =
					whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

				let query = `
          SELECT members.*, chapters.chapter_name AS chapter_name 
          FROM members
          LEFT JOIN chapters ON members.chapter_id = chapters.id
          ${whereClause}
          LIMIT ? OFFSET ?
        `;

				let countQuery = `
          SELECT COUNT(*) AS count 
          FROM members
          LEFT JOIN chapters ON members.chapter_id = chapters.id
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
					members: rows,
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
			const {
				membership_id,
				bni_membership_id,
				title,
				first_name,
				last_name,
				company_name,
				gst_no,
				add_line_1,
				add_line_2,
				city,
				state,
				postcode,
				role,
				profession,
				speciality,
				chapter_id,
				primary_number,
				email,
				permission_LT,
				permission_SGDC,
				flag,
				mf_start_date,

				membership_start_date,
				membership_end_date,
				manual_induction,
				outstanding_balance,
			} = req.body;
			try {
				const conn = await connect();
				const [existingRows]: any = await conn.query(
					"SELECT * FROM members WHERE primary_number = ?",
					[primary_number]
				);
				if (existingRows.length > 0) {
					// conn.end();
					return handleError(res, 400, "Mobile number already exists");
				}
				const result: any = await conn.query(
					"INSERT INTO members (membership_id,bni_membership_id, title, first_name, last_name, company_name, gst_no,add_line_1, add_line_2, city,state, postcode,role, membership_status ,profession,speciality,chapter_id,primary_number,email,permission_LT,permission_SGDC,flag,mf_start_date,mf_end_date,membership_start_date,membership_end_date,manual_induction,   outstanding_balance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
					[
						membership_id,
						bni_membership_id,
						title,
						first_name,
						last_name,
						company_name,
						gst_no,
						add_line_1,
						add_line_2,
						city,
						state,
						postcode,
						role,
						membership_status,
						profession,
						speciality,
						chapter_id,
						primary_number,
						email,
						permission_LT,
						permission_SGDC,
						flag,
						mf_start_date,

						membership_start_date,
						membership_end_date,
						manual_induction,
						outstanding_balance,
					]
				);
				const createdMemberId = result[0].insertId;
				const createdMember = {
					id: createdMemberId,
					membership_id,
					bni_membership_id,
					title,
					first_name,
					last_name,
					company_name,
					gst_no,
					role,
					membership_status,
					profession,
					speciality,
					chapter_id,
					primary_number,
					email,
					permission_SGDC,
					flag,
					mf_start_date,

					membership_start_date,
					membership_end_date,
					manual_induction,
					outstanding_balance,
				};
				// conn.end();
				res.status(201).json({
					message: "Member created successfully",
					member: createdMember,
				});
			} catch (error: any) {
				handleError(res, 500, "Server Error");
			}
			break;
		default:
			res.setHeader("Allow", ["GET", "POST"]);
			res.status(405).end(`Method ${method} Not Allowed`);
	}
}

