import { useEffect, useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardHeader } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Spinner } from "../components/ui/Spinner";
import { Table, Td, Th } from "../components/ui/Table";
import { api } from "../lib/api";
import type { Customer } from "../types";

type Form = Omit<Customer, "_id">;
const emptyForm: Form = { name: "", company: "", email: "", phone: "", address: "", openingBalance: 0 };

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState<Form>(emptyForm);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setCustomers(await api.get<Customer[]>("/customers"));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const start = (customer?: Customer) => {
    setEditing(customer || null);
    setForm(customer ? { name: customer.name, company: customer.company || "", email: customer.email || "", phone: customer.phone || "", address: customer.address || "", openingBalance: customer.openingBalance || 0 } : emptyForm);
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) await api.put(`/customers/${editing._id}`, form);
    else await api.post("/customers", form);
    setOpen(false);
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this customer?")) return;
    await api.delete(`/customers/${id}`);
    await load();
  };

  return (
    <Card>
      <CardHeader title="Customers" description="Full customer records and contact details" action={<Button onClick={() => start()}><Plus size={16} /> Add Customer</Button>} />
      {loading ? <div className="grid min-h-64 place-items-center"><Spinner /></div> : (
        <Table>
          <thead><tr><Th>Name</Th><Th>Company</Th><Th>Email</Th><Th>Phone</Th><Th>Address</Th><Th>Action</Th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((customer) => (
              <tr key={customer._id}>
                <Td className="font-bold text-slate-950">{customer.name}</Td>
                <Td>{customer.company || "—"}</Td>
                <Td>{customer.email || "—"}</Td>
                <Td>{customer.phone || "—"}</Td>
                <Td>{customer.address || "—"}</Td>
                <Td><div className="flex gap-2"><Button variant="secondary" className="h-9 px-3" onClick={() => start(customer)}><Edit size={15} /></Button><Button variant="danger" className="h-9 px-3" onClick={() => remove(customer._id)}><Trash2 size={15} /></Button></div></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Modal open={open} title={editing ? "Edit Customer" : "Add Customer"} onClose={() => setOpen(false)}>
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
