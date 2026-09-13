import { CELEBRITIES } from '../data/celebrities.js';

/**
 * Controller to fetch list of celebrities with optional category & search filter.
 * GET /api/celebs
 */
export function getCelebrities(req, res) {
  try {
    const { category, search } = req.query;
    let list = CELEBRITIES;

    if (category && category !== 'All') {
      list = list.filter(
        (c) => c.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.role.toLowerCase().includes(q) ||
          c.nationality.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return res.json({
      success: true,
      total: list.length,
      celebrities: list
    });
  } catch (error) {
    console.error('Error in getCelebrities:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
