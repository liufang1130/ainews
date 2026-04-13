'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Check, X, ExternalLink, Clock, Loader2, Trash2,
  CheckCheck, Eye, Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';

interface PendingArticle {
  id: string;
  title: string;
  summary: string | null;
  url: string;
  author: string | null;
  publishedAt: string;
  source?: {
    name: string;
    type: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AdminPending() {
  const [articles, setArticles] = useState<PendingArticle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Preview dialog
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewArticle, setPreviewArticle] = useState<PendingArticle | null>(null);

  // Publish dialog
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishId, setPublishId] = useState<string | null>(null);
  const [publishCategory, setPublishCategory] = useState('');

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pending?page=${page}&limit=20`);
      const data = await res.json();
      setArticles(data.articles || []);
      if (data.pagination) {
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to fetch pending articles:', error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchArticles();

    // Fetch categories for publish dialog
    fetch('/api/categories')
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error);
  }, [fetchArticles]);

  const handleSelectAll = () => {
    if (selectedIds.size === articles.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(articles.map((a) => a.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id); else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const openPreview = (article: PendingArticle) => {
    setPreviewArticle(article); setPreviewOpen(true);
  };

  const openPublishDialog = (id: string) => {
    setPublishId(id); setPublishCategory(categories[0]?.slug || ''); setPublishOpen(true);
  };

  const handleApprove = async (id: string) => {
    try {
      await fetch(`/api/pending/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: categories.find((c) => c.slug === publishCategory)?.id || null,
          tags: [],
        }),
      });
      setPublishOpen(false); fetchArticles();
    } catch (error) {
      console.error('Approve error:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await fetch(`/api/pending/${id}`, { method: 'DELETE' });
      fetchArticles();
    } catch (error) {
      console.error('Reject error:', error);
    }
  };

  const handleBatchApprove = async () => {
    if (!confirm(`确定要发布选中的 ${selectedIds.size} 篇文章吗？`)) return;

    try {
      await fetch('/api/pending/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          action: 'approve',
          categoryId: categories.find((c) => c.slug === publishCategory)?.id || null,
        }),
      });
      setSelectedIds(new Set()); fetchArticles();
    } catch (error) {
      console.error('Batch approve error:', error);
    }
  };

  const handleBatchReject = async () => {
    if (!confirm(`确定要忽略选中的 ${selectedIds.size} 篇文章吗？`)) return;

    try {
      await fetch('/api/pending/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds), action: 'reject' }),
      });
      setSelectedIds(new Set()); fetchArticles();
    } catch (error) {
      console.error('Batch reject error:', error);
    }
  };

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}分钟前`;
    return `${Math.floor(mins / 60)}小时前`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">待审核队列</h2>
          <p className="text-muted-foreground mt-1">
            审核采集到的资讯，选择发布或忽略
            {articles.length > 0 && (
              <Badge variant="secondary" className="ml-2">{articles.length} 条待处理</Badge>
            )}
          </p>
        </div>

        {/* Batch Actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">已选 {selectedIds.size} 项</span>
            <Button size="sm" onClick={handleBatchApprove}>
              <CheckCheck className="h-4 w-4 mr-1" /> 批量发布
            </Button>
            <Button size="sm" variant="destructive" onClick={handleBatchReject}>
              <Trash2 className="h-4 w-4 mr-1" /> 批量忽略
            </Button>
          </div>
        )}
      </div>

      {/* Article List */}
      <Card>
        <CardContent className="pt-0">
          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground mt-2">加载中...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Eye className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>暂无待审核文章，去「数据采集」页面抓取一些吧</p>
            </div>
          ) : (
            <>
              {/* Select All Header */}
              <div className="py-3 px-1 border-b flex items-center gap-3 text-sm font-medium text-muted-foreground sticky top-[105px] bg-card z-10">
                <input
                  type="checkbox"
                  checked={selectedIds.size === articles.length}
                  onChange={handleSelectAll}
                  className="rounded border-input"
                />
                <span>全选</span>
                <span className="flex-1" />
                <span>操作</span>
              </div>

              <div className="divide-y">
                {articles.map((article) => (
                  <div key={article.id} className="py-4 flex gap-4 group">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedIds.has(article.id)}
                      onChange={() => handleSelectOne(article.id)}
                      className="mt-1 rounded border-input"
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold line-clamp-1 hover:text-primary cursor-pointer" onClick={() => openPreview(article)}>
                        {article.title}
                      </h3>
                      {article.summary && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{article.summary}</p>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                        {article.source?.name && (
                          <Badge variant="outline" className="text-xs">{article.source.name}</Badge>
                        )}
                        {article.author && <span>{article.author}</span>}
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(article.publishedAt)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost" onClick={() => window.open(article.url, '_blank')} title="打开原文">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openPreview(article)} title="预览">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700" onClick={() => openPublishDialog(article.id)} title="发布">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleReject(article.id)} title="忽略">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 py-6">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    上一页
                  </Button>
                  <span className="px-3 py-1 text-sm text-muted-foreground self-center">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    下一页
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>文章预览</DialogTitle>
          </DialogHeader>
          {previewArticle && (
            <div className="space-y-4 mt-2">
              <h3 className="font-bold text-lg leading-tight">{previewArticle.title}</h3>
              {previewArticle.summary && (
                <p className="text-sm text-muted-foreground">{previewArticle.summary}</p>
              )}
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {previewArticle.source && (
                  <Badge variant="outline">{previewArticle.source.name}</Badge>
                )}
                {previewArticle.author && <span>作者: {previewArticle.author}</span>}
                <span>{new Date(previewArticle.publishedAt).toLocaleString('zh-CN')}</span>
              </div>
              <div className="flex justify-end pt-2 gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => { handleReject(previewArticle.id); setPreviewOpen(false); }}
                >
                  <X className="h-4 w-4 mr-1" /> 忽略
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setPreviewOpen(false); openPublishDialog(previewArticle.id);
                  }}
                >
                  <Check className="h-4 w-4 mr-1" /> 发布
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(previewArticle.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-1" /> 原文
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Publish Dialog */}
      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>发布文章</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium">选择分类</label>
              <select
                value={publishCategory}
                onChange={(e) => setPublishCategory(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setPublishOpen(false)}>取消</Button>
              <Button
                disabled={!publishId || !publishCategory}
                onClick={() => publishId && handleApprove(publishId)}
              >
                <Check className="h-4 w-4 mr-1" /> 确认发布
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
