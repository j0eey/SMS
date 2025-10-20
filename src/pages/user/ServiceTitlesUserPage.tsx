import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import Footer from "../../layouts/Footer";
import { getPublicServiceTitles, searchPublicServiceTitles } from "../../api/publicServiceTitles";

interface ServiceTitle {
  _id: string;
  slug: string;
  name: string;
  status: string;
  platformId: {
    _id: string;
    name: string;
    imageUrl?: string;
    slug?: string;
  };
}

export default function ServiceTitlesUserPage() {
  const { categorySlug, platformSlug } = useParams();
  const navigate = useNavigate();
  const [titles, setTitles] = useState<ServiceTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 16;
  const [totalPages, setTotalPages] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const isSearching = searchTerm.trim().length > 0;

  useEffect(() => {
    if (!platformSlug) return;
    if (isSearching) {
      fetchSearch(searchTerm, platformSlug, page);
    } else {
      fetchData(platformSlug, page);
    }
  }, [platformSlug, page, isSearching, searchTerm]);

  const fetchData = async (platformSlug: string, pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPublicServiceTitles(platformSlug, pageNum, PAGE_SIZE);
      setTitles(res.items || []);
      setTotalPages(Math.ceil((res.total || 0) / PAGE_SIZE));
    } catch (err) {
      console.error(err);
      setError("Failed to load service titles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSearch = async (query: string, platformSlug: string, pageNum = 1) => {
    setLoading(true);
    try {
      const res = await searchPublicServiceTitles(query, platformSlug, pageNum, PAGE_SIZE);
      setTitles(res.items || []);
      setTotalPages(Math.ceil((res.total || 0) / PAGE_SIZE));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserLayout>
      <div className="min-h-screen bg-black text-white px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-red-600/20 rounded-full transition"
            >
              <ArrowLeftIcon className="w-7 h-7 text-red-600" />
            </button>
            <h1 className="text-3xl font-bold text-red-600">
              {titles[0]?.platformId?.name || "Services"}
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
            <p className="text-center text-gray-400">Loading service titles...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : titles.length === 0 ? (
            <p className="text-center text-gray-400">No service titles found.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {titles.map((title) => (
                  <Link
                    key={title.slug}
                    to={`/services/${categorySlug}/${platformSlug}/${title.slug}`}
                    className={`rounded-lg shadow hover:shadow-red-600/30 transition w-full flex flex-col overflow-hidden ${
                      title.status !== "active" ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    <div
                      className={`h-40 bg-gray-900 flex items-center justify-center`}
                      style={
                        title.platformId?.imageUrl
                          ? {
                              backgroundImage: `url(${title.platformId.imageUrl})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }
                          : undefined
                      }
                    />
                    <div className="bg-black-100 px-4 py-2 text-center">
                      <h2 className="text-xl font-semibold text-white">
                        {title.name}
                      </h2>
                    </div>
                  </Link>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 space-x-4">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-gray-800 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span>Page {page} of {totalPages}</span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-gray-800 rounded disabled:opacity-50"
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