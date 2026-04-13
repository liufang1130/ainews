import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const source = await db.source.findUnique({
      where: { id },
      include: {
        rawArticles: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        crawlLogs: {
          orderBy: { startedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!source) {
      return NextResponse.json({ error: '信息源不存在' }, { status: 404 });
    }

    return NextResponse.json(source);
  } catch (error) {
    return NextResponse.json({ error: '获取信息源失败' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Remove id from update data if present
    const { id: _, ...updateData } = body;

    // Convert config object to JSON string if needed
    if (updateData.config && typeof updateData.config === 'object') {
      updateData.config = JSON.stringify(updateData.config);
    }

    const source = await db.source.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(source);
  } catch (error) {
    console.error('Update source error:', error);
    return NextResponse.json({ error: '更新信息源失败' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.source.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: '删除信息源失败' }, { status: 500 });
  }
}
