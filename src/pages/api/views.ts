// pages/api/views.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv';

const KEY = 'views:total';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      const n = await kv.incr(KEY);
      return res.status(200).json({ views: n });
    }

    const n = (await kv.get<number>(KEY)) ?? 0;
    return res.status(200).json({ views: n });
  } catch (e: any) {
    // 小幫手：列印實際錯誤到 server log，回傳通用錯誤碼
    console.error('KV error', e);
    return res.status(500).json({ error: 'kv_error' });
  }
}
