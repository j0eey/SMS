import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import Footer from "../../layouts/Footer";
import { getPublicPlatforms, searchPublicPlatforms } from "../../api/publicPlatforms";
import { getPublicCategories } from "../../api/publicCategories";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

interface Platform {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  status: "active" | "inactive";
  imageUrl?: string;
}

export default function PlatformsUserPage() {
  const { categorySlug } = useParams();
  const navigate = useNavigate();

  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 16;
  const [categoryName, setCategoryName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const isSearching = searchTerm.trim().length > 0;

  useEffect(() => {
    fetchCategoryName();
    setPage(1);
    if (isSearching) {
      fetchSearch(searchTerm, 1);
    } else {
      fetchPlatforms(1);
    }
  }, [categorySlug, isSearching, searchTerm]);

  const fetchCategoryName = async () => {
    try {
      // load many categories to search by slug
      const data = await getPublicCategories(1, 200);
      const list = data.items || [];
      const found = list.find((cat: any) => cat.slug === categorySlug);
      if (found) setCategoryName(found.name);
    } catch (err) {
      console.error("Failed to fetch category name:", err);
    }
  };

  const fetchPlatforms = async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPublicPlatforms(categorySlug, pageNum, PAGE_SIZE);
      setPlatforms((data.items || []).map((p: any) => ({ ...p, slug: p.slug || p._id })));
      setTotalPages(Math.ceil((data.total || 0) / PAGE_SIZE));
    } catch (err) {
      console.error("Failed to load platforms:", err);
      setError("Failed to load platforms. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSearch = async (query: string, pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchPublicPlatforms(query, categorySlug, pageNum, PAGE_SIZE);
      setPlatforms((data.items || []).map((p: any) => ({ ...p, slug: p.slug || p._id })));
      setTotalPages(Math.ceil((data.total || 0) / PAGE_SIZE));
    } catch (err) {
      console.error("Search failed:", err);
      setError("Search failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserLayout>
      <div className="min-h-screen bg-black text-white px-4 py-10">
        <div className="max-w-6xl mx-auto">

          {/* Back Button + Title */}
          <div className="flex items-center gap-4 mb-10">
            <button
              onClick={() => {
                if (window.history.length > 1) navigate(-1);
                else navigate(`/services/${categorySlug}`);
              }}
              className="p-2 hover:bg-red-600/20 rounded-full transition"
            >
              <ArrowLeftIcon className="w-7 h-7 text-red-600" />
            </button>
            <h1 className="text-3xl font-bold text-red-600">{categoryName}</h1>
          </div>

          <div className="max-w-md mx-auto mb-6">
            <input
              type="text"
              placeholder="Search Platforms..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 rounded bg-zinc-900 border border-zinc-700 focus:outline-none"
            />
          </div>

          {loading ? (
            <p className="text-center text-gray-400">Loading platforms...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : platforms.length === 0 ? (
            <p className="text-center text-gray-400">No platforms found.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {platforms.map((platform) => (
                  <Link
                    key={platform.slug}
                    to={
                      platform.status === "active"
                        ? `/services/${categorySlug}/${platform.slug}`
                        : "#"
                    }
                    onClick={(e) => {
                      if (platform.status === "inactive") e.preventDefault();
                    }}
                    className={`rounded-lg shadow hover:shadow-red-600/30 transition w-full flex flex-col overflow-hidden ${
                      platform.status === "inactive"
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    {/* Platform Image */}
                    <div
                      className={`h-40 rounded-t-lg ${
                        !platform.imageUrl ? "bg-gray-900" : ""
                      }`}
                      style={
                        platform.imageUrl
                          ? {
                              backgroundImage: `url(${platform.imageUrl})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }
                          : undefined
                      }
                    />
                    {/* Name */}
                    <div className="bg-black px-4 py-2 text-center">
                      <h2 className="text-xl font-semibold text-white">
                        {platform.name}
                      </h2>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="flex justify-center items-center mt-6 space-x-4">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => { const newPage = Math.max(1,p-1); isSearching? fetchSearch(searchTerm,newPage):fetchPlatforms(newPage); return newPage;})}
                  className="px-4 py-2 bg-gray-800 disabled:opacity-40 rounded"
                >
                  Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => { const newPage = Math.min(totalPages,p+1); isSearching? fetchSearch(searchTerm,newPage):fetchPlatforms(newPage); return newPage;})}
                  className="px-4 py-2 bg-gray-800 disabled:opacity-40 rounded"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </UserLayout>
  );
}