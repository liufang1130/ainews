import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: any = {};

    if (category && category !== 'all') {
      where.category = { slug: category };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { summary: { contains: search } },
        { tags: { contains: search } },
        { sourceName: { contains: search } },
      ];
    }

    const [articles, total, categories] = await Promise.all([
      db.article.findMany({
        where,
        include: {
          category: { select: { name: true, slug: true, icon: true, color: true } },
        },
        orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.article.count({ where }),
      db.category.findMany({
        orderBy: { sortOrder: 'asc' },
        include: { _count: { select: { articles: true } } },
      }),
    ]);

    return NextResponse.json({
      articles,
      categories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get articles error:', error);
    return NextResponse.json({ error: '获取文章失败' }, { status: 500 });
  }
}

// POST - Create article manually
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, summary, content, sourceName, sourceUrl, categoryId, tags, coverImage } = body;

    if (!title) {
      return NextResponse.json({ error: '标题不能为空' }, { status: 400 });
    }

    // Create a raw article first, then publish it
    const rawArticle = await db.rawArticle.create({
      data: {
        sourceId: 'manual',
        title,
        summary,
        content,
        url: sourceUrl || '',
        coverImage,
        status: 'published',
        fingerprint: `manual-${Date.now()}-${Math.random()}`,
        author: sourceName,
      },
    });

    const article = await db.article.create({
      data: {
        rawArticleId: rawArticle.id,
        title,
        summary,
        content,
        sourceName: sourceName || '手动添加',
        sourceUrl: sourceUrl || '',
        categoryId: categoryId || null,
        tags: tags ? JSON.stringify(tags) : null,
        coverImage,
        publishedAt: new Date(),
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error('Create article error:', error);
    return NextResponse.json({ error: '创建文章失败' }, { status: 500 });
  }
}
