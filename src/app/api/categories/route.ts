import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { articles: true } } },
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: '获取分类失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, icon, color, description, sortOrder } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: '名称和标识为必填项' }, { status: 400 });
    }

    // Check for duplicate slug
    const existing = await db.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: '该分类标识已存在' }, { status: 409 });
    }

    const category = await db.category.create({
      data: {
        name,
        slug,
        icon: icon || null,
        color: color || null,
        description: description || null,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json({ error: '创建分类失败' }, { status: 500 });
  }
}
