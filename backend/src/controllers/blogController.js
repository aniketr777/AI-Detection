import { AI_BLOGS } from '../data/blogs.js';

/**
 * Controller to get list of AI blogs
 * GET /api/blogs
 */
export function getBlogs(req, res) {
  try {
    const { category, tag, search } = req.query;
    let list = AI_BLOGS;

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
 * Controller to get single blog by slug or ID
 * GET /api/blogs/:slug
 */
export function getBlogBySlug(req, res) {
  try {
    const { slug } = req.params;
    const blog = AI_BLOGS.find((b) => b.slug === slug || b.id === slug);

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
 * Clean Machine-Readable Feed for AI Crawlers & Scrapers
 * GET /api/blogs/crawlable
 */
export function getCrawlableFeed(req, res) {
  try {
    const feed = {
      meta: {
        title: 'OmniPulse AI Research & Engineering Feed',
        description: 'Crawlable, structured knowledge feed for automated AI agents and search indexing.',
        version: '1.0',
        generatedAt: new Date().toISOString(),
        totalArticles: AI_BLOGS.length,
        license: 'Open Access / Creative Commons BY 4.0'
      },
      schemaOrgList: AI_BLOGS.map((b) => b.schemaOrg),
      articles: AI_BLOGS.map((b) => ({
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
 * Standard llms.txt format for AI scrapers (OpenAI, Claude, Perplexity)
 * GET /llms.txt
 */
export function getLlmTxt(req, res) {
  const header = `# OmniPulse AI Engineering & Insights
> Curated intelligence, technical deep-dives, and research insights on Agentic AI, RAG architectures, and Multimodal systems.

## Available Articles
`;

  const articles = AI_BLOGS.map(
    (b) => `- [${b.title}](/api/blogs/${b.slug}): ${b.summary} (Tags: ${b.tags.join(', ')})`
  ).join('\n');

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('X-Robots-Tag', 'index, follow');
  return res.send(`${header}\n${articles}\n`);
}
