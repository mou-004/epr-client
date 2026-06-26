import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl items-center gap-10 lg:grid-cols-2">
        <div>
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-slate-950"><BarChart3 /></div>
            <div>
              <h1 className="text-2xl font-black">Mini ERP</h1>
              <p className="text-slate-400">Inventory, purchases, sales and reports</p>
            </div>
          </div>
          <h2 className="text-5xl font-black leading-tight tracking-tight">Professional ERP dashboard for growing businesses.</h2>
          <p className="mt-5 max-w-xl text-lg text-slate-300">Manage products, customers, suppliers, purchases, sales, stock and invoices from one clean admin system.</p>
        </div>

        <form onSubmit={submit} className="rounded-[2rem] border border-white/10 bg-white p-8 text-slate-950 shadow-2xl">
          <h2 className="text-3xl font-black">Sign in</h2>
          <p className="mt-2 text-sm text-slate-500">Use your ERP admin account to continue.</p>
          {error && <div className="mt-5 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
          <div className="mt-6 grid gap-4">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button disabled={loading} className="mt-2 w-full">{loading ? "Signing in..." : "Login"}</Button>
          </div>
          <p className="mt-6 text-center text-sm text-slate-500">No account? <Link className="font-bold text-slate-950" to="/register">Create one</Link></p>
        </form>
      </div>
    </div>
  );
}
