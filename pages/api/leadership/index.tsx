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
        const [rows] = await conn.query('SELECT * FROM leadership');
        // conn.end();
        res.status(200).json(rows);
      } catch (error) {
        handleError(res, 500, 'Server Error');
      }
      break;
    case 'POST':
      const { chapter_id, president, vice_president, secretary } = req.body;
      try {
        const conn = await connect();

        // Remove any existing president for the chapter
        if (president) {
          const [existingPresident]: any = await conn.query(
            'SELECT id FROM leadership WHERE chapter_id = ? AND president IS NOT NULL',
            [chapter_id]
          );

          if (existingPresident.length > 0) {
            const presidentId = existingPresident[0].id;
            // Update the corresponding member's leader column to NULL
            await conn.query('UPDATE members SET permission_LT = NULL WHERE permission_LT = ?', [presidentId]);

            // Delete the existing leadership entry for president
            await conn.query('DELETE FROM leadership WHERE id = ?', [presidentId]);
          }
        }

        // Remove any existing vice president for the chapter
        if (vice_president) {
          const [existingVicePresident]: any = await conn.query(
            'SELECT id FROM leadership WHERE chapter_id = ? AND vice_president IS NOT NULL',
            [chapter_id]
          );

          if (existingVicePresident.length > 0) {
            const vicePresidentId = existingVicePresident[0].id;
            console.log(existingVicePresident[0].id)

            // Update the corresponding member's leader column to NULL
            await conn.query('UPDATE members SET permission_LT = NULL WHERE permission_LT = ?', [vicePresidentId]);

            // Delete the existing leadership entry for vice president
            await conn.query('DELETE FROM leadership WHERE id = ?', [vicePresidentId]);
          }
        }

        // Remove any existing secretary for the chapter
        if (secretary) {
          const [existingSecretary]: any = await conn.query(
            'SELECT id FROM leadership WHERE chapter_id = ? AND secretary IS NOT NULL',
            [chapter_id]
          );

          if (existingSecretary.length > 0) {
            const secretaryId = existingSecretary[0].id;
            console.log(existingSecretary[0].id)

            // Update the corresponding member's leader column to NULL
            await conn.query('UPDATE members SET permission_LT = NULL WHERE permission_LT = ?', [secretaryId]);

            // Delete the existing leadership entry for secretary
            await conn.query('DELETE FROM leadership WHERE id = ?', [secretaryId]);
          }
        }

        const result: any = await conn.query('INSERT INTO leadership (chapter_id, president, vice_president, secretary) VALUES (?, ?, ?, ?)', [chapter_id, president, vice_president, secretary]);
        const ltId = result[0].insertId;
        const createLT = {
            id: ltId,
            chapter_id, president, vice_president, secretary
        }
        // conn.end();
        res.status(201).json({ message: 'Leadership created successfully', LT: createLT });
      } catch (error) {
        handleError(res, 500, 'Server Error');
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
