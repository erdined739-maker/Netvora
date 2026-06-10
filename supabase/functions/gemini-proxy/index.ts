import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const getGeminiKey = () => {
  return Deno.env.get("GEMINI_API_KEY");
};

const callGemini = async (prompt: string, imageData: string | null = null, mimeType: string = 'image/jpeg') => {
  const apiKey = getGeminiKey();
  if (!apiKey) throw new Error('Gemini API key eksik');

  const parts: Array<Record<string, unknown>> = [{ text: prompt }];
  if (imageData) {
    parts.push({ inline_data: { mime_type: mimeType, data: imageData } });
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 1000 }
      })
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API hatası ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/functions\/v1\/gemini-proxy/, '').replace(/^\/gemini-proxy/, '') || '/';

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Health check
  if (path === '/api/health' && req.method === 'GET') {
    return new Response(JSON.stringify({ ok: true, hasGeminiKey: !!getGeminiKey(), time: Date.now() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const apiKey = getGeminiKey();
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Gemini API key eksik" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ask endpoints
    if ((path === '/api/ask' || path === '/api/askAI') && req.method === 'POST') {
      const { prompt, system } = await req.json();
      const fullPrompt = system ? `${system}\n\n${prompt}` : prompt || '';
      const text = await callGemini(fullPrompt);
      return new Response(JSON.stringify({ result: text }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Plan endpoints
    if ((path === '/api/plan' || path === '/api/generateStudyPlan') && req.method === 'POST') {
      const { prompt } = await req.json();
      const text = await callGemini(prompt || '');
      return new Response(JSON.stringify({ result: text }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Analyze photo endpoint
    if (path === '/api/analyzePhoto' && req.method === 'POST') {
      const { base64Data, mimeType, questionStart, questionEnd } = await req.json();
      const image = base64Data;
      const type = mimeType || 'image/jpeg';

      if (!image) {
        return new Response(JSON.stringify({ error: 'Resim gönderilmedi' }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const startQ = questionStart || 1;
      const endQ = questionEnd || 10;

      const prompt = `Bu bir öğrencinin çözdüğü soru sayfasının fotoğrafıdır.
Öğrenci ${startQ}. sorudan ${endQ}. soruya kadar çözdüğünü iddia ediyor.

Görevin:
1. Sayfada gerçekten çözülmüş (yanıt yazılmış) soruları say
2. Boş bırakılan soruları sayma
3. Rastgele karalamalar veya işaretler geçerli değil

Aşağıdaki JSON formatında yanıt ver (başka hiçbir şey yazma):
{"validPage": true, "solvedQuestions": 12, "detectedRange": [1,12], "confidence": 0.93}

Eğer sayfa okunaklı değilse veya hiç çözülmüş soru yoksa: {"validPage": false, "solvedQuestions": 0, "detectedRange": [], "confidence": 0}`;

      const text = await callGemini(prompt, image, type);
      const cleaned = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: 'Endpoint bulunamadı' }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
