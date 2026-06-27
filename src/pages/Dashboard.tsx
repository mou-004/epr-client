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
    <div className="w-full max-w-full overflow-x-hidden px-3 sm:px-4 md:px-6 py-4 grid gap-6">

      {/* STATS RESPONSIVE GRID */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {statCards.map(([key, label, Icon]) => {
          const value = data.stats[key];

          return (
            <Card key={key} className="w-full p-3 sm:p-4 md:p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-slate-500">
                    {label}
                  </p>

                  <p className="text-lg sm:text-xl md:text-2xl font-black text-slate-950 truncate">
                    {key === "revenue"
                      ? formatCurrency(value)
                      : value}
                  </p>
                </div>

                <div className="h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12 grid place-items-center rounded-2xl bg-slate-950 text-white shrink-0">
                  <Icon size={18} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* MIDDLE GRID */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">

        {/* SALES TABLE */}
        <Card className="w-full xl:col-span-2 overflow-hidden">
          <CardHeader
            title="Recent Sales"
            description="Latest invoices and customer orders"
          />

          <div className="w-full overflow-x-auto">
            <div className="min-w-[650px]">
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
          </div>
        </Card>

        {/* LOW STOCK */}
        <Card className="w-full p-3 sm:p-4">
          <CardHeader
            title="Low Stock"
            description="Products at or below minimum stock"
          />

          <div className="flex flex-col gap-3">
            {data.lowStockProducts.length === 0 ? (
              <p className="text-sm text-slate-500">
                No low-stock products.
              </p>
            ) : (
              data.lowStockProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between gap-3 border rounded-xl p-3"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-slate-950 truncate">
                      {product.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      SKU {product.sku}
                    </p>
                  </div>

                  <Badge tone={product.stock === 0 ? "red" : "amber"}>
                    {product.stock}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>

      </div>

      {/* PURCHASE TABLE */}
      <Card className="w-full overflow-hidden">
        <CardHeader
          title="Recent Purchases"
          description="Latest supplier purchase entries"
        />

        <div className="w-full overflow-x-auto">
          <div className="min-w-[600px]">
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
        </div>
      </Card>

    </div>
  );
}
