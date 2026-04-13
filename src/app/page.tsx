'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Clock, ExternalLink, Pin, Loader2, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Article {
  id: string;
  title: string;
  summary: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  category?: {
    name: string;
    slug: string;
    icon: string | null;
    color: string | null;
  };
  tags: string | null;
  isPinned: boolean;
  publishedAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  _count: { articles: number };
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;

  // Format date for older articles
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) return '今天';

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return '昨天';

  return date.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

function parseTags(tagsStr: string | null): string[] {
  if (!tagsStr) return [];
  try {
    return JSON.parse(tagsStr);
  } catch {
    return [];
  }
}

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [darkMode, setDarkMode] = useState(false);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (searchQuery) params.set('search', searchQuery);
      params.set('limit', '50');

      const res = await fetch(`/api/articles?${params}`);
      const data = await res.json();
      setArticles(data.articles || []);
      if (data.categories) setCategories(data.categories);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Check system dark mode preference
  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Group articles by date
  const groupedArticles = articles.reduce((groups, article) => {
    const dateKey = formatDateGroup(article.publishedAt);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(article);
    return groups;
  }, {} as Record<string, Article[]>);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <span className="text-2xl">🤖</span>
                <h1 className="text-xl font-bold hidden sm:block">AI资讯聚合平台</h1>
              </Link>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md mx-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索资讯..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Link href="/admin">
                <Button variant="outline" size="sm">后台管理</Button>
              </Link>
            </div>
          </div>

          {/* Category Navigation */}
          <nav className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Badge
              variant={selectedCategory === 'all' ? 'default' : 'secondary'}
              className="cursor-pointer whitespace-nowrap px-3 py-1.5"
              onClick={() => setSelectedCategory('all')}
            >
              全部
            </Badge>
            {categories.map((cat) => (
              <Badge
                key={cat.id}
                variant={selectedCategory === cat.slug ? 'default' : 'secondary'}
                className={`cursor-pointer whitespace-nowrap px-3 py-1.5 ${
                  selectedCategory === cat.slug && cat.color
                    ? ''
                    : ''
                }`}
                style={{
                  backgroundColor: selectedCategory === cat.slug ? cat.color : undefined,
                }}
                onClick={() => setSelectedCategory(cat.slug)}
              >
                {cat.icon} {cat.name} ({cat._count.articles})
              </Badge>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">加载中...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-xl font-medium mb-2">暂无资讯</p>
            <p className="text-muted-foreground">
              {searchQuery ? '没有找到匹配的搜索结果，试试其他关键词吧' : '还没有发布任何资讯，去后台添加一些吧'}
            </p>
          </div>
        ) : (
          Object.entries(groupedArticles).map(([dateKey, groupArticles]) => (
            <section key={dateKey} className="mb-8">
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-4 sticky top-[105px] bg-background/95 backdrop-blur z-10 py-2 -mx-4 px-4">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {dateKey}
                </h2>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">{groupArticles.length} 条</span>
              </div>

              {/* Articles */}
              <div className="space-y-4 pl-4">
                {groupArticles.map((article) => (
                  <Card
                    key={article.id}
                    className="group hover:shadow-md transition-all duration-200 border-l-2 border-l-transparent hover:border-l-primary cursor-pointer"
                    onClick={() => article.sourceUrl && window.open(article.sourceUrl, '_blank')}
                  >
                    <CardHeader className="pb-2 pt-4 px-5">
                      <div className="flex items-start gap-3">
                        {article.isPinned && (
                          <Pin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        )}
                        <CardTitle className="text-base font-semibold leading-snug group-hover:text-primary transition-colors flex-1">
                          {article.title}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="px-5 pb-4">
                      {article.summary && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {article.summary}
                        </p>
                      )}

                      <div className="flex items-center gap-2 flex-wrap">
                        {article.category && (
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{
                              borderColor: article.category.color || undefined,
                              color: article.category.color || undefined,
                            }}
                          >
                            {article.category.icon} {article.category.name}
                          </Badge>
                        )}

                        {parseTags(article.tags).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}

                        <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                          {article.sourceName && <span>{article.sourceName}</span>}
                          <Clock className="h-3 w-3" />
                          <span>{timeAgo(article.publishedAt)}</span>
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto py-8 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          <p>AI资讯聚合平台 - 自动采集 + 人工审核</p>
          <p className="mt-1">Powered by Next.js + Prisma + Cheerio</p>
        </div>
      </footer>
    </div>
  );
}
