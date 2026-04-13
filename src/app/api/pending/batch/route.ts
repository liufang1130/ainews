import { NextResponse } from 'next/server';
import { getRawArticles, updateRawArticle, publishArticle } from '@/lib/data';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ids, action, categoryId } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: '请选择文章' }, { status: 400 });
    }

    let successCount = 0;
    const errors: string[] = [];

    for (const id of ids) {
      try {
        if (action === 'approve') {
          const article = getRawArticles().find(a => a.id === id);
          if (article) {
            publishArticle(article, { categoryId });
            successCount++;
          }
        } else if (action === 'reject') {
          updateRawArticle(id, { status: 'rejected' });
          successCount++;
        }
      } catch (e: any) {
        errors.push(`${id}: ${e.message}`);
      }
    }

    return NextResponse.json({
      message: `批量操作完成，成功 ${successCount} 条`,
      successCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    return NextResponse.json({ error: '批量操作失败', details: String(error) }, { status: 500 });
  }
}
