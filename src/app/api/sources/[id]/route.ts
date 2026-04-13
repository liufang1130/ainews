import { NextResponse } from 'next/server';
import { updateSource, deleteSource, getSource } from '@/lib/data';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const source = updateSource(id, body);
    if (!source) {
      return NextResponse.json({ error: '信息源不存在' }, { status: 404 });
    }
    return NextResponse.json(source);
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
    const success = deleteSource(id);
    if (!success) {
      return NextResponse.json({ error: '信息源不存在' }, { status: 404 });
    }
    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
