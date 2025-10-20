import { useEffect, useState, useRef } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  getServices,
  searchServices,
  createService,
  updateService,
  deleteService,
  type ServiceInput,
} from "../../api/services";
import { getServiceTitles } from "../../api/serviceTitles";
import toast from "react-hot-toast";

interface Service {
  _id: string;
  name: string;
  price: number;
  userPrice?: number;
  min: number;
  max: number;
  description: string;
  status: "active" | "inactive";
  imageUrl?: string;
  serviceTitle?: {
    _id: string;
    name: string;
    platform?: {
      _id: string;
      name: string;
      category?: { _id: string; name: string } | null;
    } | null;
  } | null;
  serviceType?: "api" | "local";
  provider?: string | null;
  providerServiceId?: string | null;
}

interface ServiceTitle {
  _id: string;
  name: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]); // ✅ always array
  const [titles, setTitles] = useState<ServiceTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "api" | "local">("all");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 10;

  // Create form
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newService, setNewService] = useState<ServiceInput>({
    name: "",
    price: 0,
    min: 0,
    max: 0,
    description: "",
    serviceTitleId: "",
    status: "active",
    serviceType: "" as any,
    provider: "",
    providerServiceId: "",
  });
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const newImageInputRef = useRef<HTMLInputElement | null>(null);

  // Edit form
  const [showEditModal, setShowEditModal] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const editImageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (searchTerm) {
      handleSearch(searchTerm);
    } else {
      fetchServices(currentPage);
    }
  }, [currentPage, searchTerm]);

 const fetchServices = async (pageNum: number) => {
  setLoading(true);
  try {
    const [data, titlesData] = await Promise.all([
      getServices(pageNum, PAGE_SIZE), // ✅ returns { items, total, page, pageSize }
      getServiceTitles(),
    ]);

    // Map imageUrl to each service if present
    const mappedServices = (data.items || []).map((item: any) => ({
      ...item,
      imageUrl: item.imageUrl,
    }));

    setServices(mappedServices); // ✅ safely handle array
    setTitles(Array.isArray(titlesData) ? titlesData : titlesData?.items || []);
    setTotalPages(Math.ceil((data.total || 0) / PAGE_SIZE));
  } catch (err) {
    console.error("Error fetching services:", err);
    toast.error("Failed to load services");
  } finally {
    setLoading(false);
  }
};

  const handleSearch = async (query: string) => {
    if (!query) {
      fetchServices(1);
      setCurrentPage(1);
      return;
    }
    setLoading(true);
    try {
      const results = await searchServices(query);
      setServices(Array.isArray(results) ? results : []); // ✅ fallback
      setTotalPages(1);
      setCurrentPage(1);
    } catch {
      toast.error("Search failed");
      setServices([]); // ✅ fallback
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", newService.name);
      formData.append("price", String(newService.price));
      formData.append("min", String(newService.min));
      formData.append("max", String(newService.max));
      formData.append("description", newService.description);
      formData.append("serviceTitleId", newService.serviceTitleId);
      formData.append("status", newService.status);
      formData.append("serviceType", newService.serviceType);
      if (newService.serviceType === "api") {
        formData.append("provider", newService.provider || "");
        formData.append("providerServiceId", newService.providerServiceId || "");
      }
      if (newImageFile) {
        formData.append("image", newImageFile);
      }
      await createService(formData);
      toast.success("Service created");
      setShowCreateModal(false);
      resetNewForm();
      setNewImageFile(null);
      setNewImagePreview(null);
      if (newImageInputRef.current) newImageInputRef.current.value = "";
      fetchServices(currentPage);
    } catch {
      toast.error("Failed to create service");
    }
  };

  const handleEdit = (service: Service) => {
    setEditService(service);
    setEditImageFile(null);
    setEditImagePreview(null);
    if (editImageInputRef.current) editImageInputRef.current.value = "";
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editService) return;
    try {
      const formData = new FormData();
      formData.append("name", editService.name);
      formData.append("price", String(editService.price));
      formData.append("min", String(editService.min));
      formData.append("max", String(editService.max));
      formData.append("description", editService.description);
      // ServiceTitle may be object or string
      if (editService.serviceTitle?._id) {
        formData.append("serviceTitleId", editService.serviceTitle._id);
      } else if ((editService as any).serviceTitleId) {
        formData.append("serviceTitleId", (editService as any).serviceTitleId);
      }
      formData.append("status", editService.status);
      formData.append("serviceType", editService.serviceType || "");
      if (editService.serviceType === "api") {
        formData.append("provider", editService.provider || "");
        formData.append("providerServiceId", editService.providerServiceId || "");
      }
      if (editImageFile) {
        formData.append("image", editImageFile);
      }
      await updateService(editService._id, formData);
      toast.success("Service updated");
      setShowEditModal(false);
      setEditService(null);
      setEditImageFile(null);
      setEditImagePreview(null);
      if (editImageInputRef.current) editImageInputRef.current.value = "";
      fetchServices(currentPage);
    } catch {
      toast.error("Failed to update service");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this service?")) return;
    try {
      await deleteService(id);
      toast.success("Service deleted");
      fetchServices(currentPage);
    } catch {
      toast.error("Failed to delete service");
    }
  };

  const resetNewForm = () => {
    setNewService({
      name: "",
      price: 0,
      min: 0,
      max: 0,
      description: "",
      serviceTitleId: "",
      status: "active",
      serviceType: "" as any,
      provider: "",
      providerServiceId: "",
    });
    setNewImageFile(null);
    setNewImagePreview(null);
    if (newImageInputRef.current) newImageInputRef.current.value = "";
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Services</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Add Service
        </button>
      </div>

      {/* ✅ Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      {/* Service Type Tabs */}
      <div className="mb-4 space-x-2">
        <button
          onClick={() => setFilterType("all")}
          className={`px-4 py-2 rounded ${filterType === "all" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          All Services
        </button>
        <button
          onClick={() => setFilterType("api")}
          className={`px-4 py-2 rounded ${filterType === "api" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          API Services
        </button>
        <button
          onClick={() => setFilterType("local")}
          className={`px-4 py-2 rounded ${filterType === "local" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          Local Services
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="py-2 px-4">Image</th>
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Base Price</th>
              <th className="py-2 px-4">User Price</th>
              <th className="py-2 px-4">Min</th>
              <th className="py-2 px-4">Max</th>
              <th className="py-2 px-4">Service Title</th>
              <th className="py-2 px-4">Platform</th>
              <th className="py-2 px-4">Category</th>
              <th className="py-2 px-4">Type</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services && services.length > 0 ? (
              services
                .filter((s) => filterType === "all" || s.serviceType === filterType)
                .map((s) => (
                <tr key={s._id} className="border-t">
                  <td className="py-2 px-4">
                    {s.imageUrl ? (
                      <img
                        src={s.imageUrl}
                        alt={s.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-2 px-4">{s.name}</td>
                  <td className="py-2 px-4">${s.price.toFixed(2)}</td>
                  <td className="py-2 px-4">
                    ${s.userPrice?.toFixed(2)}
                    <span className="text-xs text-gray-500 ml-1">
                      (base: ${s.price.toFixed(2)})
                    </span>
                  </td>
                  <td className="py-2 px-4">{s.min}</td>
                  <td className="py-2 px-4">{s.max}</td>
                  <td className="py-2 px-4">{s.serviceTitle?.name || "-"}</td>
                  <td className="py-2 px-4">{s.serviceTitle?.platform?.name || "-"}</td>
                  <td className="py-2 px-4">
                    {s.serviceTitle?.platform?.category?.name || "-"}
                  </td>
                  <td className="py-2 px-4">
                    {s.serviceType
                      ? s.serviceType === "api"
                        ? "API"
                        : "Local"
                      : "-"}
                  </td>
                  <td className="py-2 px-4">
                    <span
                      className={`px-3 py-1 rounded text-white ${
                        s.status === "active" ? "bg-green-500" : "bg-gray-500"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 space-x-2">
                    <button
                      onClick={() => handleEdit(s)}
                      className="px-3 py-1 rounded bg-blue-500 text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s._id)}
                      className="px-3 py-1 rounded bg-red-500 text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} className="text-center py-4 text-gray-500">
                  No services found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

          {/* ✅ Pagination only when not searching */}
          {!searchTerm && totalPages > 1 && (
            <div className="flex justify-center items-center mt-4 space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
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
            <h3 className="text-xl font-semibold mb-4">Add New Service</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="text"
                placeholder="Service name"
                value={newService.name}
                onChange={(e) =>
                  setNewService({ ...newService, name: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
                required
              />
              <input
                type="number"
                placeholder="Price"
                value={newService.price}
                onChange={(e) =>
                  setNewService({ ...newService, price: Number(e.target.value) })
                }
                className="w-full border px-3 py-2 rounded"
                required
              />
              <input
                type="number"
                placeholder="Min"
                value={newService.min}
                onChange={(e) =>
                  setNewService({ ...newService, min: Number(e.target.value) })
                }
                className="w-full border px-3 py-2 rounded"
                required
              />
              <input
                type="number"
                placeholder="Max"
                value={newService.max}
                onChange={(e) =>
                  setNewService({ ...newService, max: Number(e.target.value) })
                }
                className="w-full border px-3 py-2 rounded"
                required
              />
              <textarea
                placeholder="Description"
                value={newService.description}
                onChange={(e) =>
                  setNewService({ ...newService, description: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
                required
              />
              <select
                value={newService.serviceTitleId}
                onChange={(e) =>
                  setNewService({ ...newService, serviceTitleId: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value="">Select Service Title</option>
                {titles.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <select
                value={newService.status}
                onChange={(e) =>
                  setNewService({
                    ...newService,
                    status: e.target.value as "active" | "inactive",
                  })
                }
                className="w-full border px-3 py-2 rounded"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {/* Service Type and Provider Fields */}
              <select
                value={newService.serviceType}
                onChange={(e) => setNewService({ ...newService, serviceType: e.target.value as "api" | "local" })}
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value="">Select Service Type</option>
                <option value="api">API Service</option>
                <option value="local">Local Service</option>
              </select>
              {newService.serviceType === "api" && (
                <>
                  <input
                    type="text"
                    placeholder="Provider (e.g. secsers)"
                    value={newService.provider || ""}
                    onChange={(e) => setNewService({ ...newService, provider: e.target.value })}
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Provider Service ID"
                    value={newService.providerServiceId || ""}
                    onChange={(e) => setNewService({ ...newService, providerServiceId: e.target.value })}
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                </>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  ref={newImageInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setNewImageFile(file || null);
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setNewImagePreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    } else {
                      setNewImagePreview(null);
                    }
                  }}
                  className="w-full border px-2 py-1 rounded"
                />
                {newImagePreview && (
                  <img
                    src={newImagePreview}
                    alt="Preview"
                    className="mt-2 w-20 h-20 object-cover rounded shadow"
                  />
                )}
              </div>
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
      {showEditModal && editService && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Edit Service</h3>
            <form onSubmit={handleUpdate} className="space-y-3">
              <input
                type="text"
                value={editService.name}
                onChange={(e) =>
                  setEditService({ ...editService, name: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
                required
              />
              <input
                type="number"
                value={editService.price}
                onChange={(e) =>
                  setEditService({
                    ...editService,
                    price: Number(e.target.value),
                  })
                }
                className="w-full border px-3 py-2 rounded"
                required
              />
              <input
                type="number"
                value={editService.min}
                onChange={(e) =>
                  setEditService({
                    ...editService,
                    min: Number(e.target.value),
                  })
                }
                className="w-full border px-3 py-2 rounded"
                required
              />
              <input
                type="number"
                value={editService.max}
                onChange={(e) =>
                  setEditService({
                    ...editService,
                    max: Number(e.target.value),
                  })
                }
                className="w-full border px-3 py-2 rounded"
                required
              />
              <textarea
                value={editService.description}
                onChange={(e) =>
                  setEditService({
                    ...editService,
                    description: e.target.value,
                  })
                }
                className="w-full border px-3 py-2 rounded"
                required
              />
              <select
                value={editService.serviceTitle?._id || ""}
                onChange={(e) =>
                  setEditService({
                    ...editService,
                    serviceTitle: {
                      ...(editService.serviceTitle || {}),
                      _id: e.target.value,
                      name: "",
                    },
                  })
                }
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value="">Select Service Title</option>
                {titles.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <select
                value={editService.status}
                onChange={(e) =>
                  setEditService({
                    ...editService,
                    status: e.target.value as "active" | "inactive",
                  })
                }
                className="w-full border px-3 py-2 rounded"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {/* Service Type and Provider Fields for Edit */}
              <select
                value={editService?.serviceType || ""}
                onChange={(e) =>
                  setEditService({ ...editService!, serviceType: e.target.value as "api" | "local" })
                }
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value="">Select Service Type</option>
                <option value="api">API Service</option>
                <option value="local">Local Service</option>
              </select>
              {editService?.serviceType === "api" && (
                <>
                  <input
                    type="text"
                    placeholder="Provider (e.g. secsers)"
                    value={editService.provider || ""}
                    onChange={(e) =>
                      setEditService({ ...editService!, provider: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Provider Service ID"
                    value={editService.providerServiceId || ""}
                    onChange={(e) =>
                      setEditService({ ...editService!, providerServiceId: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                </>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  ref={editImageInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setEditImageFile(file || null);
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setEditImagePreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    } else {
                      setEditImagePreview(null);
                    }
                  }}
                  className="w-full border px-2 py-1 rounded"
                />
                {(editImagePreview ||
                  editService.imageUrl) && (
                  <img
                    src={editImagePreview || editService.imageUrl}
                    alt="Preview"
                    className="mt-2 w-20 h-20 object-cover rounded shadow"
                  />
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditImageFile(null);
                    setEditImagePreview(null);
                  }}
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