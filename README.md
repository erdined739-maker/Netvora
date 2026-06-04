# Netvora GitHub Deploy Copy

Bu klasor GitHub'a yuklemek icin temiz kopyadir.

- `.env` dosyasini commit etme.
- Gercek Gemini API key sadece Supabase Edge Function environment variable olarak tanimlanmali.
- `index.html` icindeki Firebase/Supabase config alanlari bos birakildi.
- Canli app icin public Firebase config ve Supabase anon config degerlerini kendi deploy ortaminda ver.

Hizli kalmasi gereken ana deger: `GEMINI_API_KEY`.
