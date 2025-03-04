// pages/api/order.js

import { razorpayInstance } from "./razorpay"; // Adjust the import path as necessary
import crypto from "crypto";
import util from "util";
import { connect } from "../../../utils/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    console.log("hello");
    const { firstName, lastName, companyIndustry, chapterName, position,
        phoneNumber, altPhoneNumber, faxNumber, cellNumber, email,
        website, address, city, state, zip, gstNumber, speciality, company_hospitalname, member, association } = req.body;
    const razorpay = razorpayInstance;

    const conn = await connect();

    try {
        const emailCheck:any = await conn.execute("SELECT * FROM _users WHERE email = ?", [email]);
        console.log("emailCheck", emailCheck);
        const results = emailCheck[0];
        // if (results.length > 0) {
        //     return res.status(400).json({ success: false, message: "Email already exists" });
        // }

        const sql = `
        INSERT INTO _users (
            firstName, lastName, companyIndustry, chapterName, position,
            phoneNumber, altPhoneNumber, faxNumber, cellNumber, email,
            website, address, city, state, zip, gstNumber, speciality, company_hospitalname, member, association
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [userObj]: any = await conn.execute(sql, [
            firstName, lastName, companyIndustry, chapterName, position,
            phoneNumber, altPhoneNumber, faxNumber, cellNumber, email,
            website, address, city, state, zip, gstNumber, speciality, company_hospitalname, member, association
        ]);
        console.log("userObj", userObj);
        const amountToPay = member === "Association member"? 1400 * 0.9 : 1400
        const options = {
            amount: amountToPay * 100,
            currency: "INR",
            receipt: "receipt#t",
            payment_capture: 1
        }

        const response = await razorpay.orders.create(options);
        console.log("response", response);

        return res.json({
            order_id: response.id,
            currency: response.currency,
            amount: response.amount,
            user_id: userObj.insertId
        });
    } catch (error) {
        console.error('Error inserting user data:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    } finally {
        // conn.end();
    }
}