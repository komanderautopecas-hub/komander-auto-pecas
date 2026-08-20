import crypto from 'node:crypto';

function sign(value, secret) {
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

function safeEqual(a, b) {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.SESSION_SECRET;
  if (!password || !secret) return res.status(503).json({ error: 'Painel ainda não configurado.' });
  const supplied = req.body && req.body.password;
  if (!safeEqual(supplied || '', password)) return res.status(401).json({ error: 'Senha incorreta.' });
  const payload = `${Date.now() + 8 * 60 * 60 * 1000}`;
  const token = `${payload}.${sign(payload, secret)}`;
  res.setHeader('Set-Cookie', `kg_admin=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`);
  return res.status(200).json({ ok: true });
};
