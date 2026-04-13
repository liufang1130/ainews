import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('开始初始化数据...');

  // 创建分类
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'llm' },
      update: {},
      create: {
        name: '大模型发布',
        slug: 'llm',
        icon: '🤖',
        color: '#6366f1',
        sortOrder: 1,
        description: 'GPT、Claude、Gemini、Qwen等大模型更新',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'opensource' },
      update: {},
      create: {
        name: '开源项目与框架',
        slug: 'opensource',
        icon: '🔓',
        color: '#10b981',
        sortOrder: 2,
        description: 'LangChain、LlamaIndex、开源模型等',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'funding' },
      update: {},
      create: {
        name: '融资动态',
        slug: 'funding',
        icon: '💰',
        color: '#f59e0b',
        sortOrder: 3,
        description: 'AI公司融资、并购消息',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'tools' },
      update: {},
      create: {
        name: '工具与应用',
        slug: 'tools',
        icon: '🛠️',
        color: '#8b5cf6',
        sortOrder: 4,
        description: '新产品、新功能、实用工具',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'research' },
      update: {},
      create: {
        name: '行业报告与研究',
        slug: 'research',
        icon: '📊',
        color: '#06b6d4',
        sortOrder: 5,
        description: '论文、评测、市场报告',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'company' },
      update: {},
      create: {
        name: '公司动态',
        slug: 'company',
        icon: '🏢',
        color: '#ef4444',
        sortOrder: 6,
        description: '人事变动、战略调整、合作',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'tutorial' },
      update: {},
      create: {
        name: '教程与资源',
        slug: 'tutorial',
        icon: '🎓',
        color: '#84cc16',
        sortOrder: 7,
        description: '教程、课程、学习资料',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'policy' },
      update: {},
      create: {
        name: '政策与监管',
        slug: 'policy',
        icon: '🌍',
        color: '#f97316',
        sortOrder: 8,
        description: '法规、合规要求',
      },
    }),
  ]);

  console.log(`已创建 ${categories.length} 个分类`);

  // 创建信息源
  const sources = [
    {
      name: '量子位',
      url: 'https://www.qbitai.com/',
      type: 'website',
      description: 'AI领域头部科技媒体，专注AI技术报道和产业分析',
      config: JSON.stringify({}),
      priority: 10,
    },
    {
      name: '机器之心',
      url: 'https://www.jiqizhixin.com/',
      type: 'website',
      description: '专业技术媒体，深度技术报道和行业分析',
      config: JSON.stringify({}),
      priority: 9,
    },
    {
      name: '36氪 AI频道',
      url: 'https://36kr.com/channel/ai',
      type: 'website',
      description: '创投媒体，关注AI创业和投融资',
      config: JSON.stringify({}),
      priority: 8,
    },
    {
      name: 'Hacker News',
      url: 'https://news.ycombinator.com/',
      type: 'hackernews',
      description: '技术社区，热门技术讨论',
      config: JSON.stringify({}),
      priority: 5,
    },
  ];

  for (const source of sources) {
    const existing = await prisma.source.findFirst({ where: { url: source.url } });
    if (!existing) {
      await prisma.source.create({ data: source });
    }
  }

  console.log(`已创建 ${sources.length} 个信息源`);

  // 获取第一个source作为demo source
  const demoSource = await prisma.source.findFirst();

  // 创建示例文章
  const sampleArticles = [
    {
      title: 'OpenAI 发布 GPT-5：多模态能力全面升级',
      summary: 'OpenAI 正式推出 GPT-5 模型，在推理能力、代码生成、多模态理解等方面实现重大突破。新模型支持更长的上下文窗口，响应速度提升40%以上。',
      content: null,
      sourceName: '量子位',
      sourceUrl: 'https://www.qbitai.com/example/gpt5',
      categoryId: categories[0].id,
      tags: JSON.stringify(['GPT-5', 'OpenAI', '大模型']),
      coverImage: null,
      isPinned: true,
      publishedAt: new Date(),
    },
    {
      title: 'Meta 发布 Llama 4 开源大模型',
      summary: 'Meta 宣布 Llama 4 系列正式开源，包含多个规格版本，从轻量级到超大规模均有覆盖。该模型在多项基准测试中接近或超越闭源模型表现。',
      content: null,
      sourceName: '机器之心',
      sourceUrl: 'https://www.jiqizhixin.com/example/llama4',
      categoryId: categories[1].id,
      tags: JSON.stringify(['Llama-4', 'Meta', '开源', 'LLM']),
      coverImage: null,
      isPinned: false,
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      title: '月之暗面完成 10 亿美元 B 轮融资',
      summary: '国内 AI 创业公司月之暗面宣布完成 10 亿美元 B 轮融资，由阿里巴巴、腾讯领投，投后估值达 50 亿美元。资金将用于 Kimi 大模型的研发和商业化。',
      content: null,
      sourceName: '36氪',
      sourceUrl: 'https://36kr.com/p/example/funding',
      categoryId: categories[2].id,
      tags: JSON.stringify(['融资', 'Kimi', '月之暗面']),
      coverImage: null,
      isPinned: false,
      publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
    {
      title: 'Cursor IDE 新增 Agent 功能：可自主完成复杂编程任务',
      summary: '热门 AI 编程工具 Cursor 发布重磅更新，新增 Agent 模式。用户只需描述需求，Agent 可自动规划、编写、调试完整功能模块，大幅提升开发效率。',
      content: null,
      sourceName: '量子位',
      sourceUrl: 'https://www.qbitai.com/example/cursor',
      categoryId: categories[3].id,
      tags: JSON.stringify(['Cursor', 'IDE', 'AI编程', 'Agent']),
      coverImage: null,
      isPinned: false,
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    },
    {
      title: 'Google DeepMind 发表 Nature 论文：AlphaFold 3 预测所有生物分子结构',
      summary: 'Google DeepMind 在 Nature 发表论文，介绍 AlphaFold 3 的最新突破。该模型不仅能预测蛋白质结构，还能准确模拟 DNA、RNA 与小分子的相互作用。',
      content: null,
      sourceName: '机器之心',
      sourceUrl: 'https://www.jiqizhixin.com/example/alphafold',
      categoryId: categories[4].id,
      tags: JSON.stringify(['DeepMind', 'AlphaFold', '论文', 'Nature']),
      coverImage: null,
      isPinned: true,
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
    {
      title: 'Anthropic 完成 20 亿美元融资，估值达 600 亿',
      summary: 'Claude 背后的公司 Anthropic 完成新一轮 20 亿美元融资，估值攀升至 600 亿美元。本轮融资将加速 Claude 模型迭代和企业级产品布局。',
      content: null,
      sourceName: '36氪',
      sourceUrl: 'https://36kr.com/p/example/anthropic',
      categoryId: categories[2].id,
      tags: JSON.stringify(['Anthropic', 'Claude', '融资']),
      coverImage: null,
      isPinned: false,
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      title: 'LangChain v1.0 正式发布：企业级 RAG 框架成熟',
      summary: 'LangChain 团队发布 v1.0 正式版，标志着 AI 应用开发框架进入成熟阶段。新版提供更强的 RAG 能力、更好的工具调用支持和完善的部署方案。',
      content: null,
      sourceName: 'Hacker News',
      sourceUrl: 'https://news.ycombinator.com/example/langchain',
      categoryId: categories[1].id,
      tags: JSON.stringify(['LangChain', 'RAG', 'v1.0', '框架']),
      coverImage: null,
      isPinned: false,
      publishedAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
    },
    {
      title: '苹果 WWDC 2026：Siri 全面升级为 Apple Intelligence Pro',
      summary: '在 WWDC 2026 上，苹果宣布 Siri 将全面升级为 Apple Intelligence Pro，基于自研大模型，支持跨设备深度协作和主动式智能服务。',
      content: null,
      sourceName: '量子位',
      sourceUrl: 'https://www.qbitai.com/example/apple',
      categoryId: categories[5].id,
      tags: JSON.stringify(['苹果', 'Siri', 'WWDC', 'Apple Intelligence']),
      coverImage: null,
      isPinned: false,
      publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    },
  ];

  for (const article of sampleArticles) {
    const rawArticle = await prisma.rawArticle.create({
      data: {
        sourceId: demoSource!.id,
        title: article.title,
        summary: article.summary,
        status: 'published',
        url: article.sourceUrl || '',
        fingerprint: `demo-${article.title}`,
        author: article.sourceName,
      },
    });

    await prisma.article.create({
      data: {
        ...article,
        rawArticleId: rawArticle.id,
      },
    });
  }

  console.log(`已创建 ${sampleArticles.length} 条示例文章`);
  console.log('✅ 数据初始化完成！');
}

main()
  .catch((e) => {
    console.error('数据初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
