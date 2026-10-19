import React, { useState, useEffect, useCallback } from 'react';
import { postService } from '../services/postService';
import { useDebounce } from '../hooks/useDebounce';
import PostForm from '../components/PostForm';
import SearchBar from '../components/SearchBar';
import PostItem from '../components/PostItem';
import PostDetailModal from '../components/PostDetailModal';
import Pagination from '../components/Pagination';
import '../styles/blog.css';

const LIMIT = 10;

export default function BlogManagerPage() {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // Debounce 400ms theo yêu cầu đề bài
  const debouncedSearch = useDebounce(searchQuery, 400);

  // Hàm load dữ liệu bài viết
  const fetchPostsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (debouncedSearch.trim()) {
        const data = await postService.searchPosts(debouncedSearch.trim());
        setPosts(data.posts || []);
        setTotal(data.total || 0);
      } else {
        const skip = (page - 1) * LIMIT;
        const data = await postService.getPosts(LIMIT, skip);
        setPosts(data.posts || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu!');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    fetchPostsData();
  }, [fetchPostsData]);

  // Reset về page 1 khi người dùng gõ tìm kiếm mới
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Xử lý Thêm mới (Cập nhật trực tiếp vào State)
  const handleAddPost = async (newPostData) => {
    setIsSubmitting(true);
    try {
      const createdPost = await postService.addPost(newPostData);
      // DummyJSON chỉ giả lập lưu -> Cập nhật trực tiếp lên đầu danh sách state
      setPosts((prevPosts) => [
        {
          ...createdPost,
          tags: ['new', 'story'],
          reactions: { likes: 0, dislikes: 0 },
        },
        ...prevPosts,
      ]);
      setTotal((prev) => prev + 1);
    } catch (err) {
      alert(err.message || 'Không thể tạo bài viết mới.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý Xóa (Có xác nhận & Cập nhật State)
  const handleDeletePost = async (id) => {
    const isConfirmed = window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?');
    if (!isConfirmed) return;

    try {
      await postService.deletePost(id);
      // Cập nhật loại bỏ bài viết khỏi danh sách state
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (err) {
      alert(err.message || 'Không thể xóa bài viết!');
    }
  };

  const totalPages = Math.ceil(total / LIMIT) || 1;

  return (
    <div className="page-wrapper">
      <div className="main-content">
        <h1 className="page-title">Mini Blog Manager</h1>

        {/* Form thêm mới */}
        <PostForm onAddPost={handleAddPost} isSubmitting={isSubmitting} />

        {/* Thanh Search */}
        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        {/* Thông báo lỗi */}
        {error && <div className="error-alert">{error}</div>}

        {/* Loading Indicator */}
        {loading ? (
          <div className="loading-spinner-wrapper">
            <div className="spinner"></div>
            <p>Loading posts...</p>
          </div>
        ) : (
          <>
            {posts.length === 0 ? (
              <div className="empty-message">No posts found.</div>
            ) : (
              <div className="post-list">
                {posts.map((post) => (
                  <PostItem
                    key={post.id}
                    post={post}
                    onViewDetail={setSelectedPost}
                    onDelete={handleDeletePost}
                  />
                ))}
              </div>
            )}

            {!debouncedSearch.trim() && (
              <Pagination
                page={page}
                totalPages={totalPages}
                onPrev={() => setPage((p) => Math.max(p - 1, 1))}
                onNext={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={loading}
              />
            )}
          </>
        )}

        {selectedPost && (
          <PostDetailModal
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
          />
        )}
      </div>
    </div>
  );
}