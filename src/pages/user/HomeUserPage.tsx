import UserLayout from "../../layouts/UserLayout";
import Footer from "../../layouts/Footer";

import { useNavigate } from "react-router-dom";

export default function HomeUserPage() {
  const navigate = useNavigate();
  return (
    <UserLayout>
      {/* ✅ Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 text-center px-6 py-20 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full blur-3xl opacity-25"
          style={{
            background:
              "radial-gradient(closest-side, rgba(239,68,68,0.25), rgba(239,68,68,0.10), transparent)",
          }}
        />
        <h1 className="text-4xl sm:text-6xl font-bold max-w-3xl leading-tight relative z-10">
          Boost Your <span className="text-red-500">Social Media Growth</span>
        </h1>
        <p className="mt-4 text-gray-400 max-w-xl text-base sm:text-lg relative z-10">
          Get premium followers, likes, and engagement across all platforms —
          powered by the most trusted automation system.
        </p>
        <button
          onClick={() => navigate("/Services")}
          className="mt-8 px-8 py-3 bg-gradient-to-r from-red-600 to-red-500 rounded-lg font-medium hover:from-red-500 hover:to-red-500 transition shadow-lg relative z-10">
          Get Started
        </button>
      </section>

      {/* ✅ Features Section */}
      <section className="py-20 px-6 bg-[#0b0b0c] border-t border-white/10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 text-center">
          <div>
            <div className="text-red-500 text-4xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold mb-2">Fast Delivery</h3>
            <p className="text-gray-400 text-sm">
              Get your orders processed instantly — no waiting, no delays.
            </p>
          </div>
          <div>
            <div className="text-red-500 text-4xl mb-3">✅</div>
            <h3 className="text-lg font-semibold mb-2">High Quality</h3>
            <p className="text-gray-400 text-sm">
              Real users, real engagement — no bots or fake results.
            </p>
          </div>
          <div>
            <div className="text-red-500 text-4xl mb-3">💬</div>
            <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
            <p className="text-gray-400 text-sm">
              Our dedicated team is always ready to help you anytime.
            </p>
          </div>
        </div>
      </section>

      {/* ✅ Services Preview */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">
            Our <span className="text-red-500">Top Services</span>
          </h2>
          <p className="text-gray-400">
            We provide reliable, fast, and safe social media marketing services.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { name: "Instagram Followers", desc: "Grow your profile naturally and quickly." },
            { name: "TikTok Views", desc: "Get more reach and engagement instantly." },
            { name: "YouTube Subscribers", desc: "Build a strong and loyal audience." },
            { name: "Netflix Accounts", desc: "Build a strong and loyal audience." },
            { name: "beIN SPORTS Subscriptions", desc: "Build a strong and loyal audience." },
            { name: "ChatGPT Plus", desc: "Build a strong and loyal audience." },
          ].map((s, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/10 bg-[#0b0b0c] p-6 hover:border-red-600 transition"
            >
              <h3 className="text-lg font-semibold mb-2 text-red-500">{s.name}</h3>
              <p className="text-gray-400 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </UserLayout>
  );
}