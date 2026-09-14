import React, { useState, useEffect } from 'react';

/**
 * GatedContent Component
 * 
 * Renders a placeholder initially (which is all AI crawlers will see because they don't execute JS).
 * On mount, fetches the real content from the backend and swaps it in.
 * 
 * @param {string} id - The identifier for the content block to fetch.
 * @param {string|React.ReactNode} placeholder - The decoy content to show to crawlers.
 */
export default function GatedContent({ id, placeholder }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // We only fetch on the client side.
    let isMounted = true;
    const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
    
    fetch(`${API_BASE}/api/content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          if (data.success && data.html) {
            setContent(data.html);
          } else {
            setError(true);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch gated content:', err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // If we have fetched the real content, render it safely.
  if (content && !loading) {
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  }

  // If still loading, or if the fetch failed (e.g. no JS executed by a bot, or network error),
  // we show the placeholder.
  return (
    <div className="gated-placeholder">
      {typeof placeholder === 'string' ? (
        <div dangerouslySetInnerHTML={{ __html: placeholder }} />
      ) : (
        placeholder
      )}
    </div>
  );
}
