import { NextResponse } from 'next/server';
import { crawlSource, generateFingerprint } from '@/lib/crawler';
import { getSources, getSource, updateSource, createRawArticle, createCrawlLog, getRawArticles, updateCrawlLog } from '@/lib/data';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sourceId } = body;

    if (sourceId) {
      const source = getSource(sourceId);
      if (!source) {
        return NextResponse.json({ error: '信息源不存在' }, { status: 404 });
      }
      const result = await executeCrawl(source);
      return NextResponse.json(result);
    }

    // Crawl all enabled sources
    const sources = getSources().filter(s => s.isEnabled);

    if (sources.length === 0) {
      return NextResponse.json({ error: '没有可用的信息源' }, { status: 400 });
    }

    const results: any[] = [];
    for (const source of sources) {
      const result = await executeCrawl(source);
      results.push(result);
    }

    const totalNew = results.reduce((sum: number, r: any) => sum + (r.newCount || 0), 0);
    const totalFound = results.reduce((sum: number, r: any) => sum + (r.foundCount || 0), 0);

    return NextResponse.json({
      message: `爬取完成，共发现 ${totalFound} 条，新增 ${totalNew} 条`,
      results,
      totalFound,
      totalNew,
    });
  } catch (error: any) {
    console.error('Crawl error:', error);
    return NextResponse.json({ error: '爬取失败', details: String(error) }, { status: 500 });
  }
}

async function executeCrawl(source: any): Promise<any> {
  // Create crawl log
  const log = createCrawlLog({
    sourceId: source.id,
    status: 'running',
    itemsFound: 0,
    itemsNew: 0,
    startedAt: new Date().toISOString(),
  });

  try {
    const { results, error } = await crawlSource(source.url, source.config ? JSON.parse(source.config || '{}') : {}, source.name);

    if (error) {
      updateCrawlLog(log.id, { status: 'error', errorMessage: error, finishedAt: new Date().toISOString() });
      updateSource(source.id, { status: 'error', lastCrawledAt: new Date().toISOString() });
      return { sourceName: source.name, foundCount: 0, newCount: 0, error };
    }

    let newCount = 0;
    for (const item of results) {
      const fingerprint = generateFingerprint(item.title, item.url);

      // Check if already exists
      const existing = getRawArticles().find(a => a.fingerprint === fingerprint);

      if (!existing) {
        createRawArticle({
          sourceId: source.id,
          title: item.title,
          summary: item.summary || undefined,
          content: item.content || undefined,
          url: item.url,
          coverImage: item.coverImage || undefined,
          publishedAt: item.publishedAt ? new Date(item.publishedAt).toISOString() : undefined,
          author: item.author || undefined,
          fingerprint,
          status: 'pending',
        });
        newCount++;
      }
    }

    updateCrawlLog(log.id, {
      status: 'success',
      itemsFound: results.length,
      itemsNew: newCount,
      finishedAt: new Date().toISOString(),
    });

    updateSource(source.id, { status: 'active', lastCrawledAt: new Date().toISOString() });

    return { sourceName: source.name, foundCount: results.length, newCount };

  } catch (err: any) {
    updateCrawlLog(log.id, {
      status: 'error',
      errorMessage: err instanceof Error ? err.message : String(err),
      finishedAt: new Date().toISOString(),
    });
    throw err;
  }
}
