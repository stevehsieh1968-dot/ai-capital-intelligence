// Vercel Edge Function：把網頁的 AI 請求轉給 Anthropic Claude API，並以純文字串流回傳。
// 環境變數（在 Vercel → Project → Settings → Environment Variables 設定）：
//   ANTHROPIC_API_KEY  必填，你的 Anthropic API Key
//   ACI_ACCESS_CODE    建議設定，網站使用者需輸入此存取碼才能使用 AI（避免額度被陌生人用掉）
//   ACI_MODEL          選填，覆寫所有請求使用的模型

export const config = { runtime: 'edge' };

const MODELS = {
  quick: 'claude-haiku-5-5',
  default: 'claude-sonnet-5-5',
  complex: 'claude-opus-5-5',
};
const MAX_PROMPT_CHARS = 120000;

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

export default async function handler(req) {
  const key = process.env.ANTHROPIC_API_KEY;
  const accessCode = process.env.ACI_ACCESS_CODE;

  if (req.method === 'GET') return json({ ok: Boolean(key), needsCode: Boolean(accessCode) });
  if (req.method !== 'POST') return json({ code: 'method_not_allowed' }, 405);
  if (!key) return json({ code: 'no_key', message: '伺服器尚未設定 ANTHROPIC_API_KEY' }, 500);
  if (accessCode && req.headers.get('x-access-code') !== accessCode) {
    return json({ code: 'bad_code', message: '存取碼錯誤' }, 401);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ code: 'bad_request', message: '請求格式錯誤' }, 400);
  }
  const prompt = String(body.prompt || '').slice(0, MAX_PROMPT_CHARS);
  if (!prompt) return json({ code: 'bad_request', message: '缺少 prompt' }, 400);
  const model = process.env.ACI_MODEL || MODELS[body.tier] || MODELS.default;

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      stream: true,
      messages: [{ role: 'user', content: prompt }],
    }),
    signal: req.signal,
  });

  if (!upstream.ok) {
    const detail = (await upstream.text()).slice(0, 300);
    const rate = upstream.status === 429 || upstream.status === 529;
    return json({ code: rate ? 'rate_limited' : 'upstream_error', message: detail }, rate ? 429 : 502);
  }

  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const reader = upstream.body.getReader();
  let buf = '';

  const stream = new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      buf += dec.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (!line.startsWith('data:')) continue;
        try {
          const ev = JSON.parse(line.slice(5).trim());
          if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta') {
            controller.enqueue(enc.encode(ev.delta.text));
          } else if (ev.type === 'error') {
            controller.enqueue(enc.encode('\n\n（AI 服務中斷：' + (ev.error?.message || '未知錯誤') + '）'));
          }
        } catch {
          /* 忽略非 JSON 行 */
        }
      }
    },
    cancel() {
      reader.cancel();
    },
  });

  return new Response(stream, {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
  });
}
