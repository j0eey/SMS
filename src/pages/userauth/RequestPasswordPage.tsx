import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../../api/auth";
import toast from "react-hot-toast";

export default function RequestPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailError = useMemo(() => {
    if (!email) return null;
    const valid = /\S+@\S+\.\S+/.test(email);
    return valid ? null : "Enter a valid email.";
  }, [email]);

  const formValid = email && !emailError;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formValid) {
      setError("Please enter a valid email.");
      return;
    }

    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      setSuccess(true);
      toast.success("If your email exists, a reset link has been sent.");
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Something went wrong. Try again.";
      setError(msg);
      toast.error("Request failed");
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
                Social<span className="text-red-500">X</span>
              </span>
            </div>

            <h1 className="mt-10 text-4xl font-bold leading-tight">
              Forgot your <span className="text-red-500">password?</span>
            </h1>
            <p className="mt-4 text-gray-300">
              Don’t worry — we’ll send you a link to reset it safely.
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
                Social<span className="text-red-500">X</span>
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0b0b0c] p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
              <h2 className="text-xl sm:text-2xl font-semibold">
                Request Password Reset
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                Enter your email address to receive a reset link.
              </p>

              {error && (
                <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {error}
                </div>
              )}

              {success ? (
                <div className="mt-6 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-4 text-sm text-green-300">
                  If the email exists, a reset link has been sent. Check your inbox and spam folder.
                </div>
              ) : (
                <form onSubmit={onSubmit} className="mt-6 space-y-4">
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

                  <button
                    type="submit"
                    disabled={submitting || !formValid}
                    className="mt-2 w-full rounded-lg bg-gradient-to-r from-red-600 to-red-500 px-4 py-2.5 font-medium text-white shadow hover:from-red-500 hover:to-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Sending…
                      </span>
                    ) : (
                      "Send reset link"
                    )}
                  </button>
                </form>
              )}

              <div className="my-6 flex items-center">
                <div className="h-px flex-1 bg-white/10" />
                <span className="px-3 text-xs text-gray-400">or</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <p className="text-center text-sm text-gray-400">
                Remember your password?{" "}
                <Link to="/login" className="text-red-400 hover:text-red-300">
                  Go back to login
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}