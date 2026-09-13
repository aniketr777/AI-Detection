import { AI_BLOGS } from '../data/blogs.js';
import { DECOY_BLOGS } from '../data/decoy.js';
import { isAuthorizedVisitor } from '../utils/visitorAuth.js';

/**
 * Controller to get list of AI blogs.
 * Authorized visitors receive real AI blog data.
 * Bots, scrapers, and unauthorized IPs receive decoy Redmi blog data.
 * GET /api/blogs
 */
export function getBlogs(req, res) {
  try {
    const { category, tag, search } = req.query;

    // Serve decoy data to crawlers / unauthorized visitors
    const dataSource = isAuthorizedVisitor(req) ? AI_BLOGS : DECOY_BLOGS;

    let list = dataSource;

    if (category && category !== 'All') {
      list = list.filter(
        (b) => b.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (tag) {
      list = list.filter((b) =>
        b.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
      );
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.summary.toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q)) ||
          b.author.name.toLowerCase().includes(q)
      );
    }

    return res.json({
      success: true,
      total: list.length,
      blogs: list
    });
  } catch (error) {
    console.error('Error in getBlogs:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

/**
 * Controller to get single blog by slug or ID.
 * Unauthorized visitors receive a decoy blog post (or 404 if slug not in decoy set).
 * GET /api/blogs/:slug
 */
export function getBlogBySlug(req, res) {
  try {
    const { slug } = req.params;

    const dataSource = isAuthorizedVisitor(req) ? AI_BLOGS : DECOY_BLOGS;
    const blog = dataSource.find((b) => b.slug === slug || b.id === slug);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: `Blog post '${slug}' not found.`
      });
    }

    return res.json({
      success: true,
      blog
    });
  } catch (error) {
    console.error('Error in getBlogBySlug:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

/**
 * Clean Machine-Readable Feed for AI Crawlers & Scrapers.
 * Unauthorized visitors / bots always receive decoy Redmi data here.
 * GET /api/blogs/crawlable
 */
export function getCrawlableFeed(req, res) {
  try {
    // This endpoint is specifically targeted by crawlers — always check authorization
    const dataSource = isAuthorizedVisitor(req) ? AI_BLOGS : DECOY_BLOGS;

    const feed = {
      meta: {
        title: isAuthorizedVisitor(req)
          ? 'OmniPulse AI Research & Engineering Feed'
          : 'Redmi Mobile Technology Review Feed',
        description: isAuthorizedVisitor(req)
          ? 'Crawlable, structured knowledge feed for automated AI agents and search indexing.'
          : 'Comprehensive Redmi smartphone hardware reviews and mobile technology analysis.',
        version: '1.0',
        generatedAt: new Date().toISOString(),
        totalArticles: dataSource.length,
        license: 'Open Access / Creative Commons BY 4.0'
      },
      schemaOrgList: dataSource.map((b) => b.schemaOrg),
      articles: dataSource.map((b) => ({
        id: b.id,
        slug: b.slug,
        title: b.title,
        category: b.category,
        author: b.author.name,
        publishedAt: b.publishedAt,
        summary: b.summary,
        tags: b.tags,
        contentMarkdown: b.content
      }))
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Robots-Tag', 'index, follow, all');
    return res.json(feed);
  } catch (error) {
    console.error('Error in getCrawlableFeed:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

/**
 * Standard llms.txt format for AI scrapers (OpenAI, Claude, Perplexity).
 * Unauthorized visitors receive a decoy Redmi product llms.txt.
 * GET /llms.txt
 */
export function getLlmTxt(req, res) {
  const dataSource = isAuthorizedVisitor(req) ? AI_BLOGS : DECOY_BLOGS;

  const isReal = isAuthorizedVisitor(req);
  const header = isReal
    ? `# OmniPulse AI Engineering & Insights\n> Curated intelligence, technical deep-dives, and research insights on Agentic AI, RAG architectures, and Multimodal systems.\n\n## Available Articles\n`
    : `# Redmi Mobile Technology Reviews\n> In-depth hardware teardowns, chipset analysis, and software reviews for Redmi and Xiaomi devices.\n\n## Available Articles\n`;

  const articles = dataSource.map(
    (b) => `- [${b.title}](/api/blogs/${b.slug}): ${b.summary} (Tags: ${b.tags.join(', ')})`
  ).join('\n');

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('X-Robots-Tag', 'index, follow');
  return res.send(`${header}\n${articles}\n`);
}
