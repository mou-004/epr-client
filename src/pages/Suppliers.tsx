import { useEffect, useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardHeader } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Spinner } from "../components/ui/Spinner";
import { Table, Td, Th } from "../components/ui/Table";
import { api } from "../lib/api";
import type { Supplier } from "../types";

type Form = Omit<Supplier, "_id">;
const emptyForm: Form = { name: "", company: "", email: "", phone: "", address: "", openingBalance: 0 };

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [form, setForm] = useState<Form>(emptyForm);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setSuppliers(await api.get<Supplier[]>("/suppliers"));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const start = (supplier?: Supplier) => {
    setEditing(supplier || null);
    setForm(supplier ? { name: supplier.name, company: supplier.company || "", email: supplier.email || "", phone: supplier.phone || "", address: supplier.address || "", openingBalance: supplier.openingBalance || 0 } : emptyForm);
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) await api.put(`/suppliers/${editing._id}`, form);
    else await api.post("/suppliers", form);
    setOpen(false);
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this supplier?")) return;
    await api.delete(`/suppliers/${id}`);
    await load();
  };

  return (
    <Card>
      <CardHeader title="Suppliers" description="Full supplier CRUD and contact records" action={<Button onClick={() => start()}><Plus size={16} /> Add Supplier</Button>} />
      {loading ? <div className="grid min-h-64 place-items-center"><Spinner /></div> : (
        <Table>
          <thead><tr><Th>Name</Th><Th>Company</Th><Th>Email</Th><Th>Phone</Th><Th>Address</Th><Th>Action</Th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {suppliers.map((supplier) => (
              <tr key={supplier._id}>
                <Td className="font-bold text-slate-950">{supplier.name}</Td>
                <Td>{supplier.company || "—"}</Td>
                <Td>{supplier.email || "—"}</Td>
                <Td>{supplier.phone || "—"}</Td>
                <Td>{supplier.address || "—"}</Td>
                <Td><div className="flex gap-2"><Button variant="secondary" className="h-9 px-3" onClick={() => start(supplier)}><Edit size={15} /></Button><Button variant="danger" className="h-9 px-3" onClick={() => remove(supplier._id)}><Trash2 size={15} /></Button></div></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Modal open={open} title={editing ? "Edit Supplier" : "Add Supplier"} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="Opening Balance" type="number" value={form.openingBalance} onChange={(e) => setForm({ ...form, openingBalance: Number(e.target.value) })} />
            <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button>{editing ? "Update" : "Create"}</Button></div>
        </form>
      </Modal>
    </Card>
  );
}
