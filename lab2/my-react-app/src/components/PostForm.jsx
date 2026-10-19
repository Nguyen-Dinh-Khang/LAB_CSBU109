import React, { useState } from 'react';

export default function PostForm({ onAddPost, isSubmitting }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      alert('Vui lòng nhập đầy đủ tiêu đề và nội dung!');
      return;
    }

    onAddPost({
      title: title.trim(),
      body: body.trim(),
    });

    setTitle('');
    setBody('');
  };

  return (
    <div className="card new-post-card">
      <h3 className="card-title">New post</h3>
      <form onSubmit={handleSubmit} className="post-form">
        <input
          type="text"
          className="form-control"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSubmitting}
          required
        />
        <textarea
          className="form-control textarea"
          placeholder="Body"
          rows="5"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={isSubmitting}
          required
        />
        <div>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add post'}
          </button>
        </div>
      </form>
    </div>
  );
}