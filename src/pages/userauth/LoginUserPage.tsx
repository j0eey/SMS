import { useEffect, useMemo, useState } from "react";
import { useUserStore } from "../../store/userStore";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../api/auth";
import toast from "react-hot-toast";

export default function LoginUserPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const setTokens = useUserStore(state => state.setTokens);

  // ✅ Load remembered email & auto-redirect if logged in
  useEffect(() => {
    const saved = localStorage.getItem("remember_email");
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }

    const token = localStorage.getItem("accessToken");
    if (token) {
      navigate("/");
    } else {
      setCheckingAuth(false);
    }
  }, [navigate]);

  const { emailError, passwordError, formValid } = useMemo(() => {
    const emailOk = /\S+@\S+\.\S+/.test(email);
    const pwdOk = password.length >= 6;
    return {
      emailError: email && !emailOk ? "Enter a valid email." : null,
      passwordError: password && !pwdOk ? "Min 6 characters." : null,
      formValid: emailOk && pwdOk,
    };
  }, [email, password]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formValid) {
      setError("Please fix the highlighted fields.");
      return;
    }

    setSubmitting(true);
    try {
      const data = await login({ email: email.trim(), password });

      // ✅ Use user store to set tokens
      if (data?.accessToken && data?.refreshToken) {
        setTokens(data.accessToken, data.refreshToken);
      }

      if (remember) localStorage.setItem("remember_email", email.trim());
      else localStorage.removeItem("remember_email");

      toast.success("Welcome back!");
      navigate("/");
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setError(msg);
      toast.error("Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Optional loading overlay when checking auth
  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 border-4 border-t-red-600 border-gray-700 rounded-full animate-spin mb-4" />
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black text-white relative overflow-hidden">
      {/* Red glow background */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[560px] w-[560px] rounded-full blur-3xl opacity-25"
        style={{
          background:
            "radial-gradient(closest-side, rgba(239,68,68,0.25), rgba(239,68,68,0.10), transparent)",
        }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-7xl">
        {/* Left side branding (desktop only) */}
        <aside className="hidden lg:flex w-1/2 items-center justify-center p-12">
          <div className="max-w-md">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="h-9 w-9 rounded-md bg-red-600 flex items-center justify-center font-black">
                S
              </div>
              <span className="text-2xl font-semibold tracking-tight">
                Social Media<span className="text-red-500"> Services</span>
              </span>
            </Link>

            <h1 className="mt-10 text-4xl font-bold leading-tight">
              Welcome back to <span className="text-red-500">your account</span>
            </h1>
            <p className="mt-4 text-gray-300">
              Access your account and manage your social media services easily.
            </p>
          </div>
        </aside>

        {/* Right side login form */}
        <main className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            {/* Mobile header */}
            <Link to="/" className="lg:hidden mb-8 flex items-center justify-center gap-3">
              <div className="h-9 w-9 rounded-md bg-red-600 flex items-center justify-center font-black">
                S
              </div>
              <span className="text-2xl font-semibold tracking-tight">
                Social Media<span className="text-red-500"> Services</span>
              </span>
            </Link>

            <div className="rounded-2xl border border-white/10 bg-[#0b0b0c] p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
              <h2 className="text-xl sm:text-2xl font-semibold">User Login</h2>
              <p className="mt-1 text-sm text-gray-400">Please log in to continue.</p>

              {error && (
                <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {error}
                </div>
              )}

              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full rounded-lg bg-black/40 border px-3 py-2 outline-none placeholder-gray-500 focus:ring-2 focus:ring-red-600 focus:border-red-600 ${
                      emailError ? "border-red-600" : "border-white/10"
                    }`}
                  />
                  {emailError && <p className="mt-1 text-xs text-red-400">{emailError}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm mb-1">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full rounded-lg bg-black/40 border px-3 py-2 pr-10 outline-none placeholder-gray-500 focus:ring-2 focus:ring-red-600 focus:border-red-600 ${
                        passwordError ? "border-red-600" : "border-white/10"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute inset-y-0 right-0 px-3 text-gray-400 hover:text-gray-200"
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="mt-1 text-xs text-red-400">{passwordError}</p>
                  )}
                </div>

                <label className="mt-2 flex items-center gap-2 text-sm select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={() => setRemember((v) => !v)}
                    className="h-4 w-4 rounded border-white/10 bg-black/40 text-red-600 focus:ring-red-600"
                  />
                  Remember me
                </label>

                <button
                  type="submit"
                  disabled={submitting || !formValid}
                  className="mt-2 w-full rounded-lg bg-gradient-to-r from-red-600 to-red-500 px-4 py-2.5 font-medium text-white shadow hover:from-red-500 hover:to-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Signing in…
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </form>

              <div className="my-6 flex items-center">
                <div className="h-px flex-1 bg-white/10" />
                <span className="px-3 text-xs text-gray-400">or</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <p className="text-center text-sm text-gray-400">
                Don’t have an account?{" "}
                <Link to="/signup" className="text-red-400 hover:text-red-300">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}