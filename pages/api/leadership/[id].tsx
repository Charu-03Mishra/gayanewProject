// pages/api/regions/[id].ts

import { NextApiRequest, NextApiResponse } from 'next';
import { connect } from '../../../utils/db';
import checkUserAuth from '../auth';

const handleError = (res: NextApiResponse, statusCode: number, message: string) => {
  res.status(statusCode).json({ error: message });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse, next: Function) {
  const { method, query: { id } } = req;
  if (method === 'PUT' || method === 'GET' || method === 'DELETE') {
    await checkUserAuth(req, res, next);
  }
  switch (method) {
    case 'GET':
      try {
        const conn = await connect();
        const [rows] : any = await conn.query('SELECT * FROM leadership WHERE id = ?', [id]);
        // conn.end();
        if (rows.length === 0) {
          handleError(res, 404, 'LT not found');
          return;
        }
        res.status(200).json(rows[0]);
      } catch (error) {
        handleError(res, 500, 'Server Error');
      }
      break;
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
