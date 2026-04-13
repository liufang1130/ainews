'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, ExternalLink, RefreshCw, Globe, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Source {
  id: string;
  name: string;
  url: string;
  type: string;
  description: string | null;
  isEnabled: boolean;
  priority: number;
  lastCrawledAt: string | null;
  status: string;
  _count: { rawArticles: number };
}

export default function AdminSources() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formType, setFormType] = useState('website');
  const [formDescription, setFormDescription] = useState('');

  const fetchSources = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sources');
      const data = await res.json();
      setSources(data);
    } catch (error) {
      console.error('Failed to fetch sources:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  const openCreateDialog = () => {
    setEditingSource(null);
    setFormName(''); setFormUrl(''); setFormType('website'); setFormDescription('');
    setDialogOpen(true);
  };

  const openEditDialog = (source: Source) => {
    setEditingSource(source);
    setFormName(source.name); setFormUrl(source.url); setFormType(source.type);
    setFormDescription(source.description || '');
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formName || !formUrl) return;

    try {
      if (editingSource) {
        await fetch(`/api/sources/${editingSource.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            url: formUrl,
            type: formType,
            description: formDescription,
            isEnabled: editingSource.isEnabled,
            priority: editingSource.priority,
          }),
        });
      } else {
        await fetch('/api/sources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            url: formUrl,
            type: formType,
            description: formDescription,
          }),
        });
      }

      setDialogOpen(false);
      fetchSources();
    } catch (error) {
      console.error('Save source error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个信息源吗？')) return;

    try {
      await fetch(`/api/sources/${id}`, { method: 'DELETE' });
      fetchSources();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const toggleEnable = async (source: Source) => {
    try {
      await fetch(`/api/sources/${source.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: !source.isEnabled }),
      });
      fetchSources();
    } catch (error) {
      console.error('Toggle error:', error);
    }
  };

  const typeLabels: Record<string, { label: string; color: string }> = {
    website: { label: '网页', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    wechat: { label: '公众号', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    github: { label: 'GitHub', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
    twitter: { label: 'Twitter', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
    producthunt: { label: 'PH', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    hackernews: { label: 'HN', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500' },
    reddit: { label: 'Reddit', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">信息源管理</h2>
          <p className="text-muted-foreground mt-1">管理数据采集的信息来源</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          添加信息源
        </Button>
      </div>

      {/* Source List */}
      <Card>
        <CardContent className="pt-0">
          {loading ? (
            <div className="py-12 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground mt-2">加载中...</p>
            </div>
          ) : sources.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>暂无信息源，点击上方按钮添加</p>
            </div>
          ) : (
            <div className="divide-y">
              {sources.map((source) => (
                <div key={source.id} className="py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold truncate">{source.name}</h3>
                      <Badge variant="outline" className={typeLabels[source.type]?.color}>
                        {typeLabels[source.type]?.label || source.type}
                      </Badge>
                      <Badge variant={source.isEnabled ? 'default' : 'secondary'}>
                        {source.isEnabled ? '启用' : '禁用'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 truncate">{source.url}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>优先级: {source.priority}</span>
                      <span>已采集: {source._count.rawArticles} 条</span>
                      {source.lastCrawledAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          上次: {new Date(source.lastCrawledAt).toLocaleString('zh-CN')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(source.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={source.isEnabled ? 'secondary' : 'default'}
                      onClick={() => toggleEnable(source)}
                    >
                      {source.isEnabled ? '禁用' : '启用'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditDialog(source)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(source.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSource ? '编辑信息源' : '添加信息源'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium">名称 *</label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="例如：量子位"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">URL *</label>
              <Input
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="https://www.qbitai.com/"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">类型</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="website">网页</option>
                <option value="wechat">微信公众号</option>
                <option value="github">GitHub</option>
                <option value="twitter">Twitter/X</option>
                <option value="producthunt">Product Hunt</option>
                <option value="hackernews">Hacker News</option>
                <option value="reddit">Reddit</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">描述</label>
              <Input
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="简短描述（可选）"
                className="mt-1"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleSubmit} disabled={!formName || !formUrl}>
                {editingSource ? '保存' : '添加'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
