import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(form.name, form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 p-6">
      <form onSubmit={submit} className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-soft">
        <h1 className="text-3xl font-black text-slate-950">Create account</h1>
        <p className="mt-2 text-sm text-slate-500">Register a new ERP administrator.</p>
        {error && <div className="mt-5 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
        <div className="mt-6 grid gap-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Password" type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <Button disabled={loading}>{loading ? "Creating..." : "Create account"}</Button>
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">Already registered? <Link className="font-bold text-slate-950" to="/login">Login</Link></p>
      </form>
    </div>
  );
}
