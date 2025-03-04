import { NextApiRequest, NextApiResponse } from 'next';
import { connect } from '../../../utils/db';
import checkUserAuth from '../auth';

const handleError = (res: NextApiResponse, statusCode: number, message: string) => {
  res.status(statusCode).json({ error: message });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse, next: Function) {
  const { method } = req;
  if (method === 'POST' || method === 'GET') {
    await checkUserAuth(req, res, next);
  }
  switch (method) {
    case 'GET':
      try {
        const conn = await connect();
        const [rows] = await conn.query('SELECT * FROM training');
        // conn.end();
        res.status(200).json(rows);
      } catch (error) {
        handleError(res, 500, 'Server Error');
      }
      break;
    case 'POST':
        try {
            const { training_name, contact_person, location_type, location, start_time, end_time, member_fee, applicable_id, details } = req.body;
            const conn = await connect();
            await conn.query('INSERT INTO training (training_name, contact_person, location_type, location, start_time, end_time, member_fee, applicable_id, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [training_name, contact_person, location_type, location, start_time, end_time, member_fee, applicable_id, details]);
            // conn.end();
            res.status(201).json({ message: 'Training created successfully' });
          } catch (error) {
            handleError(res, 500, 'Server Error');
          }
          break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
