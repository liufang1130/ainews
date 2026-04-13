'use client';

import { useState } from 'react';
import { Download, Globe, CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CrawlResult {
  sourceName: string;
  foundCount: number;
  newCount: number;
  error?: string;
}

export default function AdminCrawl() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CrawlResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCrawlAll = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '爬取失败');
      }

      setResults(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '爬取过程中发生错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">数据采集</h2>
        <p className="text-muted-foreground mt-1">手动触发信息源数据采集</p>
      </div>

      {/* Action Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Download className="h-5 w-5" />
                全量采集
              </h3>
              <p className="text-sm text-muted-foreground">
                将遍历所有启用的信息源，抓取最新资讯并存入待审核队列
              </p>
            </div>

            <Button
              onClick={handleCrawlAll}
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  采集中...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  开始采集
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <XCircle className="h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results && results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>采集结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{result.sourceName}</span>
                    {result.error ? (
                      <Badge variant="destructive" className="text-xs">
                        失败
                      </Badge>
                    ) : (
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-xs">
                        成功
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    {result.error ? (
                      <span className="text-destructive max-w-xs truncate">{result.error}</span>
                    ) : (
                      <>
                        <span className="text-muted-foreground">
                          发现 <strong className="text-foreground ml-1">{result.foundCount}</strong> 条
                        </span>
                        <span className="text-green-600 font-medium">
                          新增 <strong className="ml-1">{result.newCount}</strong> 条
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            {!results.some((r) => r.error) && (
              <div className="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">
                    采集完成！共新增 {results.reduce((s, r) => s + (r.newCount || 0), 0)} 条待审核资讯
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">使用说明</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <li>点击「开始采集」会依次访问所有已启用的信息源</li>
          <li>每个信息源的抓取规则基于预定义的模板自动匹配</li>
          <li>采集到的内容会自动去重后存入「待审核」队列</li>
          <li>前往「待审核」页面查看和发布新内容</li>
        </CardContent>
      </Card>
    </div>
  );
}
