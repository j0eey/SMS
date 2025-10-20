import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../../api/auth";
import toast from "react-hot-toast";
import { useUserStore } from "../../store/userStore";

export default function SignupUserPage() {
  const navigate = useNavigate();
  const setTokens = useUserStore((s) => s.setTokens);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ validation
  const { nameError, emailError, passwordError, confirmError, formValid } =
    useMemo(() => {
      const nameOk = name.trim().length >= 2;
      const emailOk = /\S+@\S+\.\S+/.test(email);
      const pwdOk = password.length >= 6;
      const confirmOk = confirmPassword === password && password.length >= 6;
      return {
        nameError: name && !nameOk ? "Name must be at least 2 characters." : null,
        emailError: email && !emailOk ? "Enter a valid email." : null,
        passwordError: password && !pwdOk ? "Min 6 characters." : null,
        confirmError:
          confirmPassword && !confirmOk ? "Passwords do not match." : null,
        formValid: nameOk && emailOk && pwdOk && confirmOk,
      };
    }, [name, email, password, confirmPassword]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formValid) {
      setError("Please fix the highlighted fields.");
      return;
    }

    setSubmitting(true);
    try {
      const data = await signup({ name, email, password });
      if (data?.accessToken && data?.refreshToken) {
        setTokens(data.accessToken, data.refreshToken);
      }

      toast.success("Account created successfully!");
      navigate("/");
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Signup failed. Please try again.";
      setError(msg);
      toast.error("Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-white relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[560px] w-[560px] rounded-full blur-3xl opacity-25"
        style={{
          background:
            "radial-gradient(closest-side, rgba(239,68,68,0.25), rgba(239,68,68,0.10), transparent)",
        }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-7xl">
        {/* Left branding */}
        <aside className="hidden lg:flex w-1/2 items-center justify-center p-12">
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2">
              <div className="h-9 w-9 rounded-md bg-red-600 flex items-center justify-center font-black">
                S
              </div>
              <span className="text-2xl font-semibold tracking-tight">
                Social Media<span className="text-red-500"> Services</span>
              </span>
            </div>

            <h1 className="mt-10 text-4xl font-bold leading-tight">
              Create your <span className="text-red-500">account</span>
            </h1>
            <p className="mt-4 text-gray-300">
              Sign up and start managing your social media services easily.
            </p>
          </div>
        </aside>

        {/* Right form */}
        <main className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-8 flex items-center justify-center gap-3">
              <div className="h-9 w-9 rounded-md bg-red-600 flex items-center justify-center font-black">
                S
              </div>
              <span className="text-2xl font-semibold tracking-tight">
                Social Media<span className="text-red-500"> Services</span>
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0b0b0c] p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
              <h2 className="text-xl sm:text-2xl font-semibold">Sign up</h2>
              <p className="mt-1 text-sm text-gray-400">
                Fill out your details to create an account.
              </p>

              {error && (
                <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {error}
                </div>
              )}

              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full rounded-lg bg-black/40 border px-3 py-2 outline-none placeholder-gray-500 focus:ring-2 focus:ring-red-600 focus:border-red-600 ${
                      nameError ? "border-red-600" : "border-white/10"
                    }`}
                  />
                  {nameError && (
                    <p className="mt-1 text-xs text-red-400">{nameError}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full rounded-lg bg-black/40 border px-3 py-2 outline-none placeholder-gray-500 focus:ring-2 focus:ring-red-600 focus:border-red-600 ${
                      emailError ? "border-red-600" : "border-white/10"
                    }`}
                  />
                  {emailError && (
                    <p className="mt-1 text-xs text-red-400">{emailError}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm mb-1">Password</label>
                  <div className="relative">
                    <input
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

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm mb-1">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full rounded-lg bg-black/40 border px-3 py-2 outline-none placeholder-gray-500 focus:ring-2 focus:ring-red-600 focus:border-red-600 ${
                      confirmError ? "border-red-600" : "border-white/10"
                    }`}
                  />
                  {confirmError && (
                    <p className="mt-1 text-xs text-red-400">{confirmError}</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting || !formValid}
                  className="mt-2 w-full rounded-lg bg-gradient-to-r from-red-600 to-red-500 px-4 py-2.5 font-medium text-white shadow hover:from-red-500 hover:to-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating account…
                    </span>
                  ) : (
                    "Sign up"
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center">
                <div className="h-px flex-1 bg-white/10" />
                <span className="px-3 text-xs text-gray-400">or</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <p className="text-center text-sm text-gray-400">
                Already have an account?{" "}
                <Link to="/login" className="text-red-400 hover:text-red-300">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}