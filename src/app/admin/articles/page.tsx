'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ExternalLink, Trash2, Pencil, Pin, PinOff,
  Search, Loader2, Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

interface Article {
  id: string;
  title: string;
  summary: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  category?: {
    name: string; slug: string; icon: string | null; color: string | null;
  };
  tags: string | null;
  isPinned: boolean;
  publishedAt: string;
}

function parseTags(tagsStr: string | null): string[] {
  if (!tagsStr) return [];
  try { return JSON.parse(tagsStr); } catch { return []; }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  return `${Math.floor(hours / 24)}天前`;
}

export default function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editArticle, setEditArticle] = useState<Article | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSummary, setEditSummary] = useState('');

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
      const res = await fetch(`/api/articles?limit=50${params}`);
      const data = await res.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这篇文章吗？')) return;

    try {
      await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      fetchArticles();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleTogglePin = async (article: Article) => {
    try {
      await fetch(`/api/articles/${article.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !article.isPinned }),
      });
      fetchArticles();
    } catch (error) {
      console.error('Toggle pin error:', error);
    }
  };

  const openEditDialog = (article: Article) => {
    setEditArticle(article); setEditTitle(article.title); setEditSummary(article.summary || '');
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editArticle) return;

    try {
      await fetch(`/api/articles/${editArticle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, summary: editSummary }),
      });
      setEditOpen(false); fetchArticles();
    } catch (error) {
      console.error('Save edit error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">已发布文章</h2>
        <p className="text-muted-foreground mt-1">管理所有已发布的资讯</p>
      </div>

      {/* Search */}
      <div className="flex gap-3 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索标题、摘要..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={fetchArticles}>
          搜索
        </Button>
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
              <p>暂无已发布文章</p>
            </div>
          ) : (
            <div className="divide-y">
              {articles.map((article) => (
                <div key={article.id} className="py-4 flex gap-4 group">
                  {/* Pin indicator */}
                  {article.isPinned && (
                    <Pin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold line-clamp-1">{article.title}</h3>
                      {article.category && (
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{ color: article.category.color || undefined, borderColor: article.category.color || undefined }}
                        >
                          {article.category.icon} {article.category.name}
                        </Badge>
                      )}
                      {parseTags(article.tags).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
                      ))}
                    </div>

                    {article.summary && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{article.summary}</p>
                    )}

                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {article.sourceName && <span>{article.sourceName}</span>}
                      <span>{timeAgo(article.publishedAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="ghost" onClick={() => window.open(article.sourceUrl || '#', '_blank')} title="原文">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleTogglePin(article)} title={article.isPinned ? '取消置顶' : '置顶'}>
                      {article.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openEditDialog(article)} title="编辑">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(article.id)} title="删除">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>编辑文章</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium">标题</label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">摘要</label>
              <textarea
                value={editSummary}
                onChange={(e) => setEditSummary(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>取消</Button>
              <Button onClick={handleSaveEdit}>保存</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
