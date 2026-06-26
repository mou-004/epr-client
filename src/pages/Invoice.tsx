import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Spinner } from "../components/ui/Spinner";
import { Table, Td, Th } from "../components/ui/Table";
import { api } from "../lib/api";
import { formatCurrency, formatDate } from "../lib/utils";
import type { Sale } from "../types";

export default function Invoice() {
  const { id } = useParams();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get<Sale>(`/sales/${id}`).then(setSale).finally(() => setLoading(false));
  }, [id]);

  if (loading || !sale) return <div className="grid min-h-[50vh] place-items-center"><Spinner /></div>;
  const customer = typeof sale.customer === "string" ? null : sale.customer;
  const due = sale.totalAmount - sale.paidAmount;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-5 flex items-center justify-between no-print">
        <Link to="/sales"><Button variant="secondary"><ArrowLeft size={16} /> Back to Sales</Button></Link>
        <Button onClick={() => window.print()}><Printer size={16} /> Print Invoice</Button>
      </div>

      <Card className="bg-white p-10 shadow-none print:border-0">
        <div className="flex flex-col justify-between gap-8 border-b border-slate-200 pb-8 md:flex-row">
          <div>
            <h1 className="text-4xl font-black text-slate-950">INVOICE</h1>
            <p className="mt-2 text-slate-500">Invoice No: <span className="font-bold text-slate-800">{sale.invoiceNo}</span></p>
            <p className="text-slate-500">Date: <span className="font-bold text-slate-800">{formatDate(sale.saleDate)}</span></p>
          </div>
          <div className="text-left md:text-right">
            <h2 className="text-2xl font-black text-slate-950">Mini ERP</h2>
            <p className="mt-2 text-sm text-slate-500">Professional Inventory & Sales Management</p>
            <p className="text-sm text-slate-500">support@example.com</p>
          </div>
        </div>

        <div className="grid gap-6 py-8 md:grid-cols-2">
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Bill To</p>
            <h3 className="mt-2 text-xl font-black text-slate-950">{customer?.name || "Customer"}</h3>
            <p className="text-sm text-slate-500">{customer?.company}</p>
            <p className="text-sm text-slate-500">{customer?.email}</p>
            <p className="text-sm text-slate-500">{customer?.phone}</p>
            <p className="text-sm text-slate-500">{customer?.address}</p>
          </div>
          <div className="rounded-3xl bg-slate-950 p-5 text-white">
            <p className="text-sm font-bold uppercase tracking-wide text-slate-400">Invoice Summary</p>
            <div className="mt-4 grid gap-2 text-sm">
              <div className="flex justify-between"><span>Total</span><strong>{formatCurrency(sale.totalAmount)}</strong></div>
              <div className="flex justify-between"><span>Paid</span><strong>{formatCurrency(sale.paidAmount)}</strong></div>
              <div className="flex justify-between border-t border-white/15 pt-2 text-lg"><span>Due</span><strong>{formatCurrency(due)}</strong></div>
            </div>
          </div>
        </div>

        <Table>
          <thead><tr><Th>Product</Th><Th>SKU</Th><Th>Qty</Th><Th>Unit Price</Th><Th>Total</Th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {sale.items.map((item, index) => {
              const product = typeof item.product === "string" ? null : item.product;
              return (
                <tr key={`${product?._id || index}`}>
                  <Td className="font-bold text-slate-950">{product?.name || "Product"}</Td>
                  <Td>{product?.sku || "—"}</Td>
                  <Td>{item.quantity}</Td>
                  <Td>{formatCurrency(item.unitPrice || 0)}</Td>
                  <Td className="font-bold">{formatCurrency(item.lineTotal)}</Td>
                </tr>
              );
            })}
          </tbody>
        </Table>

        <div className="mt-8 flex justify-end">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 p-5">
            <div className="flex justify-between py-2"><span>Subtotal</span><strong>{formatCurrency(sale.totalAmount)}</strong></div>
            <div className="flex justify-between py-2"><span>Paid</span><strong>{formatCurrency(sale.paidAmount)}</strong></div>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-xl"><span className="font-black">Balance Due</span><strong>{formatCurrency(due)}</strong></div>
          </div>
        </div>

        {sale.note && <p className="mt-8 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Note: {sale.note}</p>}
      </Card>
    </div>
  );
}
