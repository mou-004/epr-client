import { useEffect, useState } from "react";
import {
  Boxes,
  DollarSign,
  ShoppingBag,
  ShoppingCart,
  Truck,
  Users
} from "lucide-react";

import { Badge } from "../components/ui/Badge";
import { Card, CardHeader } from "../components/ui/Card";
import { Spinner } from "../components/ui/Spinner";
import { Table, Td, Th } from "../components/ui/Table";
import { api } from "../lib/api";
import { formatCurrency, formatDate } from "../lib/utils";
import type { Product, Purchase, Sale } from "../types";

type DashboardData = {
  stats: {
    totalProducts: number;
    totalCustomers: number;
    totalSuppliers: number;
    totalPurchases: number;
    totalSales: number;
    revenue: number;
    paidRevenue: number;
    purchaseCost: number;
  };
  lowStockProducts: Product[];
  recentSales: Sale[];
  recentPurchases: Purchase[];
};

const statCards = [
  ["totalProducts", "Products", Boxes],
  ["totalCustomers", "Customers", Users],
  ["totalSuppliers", "Suppliers", Truck],
  ["totalPurchases", "Purchases", ShoppingCart],
  ["totalSales", "Sales", ShoppingBag],
  ["revenue", "Revenue", DollarSign]
] as const;

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<DashboardData>("/dashboard")
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data)
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Spinner />
      </div>
    );

  return (
    <div className="grid gap-6 p-3 md:p-6">

      {/* STATS GRID */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map(([key, label, Icon]) => {
          const value = data.stats[key];

          return (
            <Card key={key} className="p-4 md:p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-500">
                    {label}
                  </p>

                  <p className="mt-2 text-xl md:text-3xl font-black text-slate-950 break-words">
                    {key === "revenue"
                      ? formatCurrency(value)
                      : value}
                  </p>
                </div>

                <div className="grid h-10 w-10 md:h-12 md:w-12 place-items-center rounded-2xl bg-slate-950 text-white shrink-0">
                  <Icon size={20} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* MIDDLE SECTION */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">

        {/* RECENT SALES */}
        <Card className="xl:col-span-2 overflow-x-auto">
          <CardHeader
            title="Recent Sales"
            description="Latest invoices and customer orders"
          />

          <div className="overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <Th>Invoice</Th>
                  <Th>Customer</Th>
                  <Th>Date</Th>
                  <Th>Status</Th>
                  <Th>Total</Th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {data.recentSales.map((sale) => (
                  <tr key={sale._id}>
                    <Td className="font-bold text-slate-950">
                      {sale.invoiceNo}
                    </Td>
                    <Td>
                      {typeof sale.customer === "string"
                        ? "—"
                        : sale.customer.name}
                    </Td>
                    <Td>{formatDate(sale.saleDate)}</Td>
                    <Td>
                      <Badge
                        tone={
                          sale.paymentStatus === "paid"
                            ? "green"
                            : sale.paymentStatus === "partial"
                            ? "amber"
                            : "red"
                        }
                      >
                        {sale.paymentStatus}
                      </Badge>
                    </Td>
                    <Td className="font-bold">
                      {formatCurrency(sale.totalAmount)}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>

        {/* LOW STOCK */}
        <Card className="p-4 md:p-5">
          <CardHeader
            title="Low Stock"
            description="Products at or below minimum stock"
          />

          <div className="grid gap-3">
            {data.lowStockProducts.length === 0 && (
              <p className="text-sm text-slate-500">
                No low-stock products.
              </p>
            )}

            {data.lowStockProducts.map((product) => (
              <div
                key={product._id}
                className="rounded-2xl border border-slate-200 p-3 md:p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-950 truncate">
                      {product.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      SKU {product.sku}
                    </p>
                  </div>

                  <Badge tone={product.stock === 0 ? "red" : "amber"}>
                    {product.stock} left
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* PURCHASES */}
      <Card className="overflow-x-auto">
        <CardHeader
          title="Recent Purchases"
          description="Latest supplier purchase entries"
        />

        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <Th>Reference</Th>
                <Th>Supplier</Th>
                <Th>Date</Th>
                <Th>Total</Th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {data.recentPurchases.map((purchase) => (
                <tr key={purchase._id}>
                  <Td className="font-bold text-slate-950">
                    {purchase.referenceNo || "—"}
                  </Td>
                  <Td>
                    {typeof purchase.supplier === "string"
                      ? "—"
                      : purchase.supplier.name}
                  </Td>
                  <Td>{formatDate(purchase.purchaseDate)}</Td>
                  <Td className="font-bold">
                    {formatCurrency(purchase.totalAmount)}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>

    </div>
  );
}
