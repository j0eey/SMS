import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../api/categories";
import toast from "react-hot-toast";

interface Category {
  _id: string;
  name: string;
  description?: string;
  status: "active" | "inactive";
  image?: File | null;
  imageUrl?: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCategory, setNewCategory] = useState<Omit<Category, "_id">>({
    name: "",
    description: "",
    status: "active",
    image: null,
  });

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
  setLoading(true);
  try {
    const data = await getCategories();
    // ✅ Normalize: handle if backend sends object or array
    const list = Array.isArray(data) ? data : data.items || [];
    setCategories(list);
  } catch {
    toast.error("Failed to load categories");
  } finally {
    setLoading(false);
  }
};

  // ✅ Create category
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory({
        name: newCategory.name,
        description: newCategory.description,
        status: newCategory.status,
        image: newCategory.image || null,
      });
      toast.success("Category created");
      setShowCreateModal(false);
      resetNewForm();
      fetchCategories();
    } catch {
      toast.error("Failed to create category");
    }
  };

  // ✅ Edit category
  const handleEdit = (category: Category) => {
    setEditCategory({ ...category, image: null });
    setShowEditModal(true);
  };

  // ✅ Update category
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCategory) return;
    try {
      await updateCategory(editCategory._id, {
        name: editCategory.name,
        description: editCategory.description,
        status: editCategory.status,
        image: editCategory.image || null,
      });
      toast.success("Category updated");
      setShowEditModal(false);
      setEditCategory(null);
      fetchCategories();
    } catch {
      toast.error("Failed to update category");
    }
  };

  // ✅ Delete category
  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this category (and related platforms & services)?")) return;
    try {
      await deleteCategory(id);
      toast.success("Category deleted");
      fetchCategories();
    } catch {
      toast.error("Failed to delete category");
    }
  };

  const resetNewForm = () => {
    setNewCategory({ name: "", description: "", status: "active", image: null });
  };

  // ✅ Search + Pagination
  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startIndex = (page - 1) * pageSize;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(filteredCategories.length / pageSize);

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Categories</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Add Category
        </button>
      </div>

      {/* ✅ Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="py-2 px-4">Image</th>
                  <th className="py-2 px-4">Name</th>
                  <th className="py-2 px-4">Description</th>
                  <th className="py-2 px-4">Status</th>
                  <th className="py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCategories.length > 0 ? (
                  paginatedCategories.map((c) => (
                    <tr key={c._id} className="border-t">
                      <td className="py-2 px-4">
                        {c.imageUrl ? (
                          <img
                            src={c.imageUrl}
                            alt={c.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                            —
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-4">{c.name}</td>
                      <td className="py-2 px-4">{c.description || "-"}</td>
                      <td className="py-2 px-4">
                        <span
                          className={`px-3 py-1 rounded text-white ${
                            c.status === "active" ? "bg-green-500" : "bg-gray-500"
                          }`}
                        >
                          {c.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-2 px-4 space-x-2">
                        <button
                          onClick={() => handleEdit(c)}
                          className="px-3 py-1 rounded bg-blue-500 text-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="px-3 py-1 rounded bg-red-500 text-white"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500">
                      No categories found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ✅ Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-4 space-x-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* ✅ Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Add New Category</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="text"
                placeholder="Category name"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
                required
              />
              <textarea
                placeholder="Description"
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, description: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    image: e.target.files?.[0] || null,
                  })
                }
                className="w-full border px-3 py-2 rounded"
              />
              {newCategory.image && (
                <img
                  src={URL.createObjectURL(newCategory.image)}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded"
                />
              )}
              <select
                value={newCategory.status}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    status: e.target.value as "active" | "inactive",
                  })
                }
                className="w-full border px-3 py-2 rounded"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Edit Modal */}
      {showEditModal && editCategory && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Edit Category</h3>
            <form onSubmit={handleUpdate} className="space-y-3">
              <input
                type="text"
                value={editCategory.name}
                onChange={(e) =>
                  setEditCategory({ ...editCategory, name: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
                required
              />
              <textarea
                value={editCategory.description}
                onChange={(e) =>
                  setEditCategory({
                    ...editCategory,
                    description: e.target.value,
                  })
                }
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setEditCategory({
                    ...editCategory,
                    image: e.target.files?.[0] || null,
                  })
                }
                className="w-full border px-3 py-2 rounded"
              />
              {(editCategory.image ||
                editCategory.imageUrl) && (
                <img
                  src={
                    editCategory.image
                      ? URL.createObjectURL(editCategory.image)
                      : editCategory.imageUrl!
                  }
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded"
                />
              )}
              <select
                value={editCategory.status}
                onChange={(e) =>
                  setEditCategory({
                    ...editCategory,
                    status: e.target.value as "active" | "inactive",
                  })
                }
                className="w-full border px-3 py-2 rounded"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}