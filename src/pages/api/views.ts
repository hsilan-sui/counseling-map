// pages/api/views.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv';

const KEY = 'views:total';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      const n = await kv.incr(KEY);
      res.status(200).json({ views: n });
    } else {
      const n = Number(await kv.get(KEY)) || 0;
      res.status(200).json({ views: n });
    }
  } catch (e) {
    res.status(500).json({ error: 'kv_error' });
  }
}
