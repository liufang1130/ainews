import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Batch approve articles
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ids, action, categoryId, tags } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: '请选择文章' }, { status: 400 });
    }

    if (action === 'approve') {
      // Get all raw articles
      const rawArticles = await db.rawArticle.findMany({
        where: { id: { in: ids }, status: 'pending' },
        include: { source: true },
      });

      // Create published articles
      for (const raw of rawArticles) {
        await db.article.create({
          data: {
            rawArticleId: raw.id,
            title: raw.title,
            summary: raw.summary,
            content: raw.content,
            sourceName: raw.source.name,
            sourceUrl: raw.url,
            coverImage: raw.coverImage,
            categoryId: categoryId || null,
            tags: tags ? JSON.stringify(tags) : null,
            isPinned: false,
            publishedAt: new Date(),
          },
        });

        await db.rawArticle.update({
          where: { id: raw.id },
          data: { status: 'published' },
        });
      }

      return NextResponse.json({
        success: true,
        message: `成功发布 ${rawArticles.length} 篇文章`,
        count: rawArticles.length,
      });
    }

    if (action === 'reject') {
      await db.rawArticle.updateMany({
        where: { id: { in: ids } },
        data: { status: 'rejected' },
      });

      return NextResponse.json({
        success: true,
        message: `已忽略 ${ids.length} 篇文章`,
        count: ids.length,
      });
    }

    return NextResponse.json({ error: '无效的操作' }, { status: 400 });
  } catch (error) {
    console.error('Batch operation error:', error);
    return NextResponse.json({ error: '批量操作失败' }, { status: 500 });
  }
}
