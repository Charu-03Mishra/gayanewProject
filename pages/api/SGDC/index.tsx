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
        const [rows] = await conn.query('SELECT * FROM sgdc');
        // conn.end();
        res.status(200).json(rows);
      } catch (error) {
        handleError(res, 500, 'Server Error');
      }
      break;
    case 'POST':
      const { chapter_id, sr_support_directors, support_directors, support_ambassador } = req.body;
      
      try {
        const conn = await connect();
        const result: any = await conn.query('INSERT INTO sgdc (chapter_id, sr_support_directors, support_directors, support_ambassador) VALUES (?, ?, ?, ?)', [JSON.stringify(chapter_id), sr_support_directors, support_directors, support_ambassador]);
        const sgdcId = result[0].insertId;
        const createSGDC = {
            id: sgdcId,
            chapter_id, sr_support_directors, support_directors, support_ambassador
        }
        // conn.end();
        res.status(201).json({ message: 'SGDC created successfully', SGDC: createSGDC });
      } catch (error) {
        handleError(res, 500, 'Server Error');
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
