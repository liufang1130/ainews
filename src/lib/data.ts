import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

// 确保data目录存在
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// ==================== 数据类型 ====================
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  description?: string;
}

export interface Source {
  id: string;
  name: string;
  url: string;
  type: string;
  description?: string;
  config?: string;
  isEnabled: boolean;
  priority: number;
  lastCrawledAt?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface RawArticle {
  id: string;
  sourceId: string;
  title: string;
  summary?: string;
  content?: string;
  url: string;
  coverImage?: string;
  publishedAt?: string;
  author?: string;
  fingerprint?: string;
  status: string; // pending, approved, rejected, published
  createdAt: string;
  updatedAt: string;
}

export interface Article {
  id: string;
  rawArticleId: string;
  title: string;
  summary?: string;
  content?: string;
  sourceName?: string;
  sourceUrl?: string;
  categoryId?: string;
  tags?: string;
  coverImage?: string;
  isPinned: boolean;
  isFeatured: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CrawlLog {
  id: string;
  sourceId: string;
  status: string;
  itemsFound: number;
  itemsNew: number;
  errorMessage?: string;
  startedAt: string;
  finishedAt?: string;
}

// ==================== 数据文件路径 ====================
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');
const SOURCES_FILE = path.join(DATA_DIR, 'sources.json');
const RAW_ARTICLES_FILE = path.join(DATA_DIR, 'raw-articles.json');
const ARTICLES_FILE = path.join(DATA_DIR, 'articles.json');
const CRAWL_LOGS_FILE = path.join(DATA_DIR, 'crawl-logs.json');

// ==================== 通用读写函数 ====================
function readJson<T>(filePath: string): T[] {
  ensureDataDir();
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error(`Error reading ${filePath}:`, e);
  }
  return [];
}

function writeJson<T>(filePath: string, data: T[]): void {
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ==================== 初始化种子数据 ====================
export function initializeData() {
  ensureDataDir();
  
  // 如果已有数据就不初始化
  if (fs.existsSync(CATEGORIES_FILE) && readJson<Category>(CATEGORIES_FILE).length > 0) {
    return;
  }
  
  // 分类数据
  const categories: Category[] = [
    { id: 'cat1', name: '大模型', slug: 'llm', icon: '🤖', color: '#6366f1', sortOrder: 1 },
    { id: 'cat2', name: '开源项目', slug: 'opensource', icon: '📦', color: '#10b981', sortOrder: 2 },
    { id: 'cat3', name: '融资动态', slug: 'funding', icon: '💰', color: '#f59e0b', sortOrder: 3 },
    { id: 'cat4', name: 'AI工具', slug: 'tools', icon: '🛠️', color: '#8b5cf6', sortOrder: 4 },
    { id: 'cat5', name: '学术研究', slug: 'research', icon: '🔬', color: '#ec4899', sortOrder: 5 },
    { id: 'cat6', name: '公司动态', slug: 'company', icon: '🏢', color: '#06b6d4', sortOrder: 6 },
    { id: 'cat7', name: '教程指南', slug: 'tutorial', icon: '📚', color: '#f97316', sortOrder: 7 },
    { id: 'cat8', name: '政策法规', slug: 'policy', icon: '⚖️', color: '#78716c', sortOrder: 8 },
  ];
  
  // 信息源数据
  const sources: Source[] = [
    {
      id: 'src1', name: '36氪 AI频道', url: 'https://36kr.com/information/AI/', type: 'website',
      description: '36氪 AI 频道资讯', isEnabled: true, priority: 10,
      status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
    {
      id: 'src2', name: '量子位', url: 'https://www.qbitai.com/', type: 'website',
      description: '关注 AI 和前沿科技', isEnabled: true, priority: 8,
      status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
    {
      id: 'src3', name: '机器之心', url: 'https://www.jiqizhixin.com/', type: 'website',
      description: '专业 AI 技术媒体', isEnabled: true, priority: 7,
      status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
  ];

  // 示例文章
  const now = new Date().toISOString();
  const articles: Article[] = [
    {
      id: 'art1', rawArticleId: 'raw1',
      title: 'GPT-5 正式发布：多模态能力大幅提升，支持长文本推理',
      summary: 'OpenAI 今日正式发布 GPT-5 模型，在多模态理解、代码生成和复杂推理方面取得重大突破...',
      sourceName: '量子位', sourceUrl: 'https://qbitai.com/',
      categoryId: 'cat1', isPinned: true, isFeatured: true,
      publishedAt: now, createdAt: now, updatedAt: now,
    },
    {
      id: 'art2', rawArticleId: 'raw2',
      title: 'Meta开源LLaMA 4：参数规模达万亿级别，性能对标闭源模型',
      summary: 'Meta 发布 LLaMA 4 开源大模型，采用 MoE 架构，总参数量超过 1 万亿，多项基准测试超越 GPT-4...',
      sourceName: '机器之心', sourceUrl: 'https://jiqizhixin.com/',
      categoryId: 'cat2', isPinned: false, isFeatured: true,
      publishedAt: now, createdAt: now, updatedAt: now,
    },
    {
      id: 'art3', rawArticleId: 'raw3',
      title: '智谱 AI 完成 B+ 轮融资，估值突破 200 亿人民币',
      summary: '国内大模型公司智谱 AI 宣布完成 B+ 轮融资，由美团、小米等领投，估值达到 200 亿元...',
      sourceName: '36氪', sourceUrl: 'https://36kr.com/',
      categoryId: 'cat3', isPinned: false, isFeatured: false,
      publishedAt: now, createdAt: now, updatedAt: now,
    },
    {
      id: 'art4', rawArticleId: 'raw4',
      title: 'Cursor 发布 v2.0：集成 Claude 4，编程体验再升级',
      summary: 'AI 编程工具 Cursor 发布 2.0 版本，新增多文件编辑、智能调试等功能，开发者反馈显著提升效率...',
      sourceName: '机器之心', sourceUrl: 'https://jiqizhixin.com/',
      categoryId: 'cat4', isPinned: false, isFeatured: false,
      publishedAt: now, createdAt: now, updatedAt: now,
    },
    {
      id: 'art5', rawArticleId: 'raw5',
      title: 'Google DeepMind 在 Nature 发文：AlphaFold 3 成功预测所有生物分子结构',
      summary: 'Google DeepMind 的 AlphaFold 3 研究成果发表于 Nature，成功预测了几乎所有已知生物分子的三维结构...',
      sourceName: '量子位', sourceUrl: 'https://qbitai.com/',
      categoryId: 'cat5', isPinned: false, isFeatured: false,
      publishedAt: now, createdAt: now, updatedAt: now,
    },
    {
      id: 'art6', rawArticleId: 'raw6',
      title: '英伟达发布 H2000 芯片：专为 AI 训练优化，性能提升 3 倍',
      summary: '英伟达发布新一代 AI 芯片 H2000，采用全新架构，FP8 性能较前代提升 300%，功耗降低 40%...',
      sourceName: '36氪', sourceUrl: 'https://36kr.com/',
      categoryId: 'cat6', isPinned: false, isFeatured: false,
      publishedAt: now, createdAt: now, updatedAt: now,
    },
    {
      id: 'art7', rawArticleId: 'raw7',
      title: '从零开始构建 RAG 应用：完整教程（含代码示例）',
      summary: '本文详细介绍如何使用 LangChain 和 OpenAI API 从零构建检索增强生成(RAG)应用，涵盖文档处理、向量存储、问答系统等全流程...',
      sourceName: 'AI工具集', sourceUrl: 'https://ai-toolbox.dev',
      categoryId: 'cat7', isPinned: false, isFeatured: false,
      publishedAt: new Date(Date.now() - 86400000).toISOString(), createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'art8', rawArticleId: 'raw8',
      title: '欧盟《AI法案》正式生效：全球首部综合性 AI 监管法律',
      summary: '欧盟《人工智能法案》今日正式生效，成为全球第一部针对 AI 的综合性监管法律，对高风险 AI 系统提出严格要求...',
      sourceName: '财新网', sourceUrl: 'https://caixin.com/',
      categoryId: 'cat8', isPinned: false, isFeatured: false,
      publishedAt: new Date(Date.now() - 172800000).toISOString(), createdAt: new Date(Date.now() - 172800000).toISOString(), updatedAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ];

  writeJson(CATEGORIES_FILE, categories);
  writeJson(SOURCES_FILE, sources);
  writeJson(ARTICLES_FILE, articles);
  writeJson(RAW_ARTICLES_FILE, []);
  writeJson(CRAWL_LOGS_FILE, []);

  console.log('✅ 数据初始化完成');
}

// 自动初始化
initializeData();

// ==================== Categories ====================
export function getCategories(): Category[] {
  return readJson<Category>(CATEGORIES_FILE);
}

// ==================== Sources ====================
export function getSources(): Source[] {
  return readJson<Source>(SOURCES_FILE);
}

export function getSource(id: string): Source | undefined {
  return getSources().find(s => s.id === id);
}

export function createSource(data: Omit<Source, 'id' | 'createdAt' | 'updatedAt'>): Source {
  const sources = getSources();
  const newSource: Source = {
    ...data,
    id: `src${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  sources.push(newSource);
  writeJson(SOURCES_FILE, sources);
  return newSource;
}

export function updateSource(id: string, data: Partial<Source>): Source | null {
  const sources = getSources();
  const index = sources.findIndex(s => s.id === id);
  if (index === -1) return null;
  sources[index] = { ...sources[index], ...data, updatedAt: new Date().toISOString() };
  writeJson(SOURCES_FILE, sources);
  return sources[index];
}

export function deleteSource(id: string): boolean {
  const sources = getSources();
  const filtered = sources.filter(s => s.id !== id);
  if (filtered.length === sources.length) return false;
  writeJson(SOURCES_FILE, filtered);
  return true;
}

// ==================== Raw Articles (待审核) ====================
export function getRawArticles(status?: string): RawArticle[] {
  let articles = readJson<RawArticle>(RAW_ARTICLES_FILE);
  if (status) {
    articles = articles.filter(a => a.status === status);
  }
  return articles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getRawArticle(id: string): RawArticle | undefined {
  return getRawArticles().find(a => a.id === id);
}

export function createRawArticle(data: Omit<RawArticle, 'id' | 'createdAt' | 'updatedAt'>): RawArticle {
  const articles = getRawArticles();
  const newArticle: RawArticle = {
    ...data,
    id: `raw${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  articles.push(newArticle);
  writeJson(RAW_ARTICLES_FILE, articles);
  return newArticle;
}

export function updateRawArticle(id: string, data: Partial<RawArticle>): RawArticle | null {
  const articles = getRawArticles();
  const index = articles.findIndex(a => a.id === id);
  if (index === -1) return null;
  articles[index] = { ...articles[index], ...data, updatedAt: new Date().toISOString() };
  writeJson(RAW_ARTICLES_FILE, articles);
  return articles[index];
}

export function deleteRawArticle(id: string): boolean {
  const articles = getRawArticles();
  const filtered = articles.filter(a => a.id !== id);
  if (filtered.length === articles.length) return false;
  writeJson(RAW_ARTICLES_FILE, filtered);
  return true;
}

// ==================== Articles (已发布) ====================
export function getArticles(options?: { category?: string; search?: string; pinned?: boolean }): Article[] {
  let articles = readJson<Article>(ARTICLES_FILE);

  if (options?.category && options.category !== 'all') {
    articles = articles.filter(a => a.categoryId === options.category);
  }

  if (options?.search) {
    const q = options.search.toLowerCase();
    articles = articles.filter(a =>
      a.title.toLowerCase().includes(q) || (a.summary?.toLowerCase().includes(q))
    );
  }

  if (options?.pinned !== undefined) {
    articles = articles.filter(a => a.isPinned === options.pinned);
  }

  // 置顶排前面，然后按时间倒序
  return articles.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}

export function getArticle(id: string): Article | undefined {
  return getArticles().find(a => a.id === id);
}

export function publishArticle(rawArticle: RawArticle, opts?: { categoryId?: string }): Article {
  const articles = getArticles();
  const newArticle: Article = {
    id: `art${Date.now()}`,
    rawArticleId: rawArticle.id,
    title: rawArticle.title,
    summary: rawArticle.summary,
    content: rawArticle.content,
    coverImage: rawArticle.coverImage,
    categoryId: opts?.categoryId,
    isPinned: false,
    isFeatured: false,
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 找到来源名称
  const sources = getSources();
  const source = sources.find(s => s.id === rawArticle.sourceId);
  if (source) {
    newArticle.sourceName = source.name;
    newArticle.sourceUrl = source.url;
  }

  articles.push(newArticle);
  writeJson(ARTICLES_FILE, articles);

  // 更新原始文章状态
  updateRawArticle(rawArticle.id, { status: 'published' });

  return newArticle;
}

export function updateArticle(id: string, data: Partial<Article>): Article | null {
  const articles = getArticles();
  const index = articles.findIndex(a => a.id === id);
  if (index === -1) return null;
  articles[index] = { ...articles[index], ...data, updatedAt: new Date().toISOString() };
  writeJson(ARTICLES_FILE, articles);
  return articles[index];
}

export function deleteArticle(id: string): boolean {
  const articles = getArticles();
  const filtered = articles.filter(a => a.id !== id);
  if (filtered.length === articles.length) return false;
  writeJson(ARTICLES_FILE, filtered);
  return true;
}

// ==================== Crawl Logs ====================
export function getCrawlLogs(limit?: number): CrawlLog[] {
  let logs = readJson<CrawlLog>(CRAWL_LOGS_FILE);
  logs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  if (limit) logs = logs.slice(0, limit);
  return logs;
}

export function createCrawlLog(data: Omit<CrawlLog, 'id'>): CrawlLog {
  const logs = getCrawlLogs();
  const newLog: CrawlLog = { ...data, id: `log${Date.now()}` };
  logs.unshift(newLog);
  writeJson(CRAWL_LOGS_FILE, logs);
  return newLog;
}

export function updateCrawlLog(id: string, data: Partial<CrawlLog>): CrawlLog | null {
  const logs = getCrawlLogs(undefined); // no limit for updates
  const allLogs = readJson<CrawlLog>(CRAWL_LOGS_FILE);
  const index = allLogs.findIndex(l => l.id === id);
  if (index === -1) return null;
  allLogs[index] = { ...allLogs[index], ...data };
  writeJson(CRAWL_LOGS_FILE, allLogs);
  return allLogs[index];
}

// ==================== Stats ====================
export function getStats() {
  const articles = getArticles();
  const pending = getRawArticles('pending');
  const sources = getSources();
  const categories = getCategories();

  return {
    totalArticles: articles.length,
    totalPending: pending.length,
    totalSources: sources.length,
    totalCategories: categories.length,
    recentArticles: articles.slice(0, 5),
    categoryCount: categories.map(cat => ({
      ...cat,
      _count: { articles: articles.filter(a => a.categoryId === cat.id).length },
    })),
  };
}
