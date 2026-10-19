import React, { useEffect, useState } from 'react';
import { postService } from '../services/postService';

export default function PostDetailModal({ post, onClose }) {
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchComments() {
      try {
        setLoadingComments(true);
        const data = await postService.getComments(post.id);
        if (isMounted) setComments(data.comments || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoadingComments(false);
      }
    }

    if (post?.id) {
      fetchComments();
    }
    return () => {
      isMounted = false;
    };
  }, [post.id]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{post.title}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <p className="full-body-text">{post.body}</p>

          <hr className="divider" />
          <h4 className="comment-heading">Comments</h4>

          {loadingComments ? (
            <p className="text-muted">Đang tải bình luận...</p>
          ) : comments.length === 0 ? (
            <p className="text-muted">Chưa có bình luận nào.</p>
          ) : (
            <ul className="comment-list">
              {comments.map((c) => (
                <li key={c.id} className="comment-item">
                  <strong>@{c.user?.username || 'user'}: </strong>
                  <span>{c.body}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}