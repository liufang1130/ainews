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

// ==================== 种子数据（硬编码，Vercel serverless 兼容）====================
const now = new Date().toISOString();

let categories: Category[] = [
  { id: 'cat1', name: '大模型', slug: 'llm', icon: '🤖', color: '#6366f1', sortOrder: 1 },
  { id: 'cat2', name: '开源项目', slug: 'opensource', icon: '📦', color: '#10b981', sortOrder: 2 },
  { id: 'cat3', name: '融资动态', slug: 'funding', icon: '💰', color: '#f59e0b', sortOrder: 3 },
  { id: 'cat4', name: 'AI工具', slug: 'tools', icon: '🛠️', color: '#8b5cf6', sortOrder: 4 },
  { id: 'cat5', name: '学术研究', slug: 'research', icon: '🔬', color: '#ec4899', sortOrder: 5 },
  { id: 'cat6', name: '公司动态', slug: 'company', icon: '🏢', color: '#06b6d4', sortOrder: 6 },
  { id: 'cat7', name: '教程指南', slug: 'tutorial', icon: '📚', color: '#f97316', sortOrder: 7 },
  { id: 'cat8', name: '政策法规', slug: 'policy', icon: '⚖️', color: '#78716c', sortOrder: 8 },
];

let sources: Source[] = [
  {
    id: 'src1', name: '36氪 AI频道', url: 'https://36kr.com/information/AI/', type: 'website',
    description: '36氪 AI 频道资讯', isEnabled: true, priority: 10,
    status: 'active', createdAt: now, updatedAt: now,
  },
  {
    id: 'src2', name: '量子位', url: 'https://www.qbitai.com/', type: 'website',
    description: '关注 AI 和前沿科技', isEnabled: true, priority: 8,
    status: 'active', createdAt: now, updatedAt: now,
  },
  {
    id: 'src3', name: '机器之心', url: 'https://www.jiqizhixin.com/', type: 'website',
    description: '专业 AI 技术媒体', isEnabled: true, priority: 7,
    status: 'active', createdAt: now, updatedAt: now,
  },
];

