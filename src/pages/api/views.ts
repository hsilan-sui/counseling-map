// pages/api/views.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@vercel/kv';

// 依序嘗試多種命名
const URL =
  process.env.KV_REST_API_URL ||
  process.env.UPSTASH_KV_REST_API_URL ||
  process.env.UPSTASH_KV_KV_REST_API_URL || // 有些整合會多一層 KV
  process.env.UPSTASH_REDIS_REST_URL ||      // 若你其實裝的是 Upstash Redis
  '';

const TOKEN =
  process.env.KV_REST_API_TOKEN ||
  process.env.UPSTASH_KV_REST_API_TOKEN ||
  process.env.UPSTASH_KV_KV_REST_API_TOKEN ||
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  '';

const kv = URL && TOKEN ? createClient({ url: URL, token: TOKEN }) : null;

const KEY = 'views:total';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!kv) {
      return res.status(500).json({
        error: 'kv_missing_env',
        env: process.env.VERCEL_ENV || 'development',
        hasURL: !!URL,
        hasTOKEN: !!TOKEN,
      });
    }

    if (req.method === 'POST') {
      const n = await kv.incr(KEY);
      return res.status(200).json({ views: n });
    } else {
      const n = Number(await kv.get(KEY)) || 0;
      return res.status(200).json({ views: n, env: process.env.VERCEL_ENV || 'development' });
    }
  } catch (e) {
    console.error('KV error', e);
    return res.status(500).json({ error: 'kv_error' });
  }
}
