import crypto from 'node:crypto';

function sign(value, secret) {
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

export default function handler(req, res) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return res.status(401).json({ authenticated: false });
  const cookies = Object.fromEntries((req.headers.cookie || '').split(';').map(v => v.trim().split('=')));
  const token = cookies.kg_admin || '';
  const [expires, signature] = token.split('.');
  if (!expires || !signature || Number(expires) < Date.now()) return res.status(401).json({ authenticated: false });
  const expected = sign(expires, secret);
  const a = Buffer.from(signature); const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(401).json({ authenticated: false });
  return res.status(200).json({ authenticated: true });
};