let articles: Article[] = [
  {
    id: 'art1', rawArticleId: 'raw1',
    title: 'GPT-5 正式发布：多模态能力大幅提升，支持长文本推理',
    summary: 'OpenAI 今日正式发布 GPT-5 模型，在多模态理解、代码生成和复杂推理方面取得重大突破。新模型支持 100K token 的上下文窗口，在 MMLU、HumanEval 等基准测试中刷新纪录。此外，GPT-5 还引入了实时联网搜索能力，可以获取最新信息进行回答。',
    sourceName: '量子位', sourceUrl: 'https://qbitai.com/',
    categoryId: 'cat1', isPinned: true, isFeatured: true,
    publishedAt: now, createdAt: now, updatedAt: now,
  },
  {
    id: 'art2', rawArticleId: 'raw2',
    title: 'Meta 开源 LLaMA 4：参数规模达万亿级别，性能对标闭源模型',
    summary: 'Meta 发布 LLaMA 4 开源大模型，采用 MoE（混合专家）架构，总参数量超过 1 万亿，但每次推理只激活约 130 亿参数。多项基准测试超越 GPT-4，在代码生成、数学推理、多语言理解等方面表现尤为突出。',
    sourceName: '机器之心', sourceUrl: 'https://jiqizhixin.com/',
    categoryId: 'cat2', isPinned: false, isFeatured: true,
    publishedAt: now, createdAt: now, updatedAt: now,
  },
  {
    id: 'art3', rawArticleId: 'raw3',
    title: '智谱 AI 完成 B+ 轮融资，估值突破 200 亿人民币',
    summary: '国内大模型公司智谱 AI 宣布完成 B+ 轮融资，由美团、小米、腾讯等领投，估值达到 200 亿元人民币。本轮融资将主要用于 GLM 系列模型的研发以及行业解决方案的落地。',
    sourceName: '36氪', sourceUrl: 'https://36kr.com/',
    categoryId: 'cat3', isPinned: false, isFeatured: false,
    publishedAt: now, createdAt: now, updatedAt: now,
  },
  {
    id: 'art4', rawArticleId: 'raw4',
    title: 'Cursor 发布 v2.0：集成 Claude 4，编程体验再升级',
    summary: 'AI 编程工具 Cursor 发布 2.0 版本，新增多文件编辑、智能调试、代码审查等功能。集成 Anthropic 最新 Claude 4 模型后，开发者反馈编程效率平均提升 40%以上，已成为最受欢迎的 AI IDE。',
    sourceName: '机器之心', sourceUrl: 'https://jiqizhixin.com/',
    categoryId: 'cat4', isPinned: false, isFeatured: false,
    publishedAt: now, createdAt: now, updatedAt: now,
  },
  {
    id: 'art5', rawArticleId: 'raw5',
    title: 'Google DeepMind 在 Nature 发文：AlphaFold 3 成功预测所有生物分子结构',
    summary: 'Google DeepMind 的 AlphaFold 3 研究成果发表于 Nature 杂志，成功预测了几乎所有已知生物分子的三维结构，包括蛋白质-DNA 复合物、抗体等。这一突破将加速药物研发和新材料发现进程。',
    sourceName: '量子位', sourceUrl: 'https://qbitai.com/',
    categoryId: 'cat5', isPinned: false, isFeatured: false,
    publishedAt: now, createdAt: now, updatedAt: now,
  },
  {
    id: 'art6', rawArticleId: 'raw6',
    title: '英伟达发布 H2000 芯片：专为 AI 训练优化，性能提升 3 倍',
    summary: '英伟达发布新一代 AI 芯片 H2000，采用全新 Blackwell Ultra 架构，FP8 性能较前代 H100 提升 300%，功耗降低 40%。支持单卡 192GB HBM3e 显存，专为大规模 LLM 训练和推理优化设计。',
    sourceName: '36氪', sourceUrl: 'https://36kr.com/',
    categoryId: 'cat6', isPinned: false, isFeatured: false,
    publishedAt: now, createdAt: now, updatedAt: now,
  },
  {
    id: 'art7', rawArticleId: 'raw7',
    title: '从零开始构建 RAG 应用：完整教程（含代码示例）',
    summary: '本文详细介绍如何使用 LangChain 和 OpenAI API 从零构建检索增强生成(RAG)应用，涵盖文档处理、向量存储、问答系统等全流程。附完整 Python 代码示例和 Docker 部署方案。',
    sourceName: 'AI工具集', sourceUrl: 'https://ai-toolbox.dev',
    categoryId: 'cat7', isPinned: false, isFeatured: false,
    publishedAt: new Date(Date.now() - 86400000).toISOString(), createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'art8', rawArticleId: 'raw8',
    title: '欧盟《AI法案》正式生效：全球首部综合性 AI 监管法律',
    summary: '欧盟《人工智能法案》今日正式生效，成为全球第一部针对 AI 的综合性监管法律。法案对高风险 AI 系统提出严格要求，包括透明度义务、风险评估、人工监督等条款，违规企业最高可面临全球营收 6%的罚款。',
    sourceName: '财新网', sourceUrl: 'https://caixin.com/',
    categoryId: 'cat8', isPinned: false, isFeatured: false,
    publishedAt: new Date(Date.now() - 172800000).toISOString(), createdAt: new Date(Date.now() - 172800000).toISOString(), updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

let rawArticles: RawArticle[] = [];
let crawlLogs: CrawlLog[] = [];

// ==================== Categories ====================
export function getCategories(): Category[] {
  return categories;
}

// ==================== Sources ====================
export function getSources(): Source[] {
  return sources;
}

export function getSource(id: string): Source | undefined {
  return sources.find(s => s.id === id);
}

export function createSource(data: Omit<Source, 'id' | 'createdAt' | 'updatedAt'>): Source {
  const newSource: Source = {
    ...data,
    id: `src${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  sources.push(newSource);
  return newSource;
}

export function updateSource(id: string, data: Partial<Source>): Source | null {
  const index = sources.findIndex(s => s.id === id);
  if (index === -1) return null;
  sources[index] = { ...sources[index], ...data, updatedAt: new Date().toISOString() };
  return sources[index];
}

export function deleteSource(id: string): boolean {
  const len = sources.length;
  sources = sources.filter(s => s.id !== id);
  return sources.length < len;
}

// ==================== Raw Articles (待审核) ====================
export function getRawArticles(status?: string): RawArticle[] {
  let result = [...rawArticles];
  if (status) {
    result = result.filter(a => a.status === status);
  }
  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getRawArticle(id: string): RawArticle | undefined {
  return rawArticles.find(a => a.id === id);
}

export function createRawArticle(data: Omit<RawArticle, 'id' | 'createdAt' | 'updatedAt'>): RawArticle {
  const newArticle: RawArticle = {
    ...data,
    id: `raw${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  rawArticles.push(newArticle);
  return newArticle;
}

export function updateRawArticle(id: string, data: Partial<RawArticle>): RawArticle | null {
  const index = rawArticles.findIndex(a => a.id === id);
  if (index === -1) return null;
  rawArticles[index] = { ...rawArticles[index], ...data, updatedAt: new Date().toISOString() };
  return rawArticles[index];
}

export function deleteRawArticle(id: string): boolean {
  const len = rawArticles.length;
  rawArticles = rawArticles.filter(a => a.id !== id);
  return rawArticles.length < len;
}

// ==================== Articles (已发布) ====================
export function getArticles(options?: { category?: string; search?: string; pinned?: boolean }): Article[] {
  let result = [...articles];

  if (options?.category && options.category !== 'all') {
    result = result.filter(a => a.categoryId === options.category);
  }

  if (options?.search) {
    const q = options.search.toLowerCase();
    result = result.filter(a =>
      a.title.toLowerCase().includes(q) || (a.summary?.toLowerCase().includes(q))
    );
  }

  if (options?.pinned !== undefined) {
    result = result.filter(a => a.isPinned === options.pinned);
  }

  // 置顶排前面，然后按时间倒序
  return result.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}

export function getArticle(id: string): Article | undefined {
  return articles.find(a => a.id === id);
}

export function publishArticle(rawArticle: RawArticle, opts?: { categoryId?: string }): Article {
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
  const source = sources.find(s => s.id === rawArticle.sourceId);
  if (source) {
    newArticle.sourceName = source.name;
    newArticle.sourceUrl = source.url;
  }

  articles.push(newArticle);

  // 更新原始文章状态
  updateRawArticle(rawArticle.id, { status: 'published' });

  return newArticle;
}

export function updateArticle(id: string, data: Partial<Article>): Article | null {
  const index = articles.findIndex(a => a.id === id);
  if (index === -1) return null;
  articles[index] = { ...articles[index], ...data, updatedAt: new Date().toISOString() };
  return articles[index];
}

export function deleteArticle(id: string): boolean {
  const len = articles.length;
  articles = articles.filter(a => a.id !== id);
  return articles.length < len;
}

// ==================== Crawl Logs ====================
export function getCrawlLogs(limit?: number): CrawlLog[] {
  let result = [...crawlLogs].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  if (limit) result = result.slice(0, limit);
  return result;
}

export function createCrawlLog(data: Omit<CrawlLog, 'id'>): CrawlLog {
  const newLog: CrawlLog = { ...data, id: `log${Date.now()}` };
  crawlLogs.unshift(newLog);
  return newLog;
}

export function updateCrawlLog(id: string, data: Partial<CrawlLog>): CrawlLog | null {
  const index = crawlLogs.findIndex(l => l.id === id);
  if (index === -1) return null;
  crawlLogs[index] = { ...crawlLogs[index], ...data };
  return crawlLogs[index];
}

// ==================== Stats ====================
export function getStats() {
  const allArticles = getArticles();
  const pending = getRawArticles('pending');
  const allSources = getSources();
  const allCategories = getCategories();

  return {
    totalArticles: allArticles.length,
    totalPending: pending.length,
    totalSources: allSources.length,
    totalCategories: allCategories.length,
    recentArticles: allArticles.slice(0, 5),
    categoryCount: allCategories.map(cat => ({
      ...cat,
      _count: { articles: allArticles.filter(a => a.categoryId === cat.id).length },
    })),
  };
}
