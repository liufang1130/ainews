import * as cheerio from 'cheerio';
import crypto from 'crypto';

export interface CrawlResult {
  title: string;
  summary?: string;
  content?: string;
  url: string;
  coverImage?: string;
  publishedAt?: Date;
  author?: string;
}

export interface SourceConfig {
  name: string;
  url: string;
  type: string;
  config: {
    listSelector?: string;
    itemSelector?: string;
    titleSelector?: string;
    linkSelector?: string;
    summarySelector?: string;
    timeSelector?: string;
    imageSelector?: string;
    authorSelector?: string;
    baseUrl?: string;
  };
}

// 预定义的信息源配置模板
const SOURCE_TEMPLATES: Record<string, Partial<SourceConfig['config']>> = {
  'qbitai': {
    listSelector: '.article-list .article-item, .ai-news-list li, .feed-item',
    titleSelector: '.article-title, h2 a, h3 a, .title a',
    linkSelector: 'a[href*="/articles/"], a[href*="/post/"]',
    summarySelector: '.article-desc, .excerpt, .description, p.summary',
    timeSelector: 'time, .date, .time',
    imageSelector: 'img.cover, img.thumbnail, .article-img img',
  },
  'jiqizhixin': {
    listSelector: '.item-info-container, .list-item, article',
    titleSelector: '.item-text-title h3 a, h2.title a, .title',
    linkSelector: 'a[href*="/articles/"]',
    summarySelector: '.item-text-summary, .abstract, p',
    timeSelector: '.time-ago, time, .date',
    imageSelector: '.item-image img, img.lazy',
  },
  '36kr': {
    listSelector: '.news-item, .article-item-info, article',
    titleSelector: '.news-item-title a, .article-title a, h2 a',
    linkSelector: 'a[href*="/p/"]',
    summarySelector: '.news-item-desc, .article-desc, .abstract',
    timeSelector: '.news-item-time, time',
    imageSelector: '.news-item-img img, img',
  },
  // 通用科技媒体模板（fallback）
  'generic': {
    titleSelector: 'h1 a, h2 a, h3 a, [class*=title] a',
    linkSelector: 'a[href]',
    summarySelector: 'p, [class*=desc], [class*=summary], [class*=excerpt]',
    timeSelector: 'time, [class*=time], [class*=date]',
    imageSelector: 'img[src*="http"]',
  }
};

function getSourceTemplate(sourceUrl: string): Partial<SourceConfig['config']> {
  if (sourceUrl.includes('qbitai')) return SOURCE_TEMPLATES['qbitai'];
  if (sourceUrl.includes('jiqizhixin')) return SOURCE_TEMPLATES['jiqizhixin'];
  if (sourceUrl.includes('36kr')) return SOURCE_TEMPLATES['36kr'];
  return SOURCE_TEMPLATES['generic'];
}

function parseConfig(configStr: string | null): SourceConfig['config'] {
  if (!configStr) return {};
  try { return JSON.parse(configStr); } catch { return {}; }
}

function resolveUrl(base: string, href: string | undefined): string {
  if (!href) return '';
  try {
    if (href.startsWith('http://') || href.startsWith('https://')) return href;
    const baseObj = new URL(base);
    return new URL(href, baseObj).href;
  } catch { return href; }
}

function cleanText(text: string | undefined): string {
  if (!text) return '';
  return text
    .replace(/\s+/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

export function generateFingerprint(title: string, url: string): string {
  return crypto.createHash('md5').update(`${title.toLowerCase().trim()}|${url}`).digest('hex');
}

function parseDate(dateStr: string | undefined): Date | undefined {
  if (!dateStr) return undefined;
  const cleaned = dateStr.trim();
  const now = new Date();

  const relativePatterns: [RegExp, (n: number) => Date][] = [
    [/(\d+)\s*(秒|seconds?)\s*前/i, (n) => new Date(now.getTime() - n * 1000)],
    [/(\d+)\s*(分|minutes?)\s*前/i, (n) => new Date(now.getTime() - n * 60000)],
    [/(\d+)\s*(小?时|hours?)\s*前/i, (n) => new Date(now.getTime() - n * 3600000)],
    [/(\d+)\s*(天|days?)\s*前/i, (n) => new Date(now.getTime() - n * 86400000)],
    [/(\d+)\s*(周|weeks?)\s*前/i, (n) => new Date(now.getTime() - n * 604800000)],
    [/昨天|yesterday/i, () => { const d = new Date(); d.setDate(d.getDate() - 1); return d; }],
    [/今天|today/i, () => new Date()],
  ];

  for (const [pattern, fn] of relativePatterns) {
    const match = cleaned.match(pattern);
    if (match) return fn(parseInt(match[1]));
  }

  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(cleaned)) return new Date(cleaned);
  if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}/.test(cleaned)) return new Date(cleaned);
  
  return undefined;
}

