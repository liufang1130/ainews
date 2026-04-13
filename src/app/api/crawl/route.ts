import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { crawlSource, generateFingerprint } from '@/lib/crawler';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sourceId } = body;

    if (sourceId) {
      const source = await db.source.findUnique({ where: { id: sourceId } });
      if (!source) {
        return NextResponse.json({ error: '信息源不存在' }, { status: 404 });
      }

      const result = await executeCrawl(source);
      return NextResponse.json(result);
    } else {
      const sources = await db.source.findMany({
        where: { isEnabled: true },
        orderBy: { priority: 'desc' },
      });

      if (sources.length === 0) {
        return NextResponse.json({ error: '没有可用的信息源' }, { status: 400 });
      }

      const results: any[] = [];
      for (const source of sources) {
        const result = await executeCrawl(source);
        results.push(result);
      }

      const totalNew = results.reduce((sum, r) => sum + (r.newCount || 0), 0);
      const totalFound = results.reduce((sum, r) => sum + (r.foundCount || 0), 0);

      return NextResponse.json({
        message: `爬取完成，共发现 ${totalFound} 条，新增 ${totalNew} 条`,
        results,
        totalFound,
        totalNew,
      });
    }
  } catch (error) {
    console.error('Crawl error:', error);
    return NextResponse.json({ error: '爬取失败', details: String(error) }, { status: 500 });
  }
}

async function executeCrawl(source: any): Promise<any> {
  const log = await db.crawlLog.create({
    data: {
      sourceId: source.id,
      status: 'running',
      startedAt: new Date(),
    },
  });

  try {
    const { results, error } = await crawlSource(
      source.url,
      source.config,
      source.name
    );

    if (error) {
      await db.crawlLog.update({
        where: { id: log.id },
        data: { status: 'error', errorMessage: error, finishedAt: new Date() },
      });
      await db.source.update({
        where: { id: source.id },
        data: { status: 'error', lastCrawledAt: new Date() },
      });
      return { sourceName: source.name, foundCount: 0, newCount: 0, error };
    }

    let newCount = 0;
    for (const item of results) {
      const fingerprint = generateFingerprint(item.title, item.url);

      const existing = await db.rawArticle.findFirst({
        where: { fingerprint },
      });

      if (!existing) {
        await db.rawArticle.create({
          data: {
            sourceId: source.id,
            title: item.title,
            summary: item.summary || null,
            content: item.content || null,
            url: item.url,
            coverImage: item.coverImage || null,
            publishedAt: item.publishedAt || null,
            author: item.author || null,
            fingerprint,
            status: 'pending',
          },
        });
        newCount++;
      }
    }

    await db.crawlLog.update({
      where: { id: log.id },
      data: {
        status: 'success',
        itemsFound: results.length,
        itemsNew: newCount,
        finishedAt: new Date(),
      },
    });

    await db.source.update({
      where: { id: source.id },
      data: { status: 'active', lastCrawledAt: new Date() },
    });

    return { sourceName: source.name, foundCount: results.length, newCount };
  } catch (err) {
    await db.crawlLog.update({
      where: { id: log.id },
      data: {
        status: 'error',
        errorMessage: err instanceof Error ? err.message : String(err),
        finishedAt: new Date(),
      },
    });
    throw err;
  }
}
