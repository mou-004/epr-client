import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card } from "../components/ui/Card";
import { Table, Td, Th } from "../components/ui/Table";

export default function Reports() {
  const [report, setReport] = useState<any>(null);
  const [type, setType] = useState("products");

  useEffect(() => {
    api.get(`/reports/${type}`).then(setReport);
  }, [type]);

  if (!report) {
    return <p className="p-4">Loading...</p>;
  }

  return (
    <div className="p-4 grid gap-4">

      {/* Buttons */}
      <div className="flex flex-wrap gap-2">
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

      {/* Table */}
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
