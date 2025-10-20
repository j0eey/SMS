// src/pages/admin/PlatformsPage.tsx
import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  getPlatforms,
  searchPlatforms,
  createPlatform,
  updatePlatform,
  deletePlatform,
  type PlatformRecord,
} from "../../api/platforms";
import { getCategories } from "../../api/categories";
import toast from "react-hot-toast";

type PlatformStatus = "active" | "inactive";

// Extend the backend record to tolerate both `imageUrl` and older `image`
type LocalPlatform = PlatformRecord & { imageUrl?: string };

interface Category {
  _id: string;
  name: string;
  description?: string;
  status: "active" | "inactive";
  image?: string;
}

// DTO for form state
interface PlatformDTO {
  name: string;
  description?: string;
  status: PlatformStatus;
  categoryId: string;
  image?: File | null; // only used in UI
}

export default function PlatformsPage() {
  const [platforms, setPlatforms] = useState<LocalPlatform[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Search + pagination (same behavior as CategoriesPage: search disables pagination)
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlatform, setNewPlatform] = useState<PlatformDTO>({
    name: "",
    description: "",
    categoryId: "",
    status: "active",
    image: null,
  });
  const [newPreview, setNewPreview] = useState<string | null>(null);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPlatform, setEditPlatform] = useState<(PlatformDTO & { _id: string }) | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [editExistingUrl, setEditExistingUrl] = useState<string>("");

  // Derived: are we searching?
  const isSearching = useMemo(() => searchTerm.trim().length > 0, [searchTerm]);

  useEffect(() => {
    if (isSearching) {
      handleSearch(searchTerm);
    } else {
      fetchPlatforms(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, isSearching, searchTerm]);

  const fetchPlatforms = async (pageNum: number) => {
    setLoading(true);
    try {
      const [plat, cat] = await Promise.all([
        getPlatforms(pageNum, pageSize),
        getCategories(), // expects { items: Category[] }
      ]);
      setPlatforms(Array.isArray(plat.items) ? (plat.items as LocalPlatform[]) : []);
      setCategories(Array.isArray(cat?.items) ? cat.items : []);
      setTotalPages(Math.max(1, Math.ceil((plat.total || 0) / pageSize)));
    } catch {
      toast.error("Failed to load platforms");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    const q = query.trim();
    if (!q) {
      setPage(1);
      fetchPlatforms(1);
      return;
    }
    setLoading(true);
    try {
      const results = await searchPlatforms(q);
      setPlatforms(Array.isArray(results) ? (results as LocalPlatform[]) : []);
      setTotalPages(1); // search results are not paginated (same pattern as Categories)
      setPage(1);
    } catch {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  // Helpers
  const getCategoryName = (categoryId: LocalPlatform["categoryId"]) => {
    if (typeof categoryId === "object" && categoryId && "name" in categoryId) {
      // populated object from backend search
      return (categoryId as { _id: string; name: string }).name;
    }
    // string id → resolve from categories list
    return categories.find((c) => c._id === categoryId)?.name || "Unknown";
  };

  const getPlatformImageUrl = (p: LocalPlatform) => {
    // Prefer imageUrl (backend now returns full URL), fallback to legacy `image`
    return (p as any).imageUrl || (p as any).image || "";
  };

  const resetNewForm = () => {
    setNewPlatform({
      name: "",
      description: "",
      categoryId: "",
      status: "active",
      image: null,
    });
    if (newPreview) {
      URL.revokeObjectURL(newPreview);
    }
    setNewPreview(null);
  };

  // Create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlatform.name || !newPlatform.categoryId) {
      return toast.error("Please fill name and category");
    }
    try {
      const formData = new FormData();
      formData.append("name", newPlatform.name);
      formData.append("description", newPlatform.description || "");
      formData.append("categoryId", newPlatform.categoryId);
      formData.append("status", newPlatform.status);
      if (newPlatform.image) formData.append("image", newPlatform.image);

      await createPlatform(formData);
      toast.success("Platform created");
      setShowCreateModal(false);
      resetNewForm();
      // refresh
      if (isSearching) {
        handleSearch(searchTerm);
      } else {
        fetchPlatforms(page);
      }
    } catch {
      toast.error("Failed to create platform");
    }
  };

  // Edit
  const handleEdit = (platform: LocalPlatform) => {
    setEditPlatform({
      _id: platform._id,
      name: platform.name,
      description: platform.description || "",
      status: platform.status,
      categoryId:
        typeof platform.categoryId === "object"
          ? (platform.categoryId as any)._id
          : (platform.categoryId as string),
      image: null,
    });
    setEditPreview(null);
    setEditExistingUrl(getPlatformImageUrl(platform));
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPlatform) return;
    try {
      const formData = new FormData();
      formData.append("name", editPlatform.name);
      formData.append("description", editPlatform.description || "");
      formData.append("categoryId", editPlatform.categoryId);
      formData.append("status", editPlatform.status);
      if (editPlatform.image) formData.append("image", editPlatform.image);

      await updatePlatform(editPlatform._id, formData);
      toast.success("Platform updated");
      setShowEditModal(false);
      setEditPlatform(null);
      if (editPreview) URL.revokeObjectURL(editPreview);
      setEditPreview(null);
      setEditExistingUrl("");

      // refresh
      if (isSearching) {
        handleSearch(searchTerm);
      } else {
        fetchPlatforms(page);
      }
    } catch {
      toast.error("Failed to update platform");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this platform?")) return;
    try {
      await deletePlatform(id);
      toast.success("Platform deleted");
      if (isSearching) {
        handleSearch(searchTerm);
      } else {
        fetchPlatforms(page);
      }
    } catch {
      toast.error("Failed to delete platform");
    }
  };

  // File handlers (create)
  const onNewFileChange = (file?: File | null) => {
    // cleanup previous preview
    if (newPreview) URL.revokeObjectURL(newPreview);
    if (file) {
      setNewPlatform((prev) => ({ ...prev, image: file }));
      setNewPreview(URL.createObjectURL(file));
    } else {
      setNewPlatform((prev) => ({ ...prev, image: null }));
      setNewPreview(null);
    }
  };

  // File handlers (edit)
  const onEditFileChange = (file?: File | null) => {
    if (editPreview) URL.revokeObjectURL(editPreview);
    if (!editPlatform) return;
    if (file) {
      setEditPlatform({ ...editPlatform, image: file });
      setEditPreview(URL.createObjectURL(file));
    } else {
      setEditPlatform({ ...editPlatform, image: null });
      setEditPreview(null);
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Platforms</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Add Platform
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search platforms..."
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
                  <th className="py-2 px-4">Category</th>
                  <th className="py-2 px-4">Description</th>
                  <th className="py-2 px-4">Status</th>
                  <th className="py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {platforms.length > 0 ? (
                  platforms.map((p) => {
                    const img = getPlatformImageUrl(p);
                    return (
                      <tr key={p._id} className="border-t">
                        <td className="py-2 px-4">
                          {img ? (
                            <img
                              src={img}
                              alt={p.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <span className="text-gray-400">No Image</span>
                          )}
                        </td>
                        <td className="py-2 px-4">{p.name}</td>
                        <td className="py-2 px-4">{getCategoryName(p.categoryId)}</td>
                        <td className="py-2 px-4">{p.description || "-"}</td>
                        <td className="py-2 px-4">
                          <span
                            className={`px-3 py-1 rounded text-white ${
                              p.status === "active" ? "bg-green-500" : "bg-gray-500"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-2 px-4 space-x-2">
                          <button
                            onClick={() => handleEdit(p)}
                            className="px-3 py-1 rounded bg-blue-500 text-white"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="px-3 py-1 rounded bg-red-500 text-white"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-500">
                      No platforms found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination (disabled during search) */}
          {!isSearching && totalPages > 1 && (
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Add New Platform</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="text"
                placeholder="Platform name"
                value={newPlatform.name}
                onChange={(e) => setNewPlatform({ ...newPlatform, name: e.target.value })}
                className="w-full border px-3 py-2 rounded"
                required
              />

              <input
                type="text"
                placeholder="Description"
                value={newPlatform.description}
                onChange={(e) => setNewPlatform({ ...newPlatform, description: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />

              <select
                value={newPlatform.categoryId}
                onChange={(e) => setNewPlatform({ ...newPlatform, categoryId: e.target.value })}
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Image upload + preview */}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onNewFileChange(e.target.files?.[0] || null)}
                  className="w-full border px-3 py-2 rounded"
                />
                {(newPreview) && (
                  <div className="mt-2">
                    <img src={newPreview} alt="Preview" className="w-20 h-20 object-cover rounded" />
                  </div>
                )}
              </div>

              <select
                value={newPlatform.status}
                onChange={(e) =>
                  setNewPlatform({ ...newPlatform, status: e.target.value as PlatformStatus })
                }
                className="w-full border px-3 py-2 rounded"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetNewForm();
                  }}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editPlatform && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Edit Platform</h3>
            <form onSubmit={handleUpdate} className="space-y-3">
              <input
                type="text"
                value={editPlatform.name}
                onChange={(e) => setEditPlatform({ ...editPlatform, name: e.target.value })}
                className="w-full border px-3 py-2 rounded"
                required
              />

              {/* Existing image */}
              {editExistingUrl && !editPreview && (
                <div className="mt-1">
                  <img src={editExistingUrl} alt="Current" className="w-20 h-20 object-cover rounded" />
                </div>
              )}

              {/* New selected preview */}
              {editPreview && (
                <div className="mt-1">
                  <img src={editPreview} alt="Preview" className="w-20 h-20 object-cover rounded" />
                </div>
              )}

              <input
                type="text"
                value={editPlatform.description || ""}
                onChange={(e) => setEditPlatform({ ...editPlatform, description: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />

              <select
                value={editPlatform.categoryId}
                onChange={(e) => setEditPlatform({ ...editPlatform, categoryId: e.target.value })}
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => onEditFileChange(e.target.files?.[0] || null)}
                className="w-full border px-3 py-2 rounded"
              />

              <select
                value={editPlatform.status}
                onChange={(e) => setEditPlatform({ ...editPlatform, status: e.target.value as PlatformStatus })}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    if (editPreview) URL.revokeObjectURL(editPreview);
                    setEditPreview(null);
                    setEditExistingUrl("");
                    setEditPlatform(null);
                  }}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
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