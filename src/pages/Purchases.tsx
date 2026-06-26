import { useEffect, useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardHeader } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Spinner } from "../components/ui/Spinner";
import { Table, Td, Th } from "../components/ui/Table";
import { api } from "../lib/api";
import { formatCurrency, formatDate } from "../lib/utils";
import type { Product, Purchase, Supplier } from "../types";

type PurchaseForm = {
  supplier: string;
  referenceNo: string;
  purchaseDate: string;
  product: string;
  quantity: number;
  costPrice: number;
  note: string;
};

const today = () => new Date().toISOString().slice(0, 10);
const emptyForm: PurchaseForm = { supplier: "", referenceNo: "", purchaseDate: today(), product: "", quantity: 1, costPrice: 0, note: "" };

export default function Purchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [form, setForm] = useState<PurchaseForm>(emptyForm);
  const [editing, setEditing] = useState<Purchase | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const [purchaseData, productData, supplierData] = await Promise.all([
      api.get<Purchase[]>("/purchases"),
      api.get<Product[]>("/products"),
      api.get<Supplier[]>("/suppliers")
    ]);
    setPurchases(purchaseData);
    setProducts(productData);
    setSuppliers(supplierData);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const start = (purchase?: Purchase) => {
    setError("");
    setEditing(purchase || null);
    const item = purchase?.items?.[0];
    setForm(purchase && item ? {
      supplier: typeof purchase.supplier === "string" ? purchase.supplier : purchase.supplier._id,
      referenceNo: purchase.referenceNo || "",
      purchaseDate: purchase.purchaseDate.slice(0, 10),
      product: typeof item.product === "string" ? item.product : item.product._id,
      quantity: item.quantity,
      costPrice: item.costPrice || 0,
      note: purchase.note || ""
    } : emptyForm);
    setOpen(true);
  };

  const selectProduct = (productId: string) => {
    const product = products.find((p) => p._id === productId);
    setForm({ ...form, product: productId, costPrice: product?.purchasePrice || form.costPrice });
  };

  const payload = () => ({
    supplier: form.supplier,
    referenceNo: form.referenceNo,
    purchaseDate: form.purchaseDate,
    note: form.note,
    items: [{ product: form.product, quantity: Number(form.quantity), costPrice: Number(form.costPrice) }]
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (editing) await api.put(`/purchases/${editing._id}`, payload());
      else await api.post("/purchases", payload());
      setOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this purchase and reverse stock?")) return;
    await api.delete(`/purchases/${id}`);
    await load();
  };

  return (
    <Card>
      <CardHeader title="Purchases" description="Purchase entries automatically increase product stock" action={<Button onClick={() => start()}><Plus size={16} /> New Purchase</Button>} />
      {loading ? <div className="grid min-h-64 place-items-center"><Spinner /></div> : (
        <Table>
          <thead><tr><Th>Reference</Th><Th>Supplier</Th><Th>Date</Th><Th>Items</Th><Th>Total</Th><Th>Action</Th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {purchases.map((purchase) => (
              <tr key={purchase._id}>
                <Td className="font-bold text-slate-950">{purchase.referenceNo || "—"}</Td>
                <Td>{typeof purchase.supplier === "string" ? "—" : purchase.supplier.name}</Td>
                <Td>{formatDate(purchase.purchaseDate)}</Td>
                <Td>{purchase.items.map((item) => `${typeof item.product === "string" ? "Product" : item.product.name} × ${item.quantity}`).join(", ")}</Td>
                <Td className="font-bold">{formatCurrency(purchase.totalAmount)}</Td>
                <Td><div className="flex gap-2"><Button variant="secondary" className="h-9 px-3" onClick={() => start(purchase)}><Edit size={15} /></Button><Button variant="danger" className="h-9 px-3" onClick={() => remove(purchase._id)}><Trash2 size={15} /></Button></div></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal open={open} title={editing ? "Edit Purchase" : "New Purchase"} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="grid gap-4">
          {error && <div className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">Supplier
              <select className="h-10 rounded-xl border border-slate-200 bg-white px-3" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} required>
                <option value="">Select supplier</option>{suppliers.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </label>
            <Input label="Reference No" value={form.referenceNo} onChange={(e) => setForm({ ...form, referenceNo: e.target.value })} />
            <Input label="Purchase Date" type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} />
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">Product
              <select className="h-10 rounded-xl border border-slate-200 bg-white px-3" value={form.product} onChange={(e) => selectProduct(e.target.value)} required>
                <option value="">Select product</option>{products.map((p) => <option key={p._id} value={p._id}>{p.name} ({p.stock} in stock)</option>)}
              </select>
            </label>
            <Input label="Quantity" type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
            <Input label="Cost Price" type="number" min={0} value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: Number(e.target.value) })} />
          </div>
          <Input label="Note" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          <div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700">Total: {formatCurrency(form.quantity * form.costPrice)}</div>
          <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button>{editing ? "Update Purchase" : "Save Purchase"}</Button></div>
        </form>
      </Modal>
    </Card>
  );
}
