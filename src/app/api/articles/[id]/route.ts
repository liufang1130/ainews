import { NextResponse } from 'next/server';
import { getArticle, updateArticle, deleteArticle } from '@/lib/data';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const article = getArticle(id);
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
    
    // 处理 isPinned 切换
    if (body.isPinned !== undefined && Object.keys(body).length === 1) {
      const article = getArticle(id);
      if (!article) {
        return NextResponse.json({ error: '文章不存在' }, { status: 404 });
      }
      const updated = updateArticle(id, { isPinned: body.isPinned });
      return NextResponse.json(updated);
    }

    const updated = updateArticle(id, body);
    if (!updated) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = deleteArticle(id);
    if (!success) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }
    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
