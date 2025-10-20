import { useEffect, useState } from "react";
import UserLayout from "../../layouts/UserLayout";
import Footer from "../../layouts/Footer";
import { Link } from "react-router-dom";
import { getPublicCategories, searchPublicCategories } from "../../api/publicCategories";

export default function CategoriesUserPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 16;
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const isSearching = searchTerm.trim().length > 0;

  useEffect(() => {
    if (isSearching) {
      fetchSearch(searchTerm, page);
    } else {
      fetchData(page);
    }
  }, [page, isSearching, searchTerm]);

  const fetchData = async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const catRes = await getPublicCategories(pageNum, pageSize);
      setCategories(Array.isArray(catRes.items) ? catRes.items : []);
      setTotalPages(catRes.totalPages || 1);
    } catch (error) {
      console.error("Failed to load categories:", error);
      setError("Failed to load categories. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSearch = async (query: string, pageNum: number) => {
    setLoading(true);
    try {
      const res = await searchPublicCategories(query, pageNum, pageSize);
      setCategories(res.items || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error("Search failed:", err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserLayout>
      <div className="min-h-screen bg-black text-white px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-10 text-red-600">
            Our Services
          </h1>

          <div className="max-w-md mx-auto mb-6">
            <input
              type="text"
              placeholder="Search Categories..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 rounded bg-zinc-900 border border-zinc-700 focus:outline-none"
            />
          </div>

          {loading ? (
            <p className="text-center text-gray-400">Loading categories...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : categories.length === 0 ? (
            <p className="text-center text-gray-400">No categories found.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/services/${cat.slug}`}
                    className="rounded-lg shadow hover:shadow-red-600/30 transition w-full flex flex-col overflow-hidden"
                  >
                    <div
                      className={`h-40 rounded-t-lg ${!cat.imageUrl ? 'bg-gray-900' : ''}`}
                      style={
                        cat.imageUrl
                          ? {
                            backgroundImage: `url(${cat.imageUrl})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                          : undefined
                      }
                    />
                    <div className="bg-black-100 px-4 py-2 text-center">
                      <h2 className="text-xl font-semibold text-white-900">
                        {cat.name}
                      </h2>
                    </div>
                  </Link>
                ))}
              </div>
              {!loading && totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 space-x-4">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span>Page {page} of {totalPages}</span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded disabled:opacity-50"
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