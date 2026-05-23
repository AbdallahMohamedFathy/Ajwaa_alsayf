/**
 * Cloudflare Worker — R2 Upload Handler
 *
 * خطوات النشر:
 * 1. روح https://dash.cloudflare.com → Workers & Pages → Create Worker
 * 2. انسخ هذا الكود
 * 3. في Settings → Variables → أضف:
 *    - ADMIN_SECRET  = (مفتاح سري تختاره أنت)
 *    - R2_PUBLIC_URL = (رابط الـ R2 bucket العام، مثل: https://pub-xxx.r2.dev)
 * 4. في Settings → Bindings → R2 Bucket → أضف bucket باسم: R2_BUCKET
 * 5. انسخ رابط الـ Worker وضعه في admin.html في متغير R2_WORKER_URL
 * 6. نفس المفتاح السري ضعه في R2_ADMIN_KEY في admin.html
 */

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'
];

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Auth
    const adminKey = request.headers.get('X-Admin-Key');
    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);

    // DELETE /delete?key=filename.jpg
    if (request.method === 'DELETE') {
      const key = url.searchParams.get('key');
      if (!key) return new Response(JSON.stringify({ error: 'Missing key' }), { status: 400, headers: corsHeaders });
      await env.R2_BUCKET.delete(key);
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // POST / — Upload file
    if (request.method === 'POST') {
      try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file || typeof file === 'string') {
          return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400, headers: corsHeaders });
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
          return new Response(JSON.stringify({ error: 'نوع الملف غير مدعوم' }), { status: 400, headers: corsHeaders });
        }

        const buffer = await file.arrayBuffer();
        if (buffer.byteLength > MAX_SIZE) {
          return new Response(JSON.stringify({ error: 'حجم الملف أكبر من 50MB' }), { status: 400, headers: corsHeaders });
        }

        // Generate unique filename
        const ext = file.name.split('.').pop().toLowerCase();
        const folder = file.type.startsWith('video/') ? 'videos' : 'photos';
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        await env.R2_BUCKET.put(fileName, buffer, {
          httpMetadata: { contentType: file.type }
        });

        const publicUrl = `${env.R2_PUBLIC_URL}/${fileName}`;

        return new Response(JSON.stringify({ url: publicUrl, key: fileName }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }
};
