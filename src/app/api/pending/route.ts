import { NextResponse } from 'next/server';
import { getRawArticles } from '@/lib/data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    
    const articles = getRawArticles(status);
    return NextResponse.json(articles);
  } catch (error) {
    return NextResponse.json({ error: '获取待审核文章失败' }, { status: 500 });
  }
}
