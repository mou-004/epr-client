import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card } from "../components/ui/Card";
import { Spinner } from "../components/ui/Spinner";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get("/dashboard").then(setData);
  }, []);

  if (!data) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-4 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">

      <Card className="p-4">
        <p>Products</p>
        <h2 className="text-2xl font-bold">{data.stats.totalProducts}</h2>
      </Card>

      <Card className="p-4">
        <p>Customers</p>
        <h2 className="text-2xl font-bold">{data.stats.totalCustomers}</h2>
      </Card>

      <Card className="p-4">
        <p>Suppliers</p>
        <h2 className="text-2xl font-bold">{data.stats.totalSuppliers}</h2>
      </Card>

      <Card className="p-4">
        <p>Purchases</p>
        <h2 className="text-2xl font-bold">{data.stats.totalPurchases}</h2>
      </Card>

      <Card className="p-4">
        <p>Sales</p>
        <h2 className="text-2xl font-bold">{data.stats.totalSales}</h2>
      </Card>

      <Card className="p-4">
        <p>Revenue</p>
        <h2 className="text-2xl font-bold">
          ${data.stats.revenue}
        </h2>
      </Card>

    </div>
  );
}
