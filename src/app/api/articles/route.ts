import { NextResponse } from 'next/server';
import { getArticles, getCategories } from '@/lib/data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    
    const articles = getArticles({ category, search });
    
    // 附加分类信息
    const categories = getCategories();
    const articlesWithCategory = articles.map(article => ({
      ...article,
      category: article.categoryId ? categories.find(c => c.id === article.categoryId) : null,
    }));
    
    return NextResponse.json(articlesWithCategory);
  } catch (error: any) {
    return NextResponse.json({ error: '获取文章失败' }, { status: 500 });
  }
}
