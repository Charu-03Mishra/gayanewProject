const Razorpay = require("razorpay");
export const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_BSS_KEY,
    key_secret: process.env.RAZORPAY_BSS_SECRET
});
