const BASE_URL = "https://dummyjson.com";

// Lấy danh sách sản phẩm phân trang (limit=12)
export async function getProducts(limit = 12, skip = 0) {
  const res = await fetch(`${BASE_URL}/products?limit=${limit}&skip=${skip}`);
  if (!res.ok) {
    throw new Error("Không thể tải danh sách sản phẩm!");
  }
  return res.json();
}

// Lấy chi tiết một sản phẩm theo id
export async function getProductById(id) {
  const res = await fetch(`${BASE_URL}/products/${id}`);
  if (!res.ok) {
    throw new Error("Không thể tải chi tiết sản phẩm!");
  }
  return res.json();
}