/**
 * 爬取单个网页并提取资讯列表
 */
export async function crawlSource(
  sourceUrl: string,
  configStr: string | null,
  sourceName: string
): Promise<{ results: CrawlResult[]; error?: string }> {
  let response: Response;

  try {
    response = await fetch(sourceUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
      },
      signal: AbortSignal.timeout(30000),
    });
  } catch (err) {
    return { results: [], error: `请求失败: ${err instanceof Error ? err.message : '未知错误'}` };
  }

  if (!response.ok) {
    return { results: [], error: `HTTP ${response.status}: ${response.statusText}` };
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const userConfig = parseConfig(configStr);
  const templateConfig = getSourceTemplate(sourceUrl);
  const mergedConfig = {
    ...SOURCE_TEMPLATES['generic'],
    ...templateConfig,
    ...userConfig,
  };

  const baseUrl = mergedConfig.baseUrl || sourceUrl;
  const results: CrawlResult[] = [];

  // Strategy: Find article items and extract data
  if (mergedConfig.listSelector) {
    const listItems = $(mergedConfig.listSelector);

    listItems.each((_, element) => {
      const $el = $(element);

      const titleEl = $el.find(mergedConfig.titleSelector || '').first();
      const title = cleanText(titleEl.text());

      if (!title || title.length < 4) return;

      const linkEl = mergedConfig.linkSelector
        ? $el.find(mergedConfig.linkSelector).first()
        : titleEl.is('a') ? titleEl : $el.find('a').first();

      const href = linkEl.attr('href');
      const url = resolveUrl(baseUrl, href);

      if (!url || !url.startsWith('http')) return;

      const summaryEl = mergedConfig.summarySelector
        ? $el.find(mergedConfig.summarySelector).first()
        : null;
      const summary = cleanText(summaryEl?.text());

      const timeEl = mergedConfig.timeSelector
        ? $el.find(mergedConfig.timeSelector).first()
        : null;
      const publishedAt = parseDate(timeEl?.attr('datetime') || timeEl?.text());

      const imageEl = mergedConfig.imageSelector
        ? $el.find(mergedConfig.imageSelector).first()
        : null;
      const coverImage = imageEl?.attr('src') || imageEl?.attr('data-src');

      const authorEl = mergedConfig.authorSelector
        ? $el.find(mergedConfig.authorSelector).first()
        : null;
      const author = cleanText(authorEl?.text());

      results.push({
        title,
        summary: summary || '',
        url,
        coverImage: coverImage || undefined,
        publishedAt,
        author: author || sourceName,
      });
    });
  }

  // Fallback: Direct article element search
  if (results.length === 0) {
    $(mergedConfig.titleSelector || 'h2 a, h3 a').each((_, el) => {
      const $el = $(el);
      const title = cleanText($el.text());
      if (!title || title.length < 4) return;

      const href = $el.attr('href');
      const url = resolveUrl(baseUrl, href);
      if (!url || results.some(r => r.url === url)) return;

      results.push({ title, url, author: sourceName });
    });
  }

  // Dedup by fingerprint
  const seen = new Set<string>();
  const uniqueResults = results.filter(item => {
    const fp = generateFingerprint(item.title, item.url);
    if (seen.has(fp)) return false;
    seen.add(fp);
    return true;
  });

  return { results: uniqueResults.slice(0, 50) };
}
