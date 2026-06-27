import { useEffect, useState } from "react";
import { Download, Printer } from "lucide-react";
import { api } from "../lib/api";
import { Card } from "../components/ui/Card";
import { Table, Td, Th } from "../components/ui/Table";

export default function Reports() {
  const [report, setReport] = useState<any>(null);
  const [type, setType] = useState("products");

  useEffect(() => {
    api.get(`/reports/${type}`).then(setReport);
  }, [type]);

  const exportData = () => {
    if (!report) return;

    const blob = new Blob(
      [JSON.stringify(report.data, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `${type}-report.json`;
    a.click();

    URL.revokeObjectURL(url);
  };

  if (!report) {
    return <p className="p-4">Loading...</p>;
  }

  return (
    <div className="p-4 grid gap-4">

      {/* BUTTONS */}
      <div className="flex flex-wrap gap-2 items-center justify-between">

        <div className="flex gap-2 flex-wrap">
          {["products", "customers", "suppliers", "purchases", "sales"].map(
            (t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-3 py-1 rounded ${
                  type === t ? "bg-black text-white" : "bg-gray-200"
                }`}
              >
                {t}
              </button>
            )
          )}
        </div>

        {/* EXPORT + PRINT */}
        <div className="flex gap-2">
          <button
            onClick={exportData}
            className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded"
          >
            <Download size={16} />
            Export
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1 px-3 py-1 bg-black text-white rounded"
          >
            <Printer size={16} />
            Print
          </button>
        </div>

      </div>

      {/* TABLE */}
      <Card className="overflow-x-auto">
        <Table>
          <thead>
            <tr>
              {Object.keys(report.data[0] || {}).map((key) => (
                <Th key={key}>{key}</Th>
              ))}
            </tr>
          </thead>

          <tbody>
            {report.data.map((item: any, i: number) => (
              <tr key={i}>
                {Object.values(item).map((val: any, j: number) => (
                  <Td key={j}>{String(val)}</Td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

    </div>
  );
}
