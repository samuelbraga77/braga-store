import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// SSRF Protection Helpers
function isPrivateIp(ip: string): boolean {
  if (ip === 'localhost' || ip === '127.0.0.1' || ip === '::1' || ip === '0.0.0.0') return true;
  
  // IPv4 private ranges
  const parts = ip.split('.').map(Number);
  if (parts.length === 4) {
    if (parts[0] === 10) return true; // 10.0.0.0/8
    if (parts[0] === 127) return true; // 127.0.0.0/8
    if (parts[0] === 169 && parts[1] === 254) return true; // 169.254.0.0/16 Link-local/Cloud metadata
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true; // 172.16.0.0/12
    if (parts[0] === 192 && parts[1] === 168) return true; // 192.168.0.0/16
  }

  // IPv6 check
  if (ip.startsWith('fe80:') || ip.startsWith('fc00:') || ip.startsWith('fd00:')) {
    return true;
  }

  return false;
}

// Route to extract product metadata securely
app.post('/api/extract-metadata', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL do produto é obrigatória.' });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return res.status(400).json({ error: 'URL inválida.' });
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return res.status(400).json({ error: 'Apenas protocolos HTTP e HTTPS são permitidos.' });
  }

  // SSRF DNS resolution check
  try {
    const hostname = parsedUrl.hostname;
    if (hostname === 'localhost' || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
      return res.status(400).json({ error: 'Acesso a domínios internos ou locais bloqueado.' });
    }

    const addresses = await dns.lookup(hostname, { all: true });
    for (const addr of addresses) {
      if (isPrivateIp(addr.address)) {
        return res.status(400).json({ error: 'Endereço IP privado não permitido (proteção SSRF).' });
      }
    }
  } catch (err: any) {
    return res.status(400).json({ error: `Falha ao resolver domínio: ${err.message}` });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(parsedUrl.href, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 BragaStoreBot/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return res.status(400).json({
        error: `Não foi possível acessar a página informada. Código retornado: ${response.status}`,
      });
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      return res.status(400).json({ error: 'A URL informada não retornou um documento HTML válido.' });
    }

    // Limit read size to 2MB to protect memory
    const htmlText = (await response.text()).slice(0, 2097152);

    // Extract Metadata
    let name = '';
    let description = '';
    let mainImage = '';
    let currentPrice: number | undefined;
    let brand = '';

    // 1. Check Schema.org JSON-LD
    const jsonLdMatches = htmlText.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    if (jsonLdMatches) {
      for (const match of jsonLdMatches) {
        try {
          const content = match.replace(/<\/?script[^>]*>/gi, '').trim();
          const parsed = JSON.parse(content);
          const items = Array.isArray(parsed) ? parsed : (parsed['@graph'] ? parsed['@graph'] : [parsed]);
          
          for (const item of items) {
            if (item['@type'] === 'Product' || item['@type'] === 'IndividualProduct') {
              if (item.name && !name) name = String(item.name).trim();
              if (item.description && !description) description = String(item.description).trim();
              if (item.image) {
                if (typeof item.image === 'string' && !mainImage) mainImage = item.image;
                else if (Array.isArray(item.image) && item.image[0] && !mainImage) mainImage = item.image[0];
                else if (item.image.url && !mainImage) mainImage = item.image.url;
              }
              if (item.brand) {
                brand = typeof item.brand === 'string' ? item.brand : (item.brand.name || '');
              }
              if (item.offers) {
                const offers = Array.isArray(item.offers) ? item.offers[0] : item.offers;
                if (offers && offers.price) {
                  const num = parseFloat(String(offers.price).replace(/[^0-9.]/g, ''));
                  if (!isNaN(num) && num > 0) currentPrice = num;
                }
              }
            }
          }
        } catch {
          // Ignore JSON-LD parse errors
        }
      }
    }

    // 2. OpenGraph & Meta tag extraction
    const ogTitle = htmlText.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
                    htmlText.match(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i);
    const ogDesc = htmlText.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
                   htmlText.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
    const ogImage = htmlText.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                    htmlText.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    const ogPrice = htmlText.match(/<meta[^>]+property=["']product:price:amount["'][^>]+content=["']([^"']+)["']/i) ||
                    htmlText.match(/<meta[^>]+property=["']og:price:amount["'][^>]+content=["']([^"']+)["']/i);
    const ogBrand = htmlText.match(/<meta[^>]+property=["']product:brand["'][^>]+content=["']([^"']+)["']/i) ||
                    htmlText.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i);

    if (!name && ogTitle) name = ogTitle[1].trim();
    if (!name) {
      const titleTag = htmlText.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleTag) name = titleTag[1].trim().split('|')[0].split('-')[0].trim();
    }

    if (!description && ogDesc) description = ogDesc[1].trim();
    if (!mainImage && ogImage) {
      let img = ogImage[1].trim();
      if (img.startsWith('//')) img = 'https:' + img;
      else if (img.startsWith('/')) img = new URL(img, parsedUrl.origin).href;
      mainImage = img;
    }

    if (!currentPrice && ogPrice) {
      const p = parseFloat(ogPrice[1].replace(/[^0-9.]/g, ''));
      if (!isNaN(p) && p > 0) currentPrice = p;
    }

    if (!brand && ogBrand) brand = ogBrand[1].trim();

    return res.json({
      success: true,
      data: {
        name: name || '',
        description: description || '',
        mainImage: mainImage || '',
        currentPrice: currentPrice || null,
        brand: brand || '',
        externalUrl: parsedUrl.href,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      error: `Não foi possível extrair dados automaticamente: ${error.message}. Por favor, preencha os dados manualmente.`,
    });
  }
});

// Dynamic robots.txt
app.get('/robots.txt', (_req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow: /admin\nDisallow: /admin/*\nAllow: /\n\nSitemap: /sitemap.xml\n');
});

// Dynamic sitemap.xml
app.get('/sitemap.xml', (_req, res) => {
  res.type('application/xml');
  const now = new Date().toISOString().split('T')[0];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>/produtos</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>/categorias</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>/sobre</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>/contato</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;
  res.send(sitemap);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Braga Store server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
