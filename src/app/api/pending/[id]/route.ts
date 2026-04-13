import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET single pending article
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const article = await db.rawArticle.findUnique({
      where: { id },
      include: { source: true },
    });

    if (!article) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    return NextResponse.json({ error: '获取文章失败' }, { status: 500 });
  }
}

// Approve and publish an article
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { categoryId, tags, title, summary, isPinned } = body;

    const rawArticle = await db.rawArticle.findUnique({
      where: { id },
      include: { source: true },
    });

    if (!rawArticle) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    // Create published article
    const article = await db.article.create({
      data: {
        rawArticleId: rawArticle.id,
        title: title || rawArticle.title,
        summary: summary || rawArticle.summary,
        content: rawArticle.content,
        sourceName: rawArticle.source.name,
        sourceUrl: rawArticle.url,
        coverImage: rawArticle.coverImage,
        categoryId: categoryId || null,
        tags: tags ? JSON.stringify(tags) : null,
        isPinned: isPinned || false,
        publishedAt: new Date(),
      },
    });

    // Update raw article status
    await db.rawArticle.update({
      where: { id },
      data: { status: 'published' },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error('Approve article error:', error);
    return NextResponse.json({ error: '发布文章失败' }, { status: 500 });
  }
}

// Reject an article
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.rawArticle.update({
      where: { id },
      data: { status: 'rejected' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reject article error:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}
