import React from 'react';

export default function PostItem({ post, onViewDetail, onDelete }) {
  // DummyJSON có thể trả về reactions dạng object { likes, dislikes } hoặc số nguyên
  const likes = typeof post.reactions === 'object' ? (post.reactions?.likes ?? 0) : (post.reactions ?? 0);
  const dislikes = typeof post.reactions === 'object' ? (post.reactions?.dislikes ?? 0) : 0;

  return (
    <div className="card post-item-card">
      <h3 className="post-item-title">{post.title}</h3>

      {post.tags && post.tags.length > 0 && (
        <div className="post-tags">
          {post.tags.map((tag, idx) => (
            <span key={idx} className="tag-badge">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="post-reactions">
        <span>👍 {likes}</span>
        {dislikes > 0 && (
          <>
            <span className="dot-divider">·</span>
            <span>👎 {dislikes}</span>
          </>
        )}
      </div>

      <div className="post-actions">
        <button className="btn btn-secondary" onClick={() => onViewDetail(post)}>
          View
        </button>
        <button className="btn btn-danger" onClick={() => onDelete(post.id)}>
          Delete
        </button>
      </div>
    </div>
  );
}