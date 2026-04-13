'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, FileText, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

interface StatsData {
  overview: {
    totalArticles: number;
    totalSources: number;
    pendingCount: number;
    publishedToday: number;
  };
  categoryStats: Array<{
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    color: string | null;
    _count: { articles: number };
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">概览</h2>
        <p className="text-muted-foreground mt-1">平台运行状态总览</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">已发布文章</p>
                <p className="text-3xl font-bold mt-1">{stats?.overview.totalArticles || 0}</p>
              </div>
              <FileText className="h-10 w-10 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">信息源数量</p>
                <p className="text-3xl font-bold mt-1">{stats?.overview.totalSources || 0}</p>
              </div>
              <Globe className="h-10 w-10 text-green-500/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">待审核文章</p>
                <p className="text-3xl font-bold mt-1">{stats?.overview.pendingCount || 0}</p>
              </div>
              <Clock className="h-10 w-10 text-yellow-500/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">今日发布</p>
                <p className="text-3xl font-bold mt-1">{stats?.overview.publishedToday || 0}</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-blue-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            分类统计
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.categoryStats && stats.categoryStats.length > 0 ? (
            <div className="space-y-3">
              {stats.categoryStats
                .filter((c) => c._count.articles > 0)
                .sort((a, b) => b._count.articles - a._count.articles)
                .map((cat) => (
                  <div key={cat.id} className="flex items-center gap-4">
                    <span className="w-24 flex items-center gap-1.5 text-sm">
                      <span>{cat.icon}</span>
                      <span className="font-medium truncate">{cat.name}</span>
                    </span>
                    <div className="flex-1 h-8 bg-secondary rounded-lg overflow-hidden">
                      <div
                        className="h-full rounded-lg transition-all duration-500"
                        style={{
                          width: `${Math.max(5, (cat._count.articles / (stats.overview.totalArticles || 1)) * 100)}%`,
                          backgroundColor: cat.color || '#6366f1',
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right tabular-nums">
                      {cat._count.articles}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">暂无数据</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
