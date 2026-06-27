import { useEffect, useState } from "react";
import axios from "axios";

export default function Reports() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/stats")
      .then((res) => {
        setData(res.data);
      });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Reports Center</h1>

      <p>Products: {data?.products || 0}</p>
      <p>Customers: {data?.customers || 0}</p>
      <p>Suppliers: {data?.suppliers || 0}</p>
      <p>Purchases: {data?.purchases || 0}</p>
      <p>Sales: {data?.sales || 0}</p>
      <p>Revenue: {data?.revenue || 0}</p>
    </div>
  );
}
