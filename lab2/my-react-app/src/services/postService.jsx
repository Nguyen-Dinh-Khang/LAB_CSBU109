const BASE_URL = 'https://dummyjson.com/posts';

export const postService = {
  // Lấy danh sách phân trang (limit=10, skip)
  async getPosts(limit = 10, skip = 0) {
    const res = await fetch(`${BASE_URL}?limit=${limit}&skip=${skip}`);
    if (!res.ok) throw new Error('Không thể tải danh sách bài viết');
    return res.json();
  },

  // Tìm kiếm bài viết theo từ khóa
  async searchPosts(query) {
    const res = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Tìm kiếm bài viết thất bại');
    return res.json();
  },

  // Lấy danh sách bình luận của bài viết
  async getComments(postId) {
    const res = await fetch(`${BASE_URL}/${postId}/comments`);
    if (!res.ok) throw new Error('Không thể tải bình luận');
    return res.json();
  },

  // Thêm bài viết mới
  async addPost(newPost) {
    const res = await fetch(`${BASE_URL}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newPost,
        userId: 1, // DummyJSON yêu cầu userId
      }),
    });
    if (!res.ok) throw new Error('Không thể thêm bài viết');
    return res.json();
  },

  // Xóa bài viết
  async deletePost(id) {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Không thể xóa bài viết');
    return res.json();
  },
};