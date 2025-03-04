// sendEmail.js

const nodemailer = require('nodemailer');
const mysql = require('mysql2/promise');
require('dotenv').config();
const argv = require('yargs/yargs')(process.argv.slice(2)).argv;
const axios = require('axios')
async function getMembersData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'GayaConnect123##',
    database: 'gayanew',
  });
  const [rows] = await connection.execute(`
    SELECT
      email,
      primary_number,
      CONCAT(first_name,' ',last_name) as membername,
      mf_end_date,
      DATE_FORMAT(DATE_ADD(mf_end_date, INTERVAL 7 DAY), '%M %Y') as formatted_mf_end_date_plus_one_day,
      CEIL(DATEDIFF("2024-12-31", mf_end_date) / 7) AS weeks_difference,
      CEIL(DATEDIFF("2024-12-31", mf_end_date) / 7) * 944 AS total_due_amount 
    FROM
      members
    WHERE
      membership_status = "Active"
      AND chapter_id NOT IN(25, 29, 10, 14, 18, 21, 23, 24, 26, 36)
      AND DATE_FORMAT(DATE_ADD(mf_end_date, INTERVAL 8 DAY), '%Y-%m-%d') between "2025-01-01 00:00:00" and "2025-01-31 23:59:59"
  `);
        // AND DATE_FORMAT(DATE_ADD(mf_end_date, INTERVAL 8 DAY), '%Y-%m-%d') < "2024-12-31 23:59:59"

//649 for sardar(25) and swaraj
  connection.end();

  if (rows.length > 0) {
    console.log('Members data retrieved from database:', rows);
    return rows;
  } else {
    throw new Error('No active members found');
  }
}

async function sendEmail({ to, subject, text }) {
  let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SMTP_HOST,
    port: 587, // Mandrill typically uses port 587
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  let mailOptions = {
    from: process.env.FROM_EMAIL,
    to: to,
    subject: subject,
    text: text,
    // attachments: [
    //   {
    //     // Path to your file
    //     filename: 'Control-letter-10-Opening-a-Classification.docx', // Name of the file in the email
    //     path: '/var/www/html/newbni/Control-letter-10-Opening-a-Classification.docx', // The path to the file on the server or disk
    //   },
    // ],
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.response}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
  }
}

async function main() {
  try {
    const members = await getMembersData();
    const authToken = 'U2FsdGVkX1+1zpS8tZr7JRAk5bGUookn4bSuEvyB2dcp4q5+nomQR3YdgzvIYv/vi/7hUy1zLckSd8Iy4+oQpIbGDoYGB2NWKOyR90r4ZW42X0PK8I6w8G5HsWVnV0wqlVPOOxwcuJ3jdTefMZG2yNx26dIe8k4Jot1zs+6BTmk+QUWhImXWBeuvqRszyzPp';

    for (const member of members) {
    // const emailContent = `Dear ${member.membername},\n\nWe hope this email finds you well.\n\nThis is a courteous reminder that your meeting fees for the months of October 2024, November 2024, and December 2024 remain unpaid. Despite our previous reminder calls, the payment is still pending.\n\nWe kindly request you to settle the outstanding fees today to avoid further reminder calls, emails, or potential penalties.\n\nYour prompt action on this matter is greatly appreciated. If you have already made the payment, please disregard this email and accept our gratitude.\n\nFor any questions or assistance regarding the payment process, feel free to contact us.\n\nThank you for your cooperation.`
    // const emailContent = `Dear ${member.membername},\n\nOur records indicate that your meeting fees have been pending for three months or more. Kindly settle your outstanding dues by the next chapter meeting.\n\nFailure to do so will require us to issue an open classification letter. We appreciate your prompt attention to this matter and request you to clear the pending fees at the earliest.\n\nFor any queries, please feel free to reach out.\n\n`
    const emailContent = `Dear Members,\n\nKindly settle your outstanding meeting fee by the next chapter meeting. Your prompt payment would be greatly appreciated.\n\nThank you for your cooperation.`
    await sendEmail({
        to: member.email,
        subject: 'Urgent Notice: Pending Meeting Fees',
        text: emailContent,
      });
      // const emailContent = `Dear ${member.membername},\n\nI hope you are doing well. We hope you have benefited from your Business Network International (BNI) membership. We appreciate your commitment to our organization and the opportunities it provides for professional growth and networking.\n\nHowever, it has come to our attention that your chapter meeting fees have been outstanding for the past several months. As of till date, the unpaid fees amount to a total of Rs. ${member.total_due_amount}.\n\nWe understand that circumstances may arise, and we are here to assist you. Yet, consistent non-payment affects the sustainability of our chapter and the services we provide to all members. Each member must contribute their fair share to maintain the vitality of our network.\n\nTherefore, we must bring this matter to your immediate attention. You are hereby required to settle the outstanding dues within the next 2 days from the date of this email. Failure to do so will regrettably result in the removal of your membership from the BNI system.\n\nWe sincerely hope it does not come to that, and we believe in resolving matters amicably. If you are facing challenges that prevent you from making the payment on time, please do not hesitate to contact us at 9978605090. We are open to discussing a suitable arrangement that accommodates your circumstances.\n\nTo make the payment use <a href='https://www.gayaconnect.com'>www.gayaconnect.com</a>\n\nOnce the payment is made, kindly forward the transaction details to bnisuratacc0unts@gmail.com for prompt verification and reconciliation.\n\nThank you for your immediate attention to this matter. We value your participation in BNI and trust that we can resolve this issue promptly to ensure the continued success of our chapter.`;
      // const response = await axios.post('https://app.11za.in/apis/template/sendTemplate', {
      //   authToken,
      //   sendto: `91${member.primary_number}`,
      //   originWebsite: 'https://bnigreatersurat.com/',
      //   templateName: 'pending_fees',
      //   language: 'en',
      //   data: [member.membername, member.formatted_mf_end_date_plus_one_day , 'Sep 2024',member.total_due_amount],
      // });
      // console.log(response);
    
  }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
