import { connect } from "../../../utils/db";
import { NextApiRequest, NextApiResponse } from "next";
import moment from "moment";
import checkUserAuth from "../auth";

const handleError = (res: NextApiResponse, statusCode: number, message: string) => {
    res.status(statusCode).json({ error: message });
};

export default async function handler(req: any, res: NextApiResponse, next: Function) {
    const { method } = req;

    if (method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Authenticate user and set req.user
        await checkUserAuth(req, res, next);

        if (!req.user) {
            return handleError(res, 401, 'Unauthorized');
        }

        console.log("hello from GET");
        const { page = 1, pageSize = 10, search, startDate, endDate } = req.query;
        console.log("currentPage", page);
        
        const parsedPage = parseInt(page as string) || 1;
        const parsedPageSize = parseInt(pageSize as string) || 10;
        const searchQuery = search ? `%${search}%` : '%';

        const conn = await connect();
        try {
            const offset = (parsedPage - 1) * parsedPageSize;

            let whereClauses: string[] = [];
            let queryParams: (string | number)[] = [];

            // Constructing search condition
            if (search) {
                whereClauses.push(`(u.firstName LIKE ? OR u.lastName LIKE ? OR u.email LIKE ?)`);
                queryParams.push(searchQuery, searchQuery, searchQuery);
            }

            // Constructing date range condition
            if (startDate && endDate) {
                const formattedStartDate = moment(startDate as string).format("YYYY-MM-DD 00:00:00");
                const formattedEndDate = moment(endDate as string).format("YYYY-MM-DD 23:59:59");
                whereClauses.push(`p.created_at BETWEEN ? AND ?`);
                queryParams.push(formattedStartDate, formattedEndDate);
            }

            // Role-based filtering (example)
            if (req.user.permission_SGDC) {
                whereClauses.push('u.chapterName IN (?)');
                const querySGDC = `SELECT chapter_id FROM sgdc WHERE id = ?`;
                const [sgdcRows]: any = await conn.query(querySGDC, [req.user.permission_SGDC]);
                const chapterId = JSON.parse(sgdcRows[0].chapter_id);
                queryParams.push(chapterId);
            } else if (req.user.permission_LT) {
                whereClauses.push(`u.chapterName = ?`);
                const queryLT = `SELECT chapter_id FROM leadership WHERE id = ?`;
                const [ltRows]: any = await conn.query(queryLT, [req.user.permission_LT]);
                const chapterId = ltRows[0].chapter_id;
                queryParams.push(chapterId);
            }

            const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

            // SQL query to get the total number of items
            const countSql = `
                SELECT COUNT(*) as totalItems
                FROM _users u
                LEFT JOIN _payments p ON u.id = p.user_id
                ${whereClause}
            `;
            const [countResult]: any = await conn.query(countSql, queryParams);
            const totalItems = countResult[0].totalItems;
            const totalPages = Math.ceil(totalItems / parsedPageSize);

            // SQL query to get the user and payment data with pagination
            const sql = `
                SELECT 
                    u.id, u.firstName, u.lastName, u.email, u.phoneNumber, u.companyIndustry, u.position, u.chapterName, p.razorpay_order_id, p.razorpay_payment_id, p.razorpay_signature, p.created_at as payment_date
                FROM 
                    _users u
                LEFT JOIN 
                    _payments p ON u.id = p.user_id
                ${whereClause}
                LIMIT ? OFFSET ?
            `;

            const [userObj]: any = await conn.query(sql, [...queryParams, parsedPageSize, offset]);

            return res.json({
                success: true,
                pagination: {
                    currentPage: parsedPage,
                    pageSize: parsedPageSize,
                    totalItems,
                    totalPages
                },
                payments: userObj
            });
        } catch (error) {
            console.error('Error fetching user data:', error);
            handleError(res, 500, 'Internal server error');
        } finally {
            // conn.end();
        }
    } catch (error) {
        console.error('Error in user authentication:', error);
        handleError(res, 500, 'Authentication error');
    }
}
