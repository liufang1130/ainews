import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalArticles,
      totalSources,
      pendingCount,
      publishedToday,
      crawlStats,
      categoryStats,
    ] = await Promise.all([
      db.article.count(),
      db.source.count({ where: { isEnabled: true } }),
      db.rawArticle.count({ where: { status: 'pending' } }),
      db.article.count({
        where: { publishedAt: { gte: today } },
      }),
      // Last 7 days crawl stats
      db.crawlLog.groupBy({
        by: ['status'],
        _count: true,
        where: {
          startedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Articles per category
      db.category.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
          color: true,
          _count: { select: { articles: true } },
        },
      }),
    ]);

    return NextResponse.json({
      overview: {
        totalArticles,
        totalSources,
        pendingCount,
        publishedToday,
      },
      crawlStats,
      categoryStats,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json({ error: '获取统计失败' }, { status: 500 });
  }
}
