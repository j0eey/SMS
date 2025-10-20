import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import toast from "react-hot-toast";
import { getImportedServices } from "../../api/importedServices";
import type { ImportedService as ImportedServiceBase } from "../../api/importedServices";

// Extend ImportedService to include userRate
type ImportedService = ImportedServiceBase & { userRate: string };

export default function ImportedServicesPage() {
  const [services, setServices] = useState<ImportedService[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50); // ✅ default 50
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchServices(search, page, pageSize);
  }, [search, page, pageSize]);

  const fetchServices = async (query: string, pageNum: number, pageSizeNum: number) => {
    setLoading(true);
    try {
      const data = await getImportedServices(query, pageNum, pageSizeNum);

      // ✅ Add adjusted rate
      const adjusted = data.items.map((s: ImportedServiceBase) => ({
        ...s,
        userRate: (parseFloat(s.rate) * 1.3).toFixed(3),
      }));

      setServices(adjusted);
      setTotalPages(Math.ceil(data.total / pageSizeNum));
    } catch {
      toast.error("Failed to load imported services");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-3 md:space-y-0">
        <h2 className="text-2xl font-bold">Imported Services</h2>

        <div className="flex space-x-2">
          {/* ✅ Search bar (real-time) */}
          <input
            type="text"
            placeholder="Search by name or category..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // reset to page 1
            }}
            className="border px-3 py-2 rounded-lg w-64"
          />

          {/* Page size selector */}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1); // reset to first page
            }}
            className="border px-3 py-2 rounded"
          >
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
            <option value={200}>200 per page</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="py-2 px-4">ID</th>
                  <th className="py-2 px-4">Name</th>
                  <th className="py-2 px-4">Category</th>
                  <th className="py-2 px-4">Type</th>
                  <th className="py-2 px-4">Provider Rate</th>
                  <th className="py-2 px-4">User Rate</th>
                  <th className="py-2 px-4">Min</th>
                  <th className="py-2 px-4">Max</th>
                  <th className="py-2 px-4">Dripfeed</th>
                  <th className="py-2 px-4">Refill</th>
                  <th className="py-2 px-4">Cancel</th>
                </tr>
              </thead>
              <tbody>
                {services.length > 0 ? (
                  services.map((s) => (
                    <tr key={s.service} className="border-t">
                      <td className="py-2 px-4">{s.service}</td>
                      <td className="py-2 px-4">{s.name}</td>
                      <td className="py-2 px-4">{s.category}</td>
                      <td className="py-2 px-4">{s.type}</td>
                      <td className="py-2 px-4">${s.rate}</td>
                      <td className="py-2 px-4 font-semibold text-green-600">
                        ${s.userRate}
                      </td>
                      <td className="py-2 px-4">{s.min}</td>
                      <td className="py-2 px-4">{s.max}</td>
                      <td className="py-2 px-4">{s.dripfeed ? "✅" : "❌"}</td>
                      <td className="py-2 px-4">{s.refill ? "✅" : "❌"}</td>
                      <td className="py-2 px-4">{s.cancel ? "✅" : "❌"}</td>
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

          {/* ✅ Pagination controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-4">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className={`px-3 py-1 rounded ${
                  page === 1
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                Prev
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className={`px-3 py-1 rounded ${
                  page === totalPages
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}