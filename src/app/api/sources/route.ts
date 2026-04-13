import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const sources = await db.source.findMany({
      orderBy: { priority: 'desc' },
      include: {
        _count: { select: { rawArticles: true } },
      },
    });
    return NextResponse.json(sources);
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
    const existing = await db.source.findUnique({ where: { url } });
    if (existing) {
      return NextResponse.json({ error: '该URL已存在' }, { status: 409 });
    }

    const source = await db.source.create({
      data: {
        name,
        url,
        type: type || 'website',
        description: description || '',
        config: config ? JSON.stringify(config) : null,
        priority: priority || 0,
      },
    });

    return NextResponse.json(source, { status: 201 });
  } catch (error) {
    console.error('Create source error:', error);
    return NextResponse.json({ error: '创建信息源失败' }, { status: 500 });
  }
}
