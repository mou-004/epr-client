import { useEffect, useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardHeader } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Spinner } from "../components/ui/Spinner";
import { Table, Td, Th } from "../components/ui/Table";
import { api } from "../lib/api";
import { formatCurrency } from "../lib/utils";
import type { Product } from "../types";

type ProductForm = Omit<Product, "_id" | "createdAt">;

const emptyForm: ProductForm = {
  name: "",
  sku: "",
  category: "General",
  unit: "pcs",
  purchasePrice: 0,
  salePrice: 0,
  stock: 0,
  minStock: 5,
  status: "active"
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const data = await api.get<Product[]>("/products");
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const startCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const startEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      unit: product.unit,
      purchasePrice: product.purchasePrice,
      salePrice: product.salePrice,
      stock: product.stock,
      minStock: product.minStock,
      status: product.status
    });
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (editing) await api.put<Product>(`/products/${editing._id}`, form);
      else await api.post<Product>("/products", form);
      setOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`);
    await load();
  };

  return (
    <Card>
      <CardHeader title="Products" description="Create, update, and monitor inventory stock" action={<Button onClick={startCreate}><Plus size={16} /> Add Product</Button>} />
      {loading ? <div className="grid min-h-64 place-items-center"><Spinner /></div> : (
        <Table>
          <thead><tr><Th>Name</Th><Th>SKU</Th><Th>Category</Th><Th>Stock</Th><Th>Buy</Th><Th>Sell</Th><Th>Status</Th><Th>Action</Th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr key={product._id}>
                <Td className="font-bold text-slate-950">{product.name}</Td>
                <Td>{product.sku}</Td>
                <Td>{product.category}</Td>
                <Td><Badge tone={product.stock <= product.minStock ? "amber" : "green"}>{product.stock} {product.unit}</Badge></Td>
                <Td>{formatCurrency(product.purchasePrice)}</Td>
                <Td>{formatCurrency(product.salePrice)}</Td>
                <Td><Badge tone={product.status === "active" ? "green" : "red"}>{product.status}</Badge></Td>
                <Td>
                  <div className="flex gap-2">
                    <Button variant="secondary" className="h-9 px-3" onClick={() => startEdit(product)}><Edit size={15} /></Button>
                    <Button variant="danger" className="h-9 px-3" onClick={() => remove(product._id)}><Trash2 size={15} /></Button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal open={open} title={editing ? "Edit Product" : "Add Product"} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="grid gap-4">
          {error && <div className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
            <Input label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <Input label="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            <Input label="Purchase Price" type="number" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: Number(e.target.value) })} />
            <Input label="Sale Price" type="number" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: Number(e.target.value) })} />
            <Input label="Opening Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
            <Input label="Minimum Stock" type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })} />
          </div>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Status
            <select className="h-10 rounded-xl border border-slate-200 bg-white px-3" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ProductForm["status"] })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button>{editing ? "Update" : "Create"}</Button></div>
        </form>
      </Modal>
    </Card>
  );
}
