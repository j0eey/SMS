import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import Footer from "../../layouts/Footer";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { getPublicServices, searchPublicServices } from "../../api/publicServices";

export default function ServicesUserPage() {
  const { categorySlug, platformSlug, serviceTitleSlug } = useParams();
  const navigate = useNavigate();

  const [services, setServices] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 16;
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const isSearching = searchTerm.trim().length > 0;

  useEffect(() => {
    if (isSearching) {
      fetchSearch(page);
    } else {
      fetchServices(page);
    }
  }, [page, isSearching, searchTerm]);

  const fetchServices = async (currentPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPublicServices(serviceTitleSlug!, currentPage, pageSize);

      if (Array.isArray(response.items)) {
        setServices(response.items);
        setTotalPages(Math.ceil(response.total / pageSize));
      } else {
        setError("Unexpected response format");
      }
    } catch (e) {
      console.error(e);
      setError("Failed to load services.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSearch = async (currentPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await searchPublicServices(searchTerm, serviceTitleSlug, currentPage, pageSize);
      if (Array.isArray(response.items)) {
        setServices(response.items);
        setTotalPages(Math.ceil(response.total / pageSize));
      } else {
        setError("Unexpected response format");
      }
    } catch (e) {
      console.error(e);
      setError("Failed to search services.");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    // try to go back in history first; if there's no previous entry, fall back to the services list
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(`/services/${categorySlug ?? ""}/${platformSlug ?? ""}`);
    }
  };

  return (
    <UserLayout>
      <div className="min-h-screen bg-black text-white px-4 py-10">
        <div className="max-w-6xl mx-auto">

          {/* Back Button + Title */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={goBack}
              className="p-2 hover:bg-red-600/20 rounded-full transition"
            >
              <ArrowLeftIcon className="w-7 h-7 text-red-600" />
            </button>
            <h1 className="text-3xl font-bold text-red-600">
              {services[0]?.serviceTitle?.name || "Services"}
            </h1>
          </div>

          <div className="max-w-md mx-auto mb-6">
            <input
              type="text"
              placeholder="Search Services..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 rounded bg-zinc-900 border border-zinc-700 focus:outline-none"
            />
          </div>

          {loading ? (
            <p className="text-center text-gray-400">Loading services...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : services.length === 0 ? (
            <p className="text-center text-gray-400">No services found.</p>
          ) : (
            <>
              {/* Services Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {services.map((service) => (
                  <div
                    key={service.slug}
                    onClick={() =>
                      navigate(
                        `/services/${categorySlug}/${platformSlug}/${serviceTitleSlug}/${service.slug}`
                      )
                    }
                    className="cursor-pointer bg-gray-900 rounded-lg shadow-lg border border-gray-800 hover:border-red-600 hover:shadow-red-600/40 transition p-3"
                  >
                    <img
                      src={service.imageUrl || "/default-service.png"}
                      alt={service.name}
                      className="w-full h-32 object-cover rounded"
                    />
                    <h3 className="text-lg font-semibold mt-2">{service.name}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{service.description || "No description."}</p>

                    <div className="mt-3 text-sm">
                      <p><span className="text-gray-400">Price:</span> <span className="text-red-500 font-bold">${service.userPrice}</span></p>
                    </div>

                    <button className="mt-4 w-full bg-red-600 hover:bg-red-700 py-2 rounded text-white font-semibold">
                      Order Now
                    </button>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 gap-4">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span>Page {page} of {totalPages}</span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </UserLayout>
  );
}