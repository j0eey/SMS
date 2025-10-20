import api from "./axios";

export interface CategoryPayload {
  name: string;
  description?: string;
  status: "active" | "inactive";
  image?: File | null; // ✅ Add optional image field
}

// ✅ Get all categories
export async function getCategories() {
  const res = await api.get("/admin/categories");
  return res.data;
}

// ✅ Create category (supports image upload)
export async function createCategory(category: CategoryPayload) {
  const formData = new FormData();
  formData.append("name", category.name);
  if (category.description) formData.append("description", category.description);
  formData.append("status", category.status);
  if (category.image) formData.append("image", category.image);

  const res = await api.post("/admin/categories", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// ✅ Update category (supports image upload)
export async function updateCategory(id: string, category: CategoryPayload) {
  const formData = new FormData();
  formData.append("name", category.name);
  if (category.description) formData.append("description", category.description);
  formData.append("status", category.status);
  if (category.image) formData.append("image", category.image);

  const res = await api.put(`/admin/categories/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// ✅ Delete category
export async function deleteCategory(id: string) {
  const res = await api.delete(`/admin/categories/${id}`);
  return res.data;
}