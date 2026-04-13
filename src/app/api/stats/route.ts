import { NextResponse } from 'next/server';
import { getStats } from '@/lib/data';

export async function GET() {
  try {
    const stats = getStats();

    // 匹配前端 StatsData 接口: { overview: {...}, categoryStats: [...] }
    const today = new Date().toISOString().split('T')[0];
    const publishedToday = stats.recentArticles?.filter(
      (a: any) => a.publishedAt?.startsWith(today)
    ).length || 0;

    return NextResponse.json({
      overview: {
        totalArticles: stats.totalArticles,
        totalSources: stats.totalSources,
        pendingCount: stats.totalPending,
        publishedToday,
      },
      categoryStats: stats.categoryCount || [],
    });
  } catch (error) {
    return NextResponse.json({ error: '获取统计失败' }, { status: 500 });
  }
}
