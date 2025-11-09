
SS IPTV Amorim - pacote pronto para GitHub Pages / hospedagem simples
-------------------------------------------------
Conteúdo:
- index.html
- manifest.json
- service-worker.js
- assets/logo.png
- assets/icon-192.png
- assets/icon-512.png

Instruções rápidas:
1) Teste local: python -m http.server 8000
   Abra http://localhost:8000
2) Para PWA funcionar, hospede em HTTPS (GitHub Pages já usa HTTPS)
3) Se a lista M3U tiver CORS bloqueado, use o link "raw" direto ou faça proxy no servidor.

Personalize:
- Troque o arquivo assets/logo.png para seu logo real
- Edite M3U_URL em index.html para outra lista padrão
