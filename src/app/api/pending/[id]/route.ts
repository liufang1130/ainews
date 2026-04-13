import { NextResponse } from 'next/server';
import { getRawArticle, updateRawArticle, publishArticle, deleteRawArticle, getCategories } from '@/lib/data';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const article = getRawArticle(id);
    if (!article) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }
    return NextResponse.json(article);
  } catch (error) {
    return NextResponse.json({ error: '获取文章失败' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const action = body.action; // 'approve' | 'reject'

    const article = getRawArticle(id);
    if (!article) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    if (action === 'approve') {
      // 发布文章
      const published = publishArticle(article, { categoryId: body.categoryId });
      
      // 找到分类信息
      const categories = getCategories();
      const category = categories.find(c => c.id === body.categoryId);
      
      return NextResponse.json({ 
        message: '发布成功', 
        article: published,
        category 
      });
    } else if (action === 'reject') {
      updateRawArticle(id, { status: 'rejected' });
      return NextResponse.json({ message: '已拒绝' });
    }

    return NextResponse.json({ error: '无效操作' }, { status: 400 });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: '操作失败', details: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = deleteRawArticle(id);
    if (!success) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }
    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
