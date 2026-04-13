import { NextResponse } from 'next/server';
import { getSources, createSource } from '@/lib/data';

export async function GET() {
  try {
    const sources = getSources();
    // 添加文章计数
    const sourcesWithCount = sources.map(s => ({
      ...s,
      _count: { rawArticles: 0 }, // JSON模式简化处理
    }));
    return NextResponse.json(sourcesWithCount);
  } catch (error) {
    return NextResponse.json({ error: '获取信息源失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, url, type, description, config, priority } = body;

    if (!name || !url) {
      return NextResponse.json({ error: '名称和URL为必填项' }, { status: 400 });
    }

    // Check for duplicate URL
    const existing = getSources().find(s => s.url === url);
    if (existing) {
      return NextResponse.json({ error: '该URL已存在' }, { status: 409 });
    }

    const source = createSource({
      name,
      url,
      type: type || 'website',
      description: description || '',
      config: config ? JSON.stringify(config) : undefined,
      priority: priority || 0,
      isEnabled: true,
      lastCrawledAt: undefined,
      status: 'active',
    });

    return NextResponse.json(source, { status: 201 });
  } catch (error: any) {
    console.error('Create source error:', error);
    return NextResponse.json({ error: '创建信息源失败' }, { status: 500 });
  }
}
