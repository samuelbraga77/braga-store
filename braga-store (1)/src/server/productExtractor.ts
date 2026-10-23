import { GoogleGenAI } from '@google/genai';

export interface ExtractedProductResult {
  success: boolean;
  title?: string;
  description?: string;
  price?: number;
  promoPrice?: number;
  mainImage?: string;
  images: string[];
  category?: string;
  buyUrl: string;
  sourceDomain?: string;
  warnings?: string[];
  message?: string;
}

export async function extractProductFromUrl(targetUrl: string): Promise<ExtractedProductResult> {
  const warnings: string[] = [];
  let domain = '';
  
  try {
    const parsed = new URL(targetUrl);
    domain = parsed.hostname.replace(/^www\./, '');
  } catch {
    return {
      success: false,
      buyUrl: targetUrl,
      images: [],
      message: 'O link inserido não é uma URL válida.'
    };
  }

  try {
    // 1. Fetch page with standard browser headers
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        buyUrl: targetUrl,
        sourceDomain: domain,
        images: [],
        warnings: [`O site de origem respondeu com status ${response.status}.`],
        message: 'Não foi possível acessar a página automaticamente. Por favor, preencha os dados manualmente.'
      };
    }

    const html = await response.text();

    // 2. Extract OpenGraph and Meta tags directly
    const getMeta = (prop: string): string => {
      const match = html.match(new RegExp(`<meta[^>]+(?:property|name)=["'](?:og:|twitter:|product:)?${prop}["'][^>]+content=["']([^"']+)["']`, 'i'))
        || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:|twitter:|product:)?${prop}["']`, 'i'));
      return match ? match[1].trim() : '';
    };

    let title = getMeta('title');
    if (!title) {
      const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleTag) title = titleTag[1].trim();
    }

    let description = getMeta('description');
    let mainImage = getMeta('image');
    const images: string[] = [];
    if (mainImage) images.push(mainImage);

    // Look for Schema.org JSON-LD
    let price: number | undefined;
    let promoPrice: number | undefined;
    let categorySuggestion: string | undefined;

    const jsonLdRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const rawJson = match[1].trim();
        const parsed = JSON.parse(rawJson);
        const items = Array.isArray(parsed) ? parsed : (parsed['@graph'] || [parsed]);

        for (const item of items) {
          if (item['@type'] === 'Product' || item.offers) {
            if (!title && item.name) title = item.name;
            if (!description && item.description) description = item.description;
            if (item.image) {
              const imgArray = Array.isArray(item.image) ? item.image : [item.image];
              for (const img of imgArray) {
                const imgUrl = typeof img === 'string' ? img : (img.url || '');
                if (imgUrl && !images.includes(imgUrl)) images.push(imgUrl);
              }
            }
            if (item.category) categorySuggestion = item.category;

            // Offers / Price
            const offers = Array.isArray(item.offers) ? item.offers[0] : item.offers;
            if (offers && offers.price) {
              const parsedP = parseFloat(offers.price);
              if (!isNaN(parsedP)) price = parsedP;
            }
          }
        }
      } catch {
        // ignore malformed JSON-LD
      }
    }

    // Try meta price
    if (!price) {
      const priceMeta = getMeta('price:amount') || getMeta('price');
      if (priceMeta) {
        const clean = parseFloat(priceMeta.replace(/[^0-9.,]/g, '').replace(',', '.'));
        if (!isNaN(clean)) price = clean;
      }
    }

    // 3. If Gemini is available and info is incomplete or needs cleaning, refine with Gemini GenAI
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && (!title || !price || !description || images.length === 0)) {
      try {
        const ai = new GoogleGenAI();
        const snippet = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                            .slice(0, 15000);

        const prompt = `Analise o trecho HTML/Texto da página de produto do e-commerce (${domain}) e extraia com precisão as informações REAIS do produto.
REGRAS CRÍTICAS:
- NÃO invente preços, imagens, nomes ou características. Se não encontrar, retorne null.
- Não invente links ou imagens não presentes.
- Sugira uma categoria em português adequada (ex: 'Eletrônicos & Smart', 'Casa & Cozinha', 'Acessórios & Moda', 'Saúde & Cuidados', 'Auto & Ferramentas').

Retorne SOMENTE um JSON válido sem markdown no seguinte formato:
{
  "title": string or null,
  "description": string or null,
  "price": number or null,
  "promoPrice": number or null,
  "mainImage": string or null,
  "images": string[],
  "category": string or null
}

HTML da página:
${snippet}`;

        const responseAi = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        if (responseAi.text) {
          const aiData = JSON.parse(responseAi.text);
          if (!title && aiData.title) title = aiData.title;
          if (!description && aiData.description) description = aiData.description;
          if (!price && typeof aiData.price === 'number') price = aiData.price;
          if (!promoPrice && typeof aiData.promoPrice === 'number') promoPrice = aiData.promoPrice;
          if (aiData.images && Array.isArray(aiData.images)) {
            for (const img of aiData.images) {
              if (typeof img === 'string' && img.startsWith('http') && !images.includes(img)) {
                images.push(img);
              }
            }
          }
          if (!categorySuggestion && aiData.category) categorySuggestion = aiData.category;
        }
      } catch (aiErr) {
        console.warn('Gemini extraction refinement skipped:', aiErr);
      }
    }

    if (!mainImage && images.length > 0) {
      mainImage = images[0];
    }

    // Check what was missing
    if (!title) warnings.push('Título do produto não identificado automaticamente.');
    if (!price) warnings.push('Preço não encontrado. Por favor, informe o preço manualmente.');
    if (!mainImage) warnings.push('Nenhuma imagem foi extraída da página. Insira a URL da imagem.');
    if (!description) warnings.push('Descrição não localizada.');

    return {
      success: true,
      title: title || '',
      description: description || '',
      price: price || undefined,
      promoPrice: promoPrice || undefined,
      mainImage: mainImage || '',
      images: images.filter(Boolean),
      category: categorySuggestion || 'Geral',
      buyUrl: targetUrl,
      sourceDomain: domain,
      warnings,
      message: warnings.length > 0 
        ? 'Dados extraídos com avisos. Revise e complete os campos necessários antes de salvar.' 
        : 'Produto extraído com sucesso! Revise os dados abaixo.'
    };

  } catch (err) {
    return {
      success: false,
      buyUrl: targetUrl,
      sourceDomain: domain,
      images: [],
      message: err instanceof Error ? `Erro ao acessar o link: ${err.message}` : 'Erro desconhecido ao tentar extrair dados do produto.'
    };
  }
}
