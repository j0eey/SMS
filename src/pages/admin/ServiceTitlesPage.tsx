import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  getServiceTitles,
  searchServiceTitles,
  createServiceTitle,
  updateServiceTitle,
  deleteServiceTitle,
} from "../../api/serviceTitles";
import type { ServiceTitle } from "../../api/serviceTitles";
import { getPlatforms } from "../../api/platforms";
import toast from "react-hot-toast";

interface Platform {
  _id: string;
  name: string;
}

interface ServiceTitleWithImage extends ServiceTitle {
  imageUrl?: string;
}

export default function ServiceTitlesPage() {
  const [titles, setTitles] = useState<ServiceTitleWithImage[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState<Omit<ServiceTitleWithImage, "_id" | "imageUrl">>({
    platformId: "",
    name: "",
    description: "",
    status: "active",
  });
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newPreview, setNewPreview] = useState<string | null>(null);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState<ServiceTitleWithImage | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (searchTerm) {
      handleSearch(searchTerm);
    } else {
      fetchTitles(page);
    }
  }, [page, searchTerm]);

  const fetchTitles = async (pageNum: number) => {
    setLoading(true);
    try {
      const data = await getServiceTitles(pageNum, pageSize);
      setTitles(data.items);
      setTotalPages(Math.ceil(data.total / pageSize));
      const p = await getPlatforms();
      setPlatforms(p.items);
    } catch {
      toast.error("Failed to load service titles");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query) {
      fetchTitles(1);
      setPage(1);
      return;
    }
    setLoading(true);
    try {
      const results = await searchServiceTitles(query);
      setTitles(results);
      setTotalPages(1); // search results are not paginated
      setPage(1);
    } catch {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("platformId", String(newTitle.platformId));
      formData.append("name", newTitle.name);
      formData.append("description", newTitle.description || "");
      formData.append("status", String(newTitle.status));
      if (newImageFile) {
        formData.append("image", newImageFile);
      }
      await createServiceTitle(formData);
      toast.success("Service title created");
      setShowCreateModal(false);
      resetNewForm();
      setNewImageFile(null);
      fetchTitles(page);
    } catch {
      toast.error("Failed to create service title");
    }
  };

  const handleEdit = (title: ServiceTitleWithImage) => {
    setEditTitle(title);
    setEditImageFile(null);
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle) return;
    try {
      const formData = new FormData();
      formData.append(
        "platformId",
        typeof editTitle.platformId === "string"
          ? editTitle.platformId
          : editTitle.platformId._id
      );
      formData.append("name", editTitle.name);
      formData.append("description", editTitle.description || "");
      formData.append("status", String(editTitle.status || "active"));
      if (editImageFile) {
        formData.append("image", editImageFile);
      }
      await updateServiceTitle(editTitle._id, formData);
      toast.success("Service title updated");
      setShowEditModal(false);
      setEditTitle(null);
      setEditImageFile(null);
      fetchTitles(page);
    } catch {
      toast.error("Failed to update service title");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this service title and its services?")) return;
    try {
      await deleteServiceTitle(id);
      toast.success("Service title deleted");
      fetchTitles(page);
    } catch {
      toast.error("Failed to delete service title");
    }
  };

  const resetNewForm = () => {
    setNewTitle({ platformId: "", name: "", description: "", status: "active" });
    setNewImageFile(null);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Service Titles</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Add Service Title
        </button>
      </div>

      {/* ✅ Search bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search service titles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
                  <th className="py-2 px-4">Platform</th>
                  <th className="py-2 px-4">Description</th>
                  <th className="py-2 px-4">Status</th>
                  <th className="py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {titles.length > 0 ? (
                  titles.map((t) => (
                    <tr key={t._id} className="border-t">
                      <td className="py-2 px-4">
                        {t.imageUrl ? (
                          <img
                            src={t.imageUrl}
                            alt={t.name}
                            className="h-10 w-10 object-cover rounded"
                          />
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-2 px-4">{t.name}</td>
                      <td className="py-2 px-4">
                        {typeof t.platformId === "string"
                          ? platforms.find((p) => p._id === t.platformId)?.name || "Unknown"
                          : (t.platformId as any)?.name || "Unknown"}
                      </td>
                      <td className="py-2 px-4">{t.description || "-"}</td>
                      <td className="py-2 px-4">
                        <span
                          className={`px-3 py-1 rounded text-white ${t.status === "active" ? "bg-green-500" : "bg-gray-500"
                            }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="py-2 px-4 space-x-2">
                        <button
                          onClick={() => handleEdit(t)}
                          className="px-3 py-1 rounded bg-blue-500 text-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(t._id)}
                          className="px-3 py-1 rounded bg-red-500 text-white"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-500">
                      No service titles found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ✅ Pagination (disabled during search) */}
          {!searchTerm && totalPages > 1 && (
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

      {/* ✅ Create Modal and Edit Modal remain unchanged */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Add Service Title</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="text"
                placeholder="Title name"
                value={newTitle.name}
                onChange={(e) =>
                  setNewTitle({ ...newTitle, name: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
                required
              />
              <textarea
                placeholder="Description"
                value={newTitle.description}
                onChange={(e) =>
                  setNewTitle({ ...newTitle, description: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />
              <select
                value={typeof newTitle.platformId === "string" ? newTitle.platformId : (newTitle.platformId as any)?._id || ""}
                onChange={(e) =>
                  setNewTitle({ ...newTitle, platformId: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value="">Select platform</option>
                {platforms.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setNewImageFile(file);
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setNewPreview(reader.result as string);
                      reader.readAsDataURL(file);
                    } else {
                      setNewPreview(null);
                    }
                  }}
                  className="w-full border px-3 py-2 rounded"
                />
                {newPreview && (
                  <div className="mt-2">
                    <img src={newPreview} alt="Preview" className="w-20 h-20 object-cover rounded" />
                  </div>
                )}
              </div>
              <select
                value={newTitle.status}
                onChange={(e) =>
                  setNewTitle({
                    ...newTitle,
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

      {showEditModal && editTitle && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Edit Service Title</h3>
            <form onSubmit={handleUpdate} className="space-y-3">
              <input
                type="text"
                value={editTitle.name}
                onChange={(e) =>
                  setEditTitle({ ...editTitle, name: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
                required
              />
              <textarea
                value={editTitle.description}
                onChange={(e) =>
                  setEditTitle({ ...editTitle, description: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />
              <select
                value={
                  typeof editTitle.platformId === "string"
                    ? editTitle.platformId
                    : (editTitle.platformId as any)?._id || ""
                }
                onChange={(e) =>
                  setEditTitle({ ...editTitle, platformId: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value="">Select platform</option>
                {platforms.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setEditImageFile(file);
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setEditTitle(prev => prev ? { ...prev, imageUrl: reader.result as string } : null);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full border px-3 py-2 rounded"
                />
                {editTitle.imageUrl && (
                  <div className="mt-2">
                    <img src={editTitle.imageUrl} alt="Preview" className="w-20 h-20 object-cover rounded" />
                  </div>
                )}
              </div>
              <select
                value={editTitle.status}
                onChange={(e) =>
                  setEditTitle({
                    ...editTitle,
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
