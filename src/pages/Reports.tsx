import { useEffect, useState } from "react";
import axios from "axios";

export default function Reports() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/stats").then((res) => {
      setData(res.data);
    });
  }, []);

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">📊 Reports Center</h1>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        <div className="p-4 rounded-xl shadow bg-white">
          <h2 className="text-gray-500">Products</h2>
          <p className="text-2xl font-bold">{data?.products || 0}</p>
        </div>

        <div className="p-4 rounded-xl shadow bg-white">
          <h2 className="text-gray-500">Customers</h2>
          <p className="text-2xl font-bold">{data?.customers || 0}</p>
        </div>

        <div className="p-4 rounded-xl shadow bg-white">
          <h2 className="text-gray-500">Suppliers</h2>
          <p className="text-2xl font-bold">{data?.suppliers || 0}</p>
        </div>

        <div className="p-4 rounded-xl shadow bg-white">
          <h2 className="text-gray-500">Purchases</h2>
          <p className="text-2xl font-bold">{data?.purchases || 0}</p>
        </div>

        <div className="p-4 rounded-xl shadow bg-white">
          <h2 className="text-gray-500">Sales</h2>
          <p className="text-2xl font-bold">{data?.sales || 0}</p>
        </div>

        <div className="p-4 rounded-xl shadow bg-green-50 border">
          <h2 className="text-gray-600">Revenue</h2>
          <p className="text-2xl font-bold text-green-600">
            ${data?.revenue || 0}
          </p>
        </div>

      </div>
    </div>
  );
}
