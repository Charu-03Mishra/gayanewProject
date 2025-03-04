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
        const [rows] : any = await conn.query('SELECT * FROM region WHERE id = ?', [id]);
        // conn.end();
        if (rows.length === 0) {
          handleError(res, 404, 'Region not found');
          return;
        }
        res.status(200).json(rows[0]);
      } catch (error) {
        handleError(res, 500, 'Server Error');
      }
      break;
    case 'PUT':
      const { name, is_launched } = req.body;
      if (!name) {
        handleError(res, 400, 'Name is required');
        return;
      }
      try {
        const conn = await connect();
        await conn.query('UPDATE region SET name = ?, is_launched = ? WHERE id = ?', [name, is_launched, id]);
        // conn.end();
        res.status(200).json({ message: 'Region updated successfully' });
      } catch (error) {
        handleError(res, 500, 'Server Error');
      }
      break;
    case 'DELETE':
      try {
        const conn = await connect();
        await conn.query('DELETE FROM region WHERE id = ?', [id]);
        // conn.end();
        res.status(200).json({ message: 'Region deleted successfully' });
      } catch (error) {
        handleError(res, 500, 'Server Error');
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
