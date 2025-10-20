import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../api/auth";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token.");
    }
  }, [token]);

  const { passwordError, confirmError, formValid } = useMemo(() => {
    const pwdOk = password.length >= 6;
    const confirmOk = confirm === password && pwdOk;
    return {
      passwordError: password && !pwdOk ? "Min 6 characters." : null,
      confirmError: confirm && !confirmOk ? "Passwords do not match." : null,
      formValid: pwdOk && confirmOk,
    };
  }, [password, confirm]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formValid || !token) {
      setError("Please fix errors before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
      toast.success("Password reset successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Password reset failed. Try again.";
      setError(msg);
      toast.error("Reset failed");
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
              Reset your <span className="text-red-500">password</span>
            </h1>
            <p className="mt-4 text-gray-300">
              Enter your new password below to complete the reset process.
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
              <h2 className="text-xl sm:text-2xl font-semibold">Set New Password</h2>
              <p className="mt-1 text-sm text-gray-400">
                Choose a strong password for your account.
              </p>

              {error && (
                <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {error}
                </div>
              )}

              {success ? (
                <div className="mt-6 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-4 text-sm text-green-300">
                  Password reset successful. Redirecting to login…
                </div>
              ) : (
                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm mb-1">New Password</label>
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

                  <div>
                    <label className="block text-sm mb-1">Confirm Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className={`w-full rounded-lg bg-black/40 border px-3 py-2 outline-none placeholder-gray-500 focus:ring-2 focus:ring-red-600 focus:border-red-600 ${
                        confirmError ? "border-red-600" : "border-white/10"
                      }`}
                    />
                    {confirmError && (
                      <p className="mt-1 text-xs text-red-400">{confirmError}</p>
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
                        Updating…
                      </span>
                    ) : (
                      "Reset Password"
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
                <Link to="/login" className="text-red-400 hover:text-red-300">
                  Back to login
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}