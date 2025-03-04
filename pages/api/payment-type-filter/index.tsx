// import { NextApiRequest, NextApiResponse } from "next";
// import { connect } from "../../../utils/db";
// import moment from "moment";

// const handleError = (
//   res: NextApiResponse,
//   statusCode: number,
//   message: string
// ) => {
//   res.status(statusCode).json({ error: message });
// };

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   const { method } = req;

//   switch (method) {
//     case "GET":
//       const { page, pageSize, payment_type, search, startDate, endDate }: any =
//         req.query;
//       const parsedPage = parseInt(page) || 1;
//       const parsedPageSize = parseInt(pageSize) || 10;
//       const searchQuery = search ? `%${search}%` : "%";

//       if (!payment_type) {
//         handleError(res, 400, "Missing payment_type query parameter");
//         return;
//       }

//       try {
//         const offset = (parsedPage - 1) * parsedPageSize;
//         const conn = await connect();

//         // List of fields to search in
//         const fields = [
//           "payments.total_amount",
//           "payments.order_id",
//           "chapters.chapter_name",
//           "members.first_name",
//           "members.last_name",
//           "visitor.visitor_name",
//         ];

//         let whereClauses = [];
//         let queryParams = [];
//         // Constructing search condition
//         if (search) {
//           whereClauses.push(
//             `(${fields.map((field) => `${field} LIKE ?`).join(" OR ")})`
//           );
//           queryParams.push(...fields.map(() => searchQuery));
//         }

//         if (startDate && endDate) {
//           const formattedStartDate = moment(startDate).format("YYYY-MM-DD 00:00:00");
//           const formattedEndDate = moment(endDate).format("YYYY-MM-DD 23:59:59");
//           whereClauses.push(`payments.createdAt BETWEEN ? AND ?`);
//           queryParams.push(formattedStartDate, formattedEndDate);
//         }

//         whereClauses.push(`payments.payment_type = ?`);
//         queryParams.push(payment_type);

//         const whereClause =
//           whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

//         // Query to get paginated payments filtered by payment_type and search query
//         const query = `
//         SELECT payments.*,
//           chapters.chapter_name AS chapter_name,
//           IF(payments.payment_type = 'visitor fees',
//             visitor.visitor_name,
//             CONCAT(members.first_name, ' ', members.last_name)
//           ) AS member_name,
//           IF(payments.payment_type = 'visitor fees',
//               visitor.gst,
//               members.gst_no
//             ) AS memberGST,
//             IF(payments.payment_type = 'visitor fees',
//               NULL,
//               members.company_name
//             ) AS companyName
//         FROM payments
//         LEFT JOIN chapters ON payments.chapter_id = chapters.id
//         LEFT JOIN members ON payments.member_id = members.id
//         LEFT JOIN visitor ON payments.member_id = visitor.id AND payments.payment_type = 'visitor fees'
//         ${whereClause}
//         LIMIT ? OFFSET ?
//         `;

//         // Query to get the total count of payments filtered by payment_type and search query
//         const countQuery = `
//         SELECT COUNT(*) AS count
//         FROM payments
//         LEFT JOIN members ON payments.member_id = members.id
//         LEFT JOIN chapters ON payments.chapter_id = chapters.id
//         LEFT JOIN visitor ON payments.member_id = visitor.id AND payments.payment_type = 'visitor fees'
//         ${whereClause}
//         `;

//         // Execute count query
//         const [countResult]: any = await conn.query(countQuery, queryParams);
//         const totalItems = countResult[0].count;
//         const totalPages = Math.ceil(totalItems / parsedPageSize);

//         // Execute main query
//         const [rows]: any = await conn.query(query, [
//           ...queryParams,
//           parsedPageSize,
//           offset,
//         ]);

//         // conn.end();

//         res.status(200).json({
//           payments: rows,
//           pagination: {
//             currentPage: parsedPage,
//             totalPages: totalPages,
//             totalItems: totalItems,
//             pageSize: parsedPageSize,
//           },
//         });
//       } catch (error) {
//         console.error(error);
//         handleError(res, 500, "Server Error");
//       }
//       break;

//     default:
//       res.setHeader("Allow", ["GET"]);
//       res.status(405).end(`Method ${method} Not Allowed`);
//   }
// }
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
			const {
				page,
				pageSize,
				payment_type,
				chapter_id,
				search,
				startDate,
				endDate,
				paid_for,
			}: any = req.query;
			const parsedPage = parseInt(page) || 1;
			const parsedPageSize = parseInt(pageSize) || 10;
			const searchQuery = search ? `%${search}%` : "%";

			if (!payment_type) {
				handleError(res, 400, "Missing payment_type query parameter");
				return;
			}

			try {
				const offset = (parsedPage - 1) * parsedPageSize;
				const conn = await connect();

				// List of fields to search in
				const fields = [
					"payments.total_amount",
					"payments.order_id",
					"chapters.chapter_name",
					"members.first_name",
					"members.last_name",
					"visitor.visitor_name",
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

				if (chapter_id && chapter_id !== "" && chapter_id !== "all") {
					whereClauses.push("payments.chapter_id = ?");
					queryParams.push(chapter_id);
				}
				
				if (chapter_id && chapter_id !== "" && chapter_id !== "all") {
					whereClauses.push("payments.chapter_id = ?");
					queryParams.push(chapter_id);
				}
				whereClauses.push(`payments.payment_type = ?`);
				queryParams.push(payment_type);
				whereClauses.push(`payments.status = 'captured'`);
				if (chapter_id && chapter_id !== "all") {
					whereClauses.push(`payments.chapter_id = ?`);
					queryParams.push(chapter_id);
				}

				if (paid_for) {
					if (paid_for == "current")
						whereClauses.push(
							`month(members.mf_end_date) = month(curdate()) AND year(members.mf_end_date) = year(curdate())`
						);
					else if (paid_for == "advance")
						whereClauses.push(
							`members.mf_end_date >= LAST_DAY(CURDATE()) + INTERVAL 1 DAY`
						);
				}

				const whereClause =
					whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

				// Query to get paginated payments filtered by payment_type and search query
				const query = `
        SELECT payments.*, 
          chapters.chapter_name AS chapter_name, members.mf_end_date as end_date,
          IF(payments.payment_type = 'visitor fees', 
            visitor.visitor_name, 
            CONCAT(members.first_name, ' ', members.last_name)
          ) AS member_name,
          IF(payments.payment_type = 'visitor fees', 
              visitor.gst, 
              members.gst_no
            ) AS memberGST,
            IF(payments.payment_type = 'visitor fees', 
              NULL,
              members.company_name
            ) AS companyName
        FROM payments
        LEFT JOIN chapters ON payments.chapter_id = chapters.id
        LEFT JOIN members ON payments.member_id = members.id
        LEFT JOIN visitor ON payments.member_id = visitor.id AND payments.payment_type = 'visitor fees'
        ${whereClause}
        order by createdAt desc
        LIMIT ? OFFSET ?
        `;

				// Query to get the total count of payments filtered by payment_type and search query
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
				console.error(error);
				handleError(res, 500, "Server Error");
			}
			break;

		default:
			res.setHeader("Allow", ["GET"]);
			res.status(405).end(`Method ${method} Not Allowed`);
	}
}

