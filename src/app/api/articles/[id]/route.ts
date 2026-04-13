import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const article = await db.article.findUnique({
      where: { id },
      include: {
        category: true,
        rawArticle: { include: { source: true } },
      },
    });

    if (!article) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    return NextResponse.json({ error: '获取文章失败' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Convert tags array to JSON string if needed
    if (body.tags && Array.isArray(body.tags)) {
      body.tags = JSON.stringify(body.tags);
    }

    const { rawArticle: _, ...updateData } = body;

    const article = await db.article.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error('Update article error:', error);
    return NextResponse.json({ error: '更新文章失败' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const article = await db.article.findUnique({ where: { id } });

    if (article) {
      // Reset raw article status
      await db.rawArticle.update({
        where: { id: article.rawArticleId },
        data: { status: 'pending' },
      });
    }

    await db.article.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete article error:', error);
    return NextResponse.json({ error: '删除文章失败' }, { status: 500 });
  }
}
