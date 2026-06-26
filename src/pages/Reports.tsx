import { useEffect, useState } from "react";
import { Download, Printer } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardHeader } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Spinner } from "../components/ui/Spinner";
import { Table, Td, Th } from "../components/ui/Table";
import { api } from "../lib/api";
import { formatCurrency, formatDate } from "../lib/utils";

type ReportType = "products" | "customers" | "suppliers" | "purchases" | "sales";

type ReportResponse = {
  title: string;
  total?: number;
  paid?: number;
  due?: number;
  data: any[];
};

const reportTypes: Array<{ key: ReportType; label: string }> = [
  { key: "products", label: "Product Report" },
  { key: "customers", label: "Customer Report" },
  { key: "suppliers", label: "Supplier Report" },
  { key: "purchases", label: "Purchase Report" },
  { key: "sales", label: "Sales Report" }
];

export default function Reports() {
  const [type, setType] = useState<ReportType>("products");
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const load = async () => {
    setLoading(true);
    const query = (type === "purchases" || type === "sales") ? `?start=${start}&end=${end}` : "";
    const data = await api.get<ReportResponse>(`/reports/${type}${query}`);
    setReport(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [type]);

  const exportCsv = () => {
    if (!report) return;
    const rows = report.data.map((item) => JSON.stringify(item));
    const blob = new Blob([rows.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}-report.jsonl`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderRows = () => {
    if (!report) return null;
    if (type === "products") return report.data.map((p) => <tr key={p._id}><Td className="font-bold text-slate-950">{p.name}</Td><Td>{p.sku}</Td><Td>{p.category}</Td><Td>{p.stock} {p.unit}</Td><Td>{formatCurrency(p.salePrice)}</Td></tr>);
    if (type === "customers" || type === "suppliers") return report.data.map((c) => <tr key={c._id}><Td className="font-bold text-slate-950">{c.name}</Td><Td>{c.company || "—"}</Td><Td>{c.email || "—"}</Td><Td>{c.phone || "—"}</Td><Td>{c.address || "—"}</Td></tr>);
    if (type === "purchases") return report.data.map((p) => <tr key={p._id}><Td className="font-bold text-slate-950">{p.referenceNo || "—"}</Td><Td>{p.supplier?.name || "—"}</Td><Td>{formatDate(p.purchaseDate)}</Td><Td>{p.items?.length || 0}</Td><Td>{formatCurrency(p.totalAmount)}</Td></tr>);
    return report.data.map((s) => <tr key={s._id}><Td className="font-bold text-slate-950">{s.invoiceNo}</Td><Td>{s.customer?.name || "—"}</Td><Td>{formatDate(s.saleDate)}</Td><Td>{s.paymentStatus}</Td><Td>{formatCurrency(s.totalAmount)}</Td></tr>);
  };

  const headers = type === "products" ? ["Name", "SKU", "Category", "Stock", "Sale Price"] :
    type === "customers" || type === "suppliers" ? ["Name", "Company", "Email", "Phone", "Address"] :
    type === "purchases" ? ["Reference", "Supplier", "Date", "Items", "Total"] :
    ["Invoice", "Customer", "Date", "Status", "Total"];

  return (
    <div className="grid gap-6">
      <Card className="no-print">
        <CardHeader title="Reports" description="Generate product, customer, supplier, purchase and sales reports" />
        <div className="flex flex-wrap gap-2">
          {reportTypes.map((item) => <Button key={item.key} variant={type === item.key ? "primary" : "secondary"} onClick={() => setType(item.key)}>{item.label}</Button>)}
        </div>
        {(type === "purchases" || type === "sales") && (
          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
            <Input label="Start Date" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            <Input label="End Date" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            <Button className="self-end" onClick={load}>Apply Filter</Button>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader
          title={report?.title || "Report"}
          description={report?.total !== undefined ? `Total: ${formatCurrency(report.total)}${report.paid !== undefined ? ` • Paid: ${formatCurrency(report.paid)} • Due: ${formatCurrency(report.due || 0)}` : ""}` : `${report?.data.length || 0} records`}
          action={<div className="flex gap-2 no-print"><Button variant="secondary" onClick={exportCsv}><Download size={16} /> Export</Button><Button onClick={() => window.print()}><Printer size={16} /> Print</Button></div>}
        />
        {loading || !report ? <div className="grid min-h-64 place-items-center"><Spinner /></div> : (
          <Table>
            <thead><tr>{headers.map((h) => <Th key={h}>{h}</Th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">{renderRows()}</tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
