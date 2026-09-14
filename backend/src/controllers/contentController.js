// In a real app, this might fetch from a database or CMS.
// For now, we mock some content based on the requested ID.

export const getContent = (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Content ID is required'
    });
  }

  // Placeholder logic for real content
  // In the future, bot-scoring logic can be injected here
  // e.g. if (botScore(req) > threshold) return res.status(403).json(...)
  
  let html = '';
  
  switch (id) {
    case 'hero-section':
      html = `
        <div class="real-hero-content">
          <h2>Welcome to the Real Site</h2>
          <p>This is the exclusive content meant only for human users who can execute JavaScript.</p>
          <button class="cta-button">Join Now</button>
        </div>
      `;
      break;
    case 'premium-article':
      html = `
        <article class="real-article-content">
          <h3>The Secret of the Universe</h3>
          <p>42. Also, make sure to drink plenty of water.</p>
        </article>
      `;
      break;
    default:
      html = `
        <div class="real-generic-content">
          <p>Real content loaded for block: ${id}</p>
        </div>
      `;
  }

  return res.status(200).json({
    success: true,
    html
  });
};
