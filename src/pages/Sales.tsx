import { useEffect, useState } from "react";
import { Edit, FileText, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardHeader } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Spinner } from "../components/ui/Spinner";
import { Table, Td, Th } from "../components/ui/Table";
import { api } from "../lib/api";
import { formatCurrency, formatDate } from "../lib/utils";
import type { Customer, Product, Sale } from "../types";

type SaleForm = {
  customer: string;
  saleDate: string;
  product: string;
  quantity: number;
  unitPrice: number;
  paidAmount: number;
  note: string;
};

const today = () => new Date().toISOString().slice(0, 10);
const emptyForm: SaleForm = { customer: "", saleDate: today(), product: "", quantity: 1, unitPrice: 0, paidAmount: 0, note: "" };

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState<SaleForm>(emptyForm);
  const [editing, setEditing] = useState<Sale | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const [saleData, productData, customerData] = await Promise.all([
      api.get<Sale[]>("/sales"),
      api.get<Product[]>("/products"),
      api.get<Customer[]>("/customers")
    ]);
    setSales(saleData);
    setProducts(productData);
    setCustomers(customerData);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const start = (sale?: Sale) => {
    setError("");
    setEditing(sale || null);
    const item = sale?.items?.[0];
    setForm(sale && item ? {
      customer: typeof sale.customer === "string" ? sale.customer : sale.customer._id,
      saleDate: sale.saleDate.slice(0, 10),
      product: typeof item.product === "string" ? item.product : item.product._id,
      quantity: item.quantity,
      unitPrice: item.unitPrice || 0,
      paidAmount: sale.paidAmount,
      note: sale.note || ""
    } : emptyForm);
    setOpen(true);
  };

  const selectProduct = (productId: string) => {
    const product = products.find((p) => p._id === productId);
    setForm({ ...form, product: productId, unitPrice: product?.salePrice || form.unitPrice });
  };

  const payload = () => ({
    customer: form.customer,
    saleDate: form.saleDate,
    paidAmount: Number(form.paidAmount),
    note: form.note,
    items: [{ product: form.product, quantity: Number(form.quantity), unitPrice: Number(form.unitPrice) }]
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (editing) await api.put(`/sales/${editing._id}`, payload());
      else await api.post("/sales", payload());
      setOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this sale and restore stock?")) return;
    await api.delete(`/sales/${id}`);
    await load();
  };

  return (
    <Card>
      <CardHeader title="Sales" description="Sales automatically deduct product stock and generate invoices" action={<Button onClick={() => start()}><Plus size={16} /> New Sale</Button>} />
      {loading ? <div className="grid min-h-64 place-items-center"><Spinner /></div> : (
        <Table>
          <thead><tr><Th>Invoice</Th><Th>Customer</Th><Th>Date</Th><Th>Items</Th><Th>Status</Th><Th>Total</Th><Th>Action</Th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {sales.map((sale) => (
              <tr key={sale._id}>
                <Td className="font-bold text-slate-950">{sale.invoiceNo}</Td>
                <Td>{typeof sale.customer === "string" ? "—" : sale.customer.name}</Td>
                <Td>{formatDate(sale.saleDate)}</Td>
                <Td>{sale.items.map((item) => `${typeof item.product === "string" ? "Product" : item.product.name} × ${item.quantity}`).join(", ")}</Td>
                <Td><Badge tone={sale.paymentStatus === "paid" ? "green" : sale.paymentStatus === "partial" ? "amber" : "red"}>{sale.paymentStatus}</Badge></Td>
                <Td className="font-bold">{formatCurrency(sale.totalAmount)}</Td>
                <Td>
                  <div className="flex gap-2">
                    <Link to={`/sales/${sale._id}/invoice`}><Button variant="secondary" className="h-9 px-3"><FileText size={15} /></Button></Link>
                    <Button variant="secondary" className="h-9 px-3" onClick={() => start(sale)}><Edit size={15} /></Button>
                    <Button variant="danger" className="h-9 px-3" onClick={() => remove(sale._id)}><Trash2 size={15} /></Button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal open={open} title={editing ? "Edit Sale" : "New Sale"} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="grid gap-4">
          {error && <div className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">Customer
              <select className="h-10 rounded-xl border border-slate-200 bg-white px-3" value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} required>
                <option value="">Select customer</option>{customers.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </label>
            <Input label="Sale Date" type="date" value={form.saleDate} onChange={(e) => setForm({ ...form, saleDate: e.target.value })} />
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">Product
              <select className="h-10 rounded-xl border border-slate-200 bg-white px-3" value={form.product} onChange={(e) => selectProduct(e.target.value)} required>
                <option value="">Select product</option>{products.map((p) => <option key={p._id} value={p._id}>{p.name} ({p.stock} in stock)</option>)}
              </select>
            </label>
            <Input label="Quantity" type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
            <Input label="Unit Price" type="number" min={0} value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) })} />
            <Input label="Paid Amount" type="number" min={0} value={form.paidAmount} onChange={(e) => setForm({ ...form, paidAmount: Number(e.target.value) })} />
          </div>
          <Input label="Note" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          <div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700">Total: {formatCurrency(form.quantity * form.unitPrice)}</div>
          <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button>{editing ? "Update Sale" : "Save Sale"}</Button></div>
        </form>
      </Modal>
    </Card>
  );
}
