import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sourceId = searchParams.get('sourceId');

    const where: any = { status: 'pending' };
    if (sourceId) where.sourceId = sourceId;

    const [articles, total] = await Promise.all([
      db.rawArticle.findMany({
        where,
        include: {
          source: { select: { name: true, type: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.rawArticle.count({ where }),
    ]);

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get pending articles error:', error);
    return NextResponse.json({ error: '获取待审核文章失败' }, { status: 500 });
  }
}
