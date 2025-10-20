import { useState } from "react";
import UserLayout from "../../layouts/UserLayout";
import Footer from "../../layouts/Footer";
import { createDeposit } from "../../api/publicTransactions";

export default function AddFundsUserPage() {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("whishmoney");
  const [currency, setCurrency] = useState("USD");
  const [reference, setReference] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setMsg("");

    if (Number(amount) < 7) {
      setErr("Minimum deposit is $7");
      return;
    }
    if (!reference.trim()) {
      setErr("Reference is required");
      return;
    }
    if (!proof) {
      setErr("Proof image is required");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("amount", amount);
      formData.append("method", method);
      formData.append("reference", reference);
      formData.append("proof", proof);
      if (method === "whishmoney") formData.append("currency", currency);

      await createDeposit(formData);
      setMsg("Deposit request submitted successfully ✅");
      setAmount("");
      setReference("");
      setProof(null);
    } catch {
      setErr("Failed to submit deposit. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserLayout>
      <div className="min-h-screen bg-black text-white px-4 py-10">
        <div className="max-w-xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h1 className="text-3xl font-bold text-red-600 mb-6">Add Funds</h1>

          {/* Payment Instructions */}
          <div className="bg-zinc-800 border border-zinc-700 rounded p-4 mb-5 text-sm">
            <p className="mb-2 font-semibold text-white">Payment Instructions</p>
            <p>📲 <b>Whish Money (USD/LBP):</b> +961 81 953 573</p>
            <p>💰 <b>Binance Pay ID:</b> 171 716 630</p>
            <p>🔗 <b>USDT (BEP20):</b> 0x83d616ee8a0f72a9b3163c0cdb6b3622b34e3e4b</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
            {err && <p className="text-red-500 text-sm">{err}</p>}
            {msg && <p className="text-green-500 text-sm">{msg}</p>}

            <div>
              <label className="block text-sm text-zinc-300 mb-1">Amount (The Minimum Deposit Is $7)</label>
              <input value={amount} onChange={(e)=>setAmount(e.target.value)} type="number" min={7}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 focus:outline-none" required />
            </div>

            <div>
              <label className="block text-sm text-zinc-300 mb-1">Payment Method</label>
              <select value={method} onChange={(e)=>setMethod(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 focus:outline-none">
                <option value="whishmoney">Whish Money</option>
                <option value="binance">Binance Pay</option>
                <option value="usdt">USDT (BEP20)</option>
              </select>
            </div>

            {method === "whishmoney" && (
              <div>
                <label className="block text-sm text-zinc-300 mb-1">Currency (Rate: 89500 LBP)</label>
                <select value={currency} onChange={(e)=>setCurrency(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 focus:outline-none">
                  <option value="USD">USD</option>
                  <option value="LBP">LBP</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm text-zinc-300 mb-1">Your Phone Number</label>
              <input value={reference} onChange={(e)=>setReference(e.target.value)} type="text"
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 focus:outline-none" required />
            </div>

            <div>
              <label className="block text-sm text-zinc-300 mb-1">Upload Receipt (Image only)</label>
              <input onChange={(e)=>setProof(e.target.files?.[0] || null)} type="file" accept="image/*"
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 focus:outline-none" required />
            </div>

            <button disabled={loading} className="w-full bg-red-600 hover:bg-red-700 transition text-white py-2 rounded">
              {loading ? "Submitting..." : "Submit Deposit"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </UserLayout>
  );
}
