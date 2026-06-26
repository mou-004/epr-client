import {
  BarChart3,
  Boxes,
  ChevronRight,
  FileText,
  LayoutDashboard,
  LogOut,
  ShoppingBag,
  ShoppingCart,
  Truck,
  Users
} from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";
import { Button } from "../ui/Button";

const nav = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Products", to: "/products", icon: Boxes },
  { label: "Customers", to: "/customers", icon: Users },
  { label: "Suppliers", to: "/suppliers", icon: Truck },
  { label: "Purchases", to: "/purchases", icon: ShoppingCart },
  { label: "Sales", to: "/sales", icon: ShoppingBag },
  { label: "Reports", to: "/reports", icon: FileText }
];

const titles: Record<string, string> = {
  "/": "Executive Dashboard",
  "/products": "Product Management",
  "/customers": "Customer Management",
  "/suppliers": "Supplier Management",
  "/purchases": "Purchase Management",
  "/sales": "Sales Management",
  "/reports": "Reports Center"
};

export const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const title = titles[location.pathname] || (location.pathname.includes("invoice") ? "Invoice" : "Mini ERP");

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-white/90 px-5 py-6 backdrop-blur lg:block">
        <div className="flex items-center gap-3 px-2">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white">
            <BarChart3 size={22} />
          </div>
          <div>
            <p className="text-lg font-black text-slate-950">Mini ERP</p>
            <p className="text-xs font-medium text-slate-500">Mongo + React</p>
          </div>
        </div>

        <nav className="mt-8 grid gap-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "group flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition",
                  isActive ? "bg-slate-950 text-white shadow-lg shadow-slate-950/15" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                )
              }
            >
              <span className="flex items-center gap-3">
                <item.icon size={18} /> {item.label}
              </span>
              <ChevronRight size={16} className="opacity-50" />
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-slate-50/85 px-4 py-4 backdrop-blur md:px-8 no-print">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Welcome back, {user?.name || "Admin"}</p>
              <h1 className="text-2xl font-black tracking-tight text-slate-950">{title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-2 text-right md:block">
                <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <Button variant="secondary" onClick={logout}>
                <LogOut size={16} /> Logout
              </Button>
            </div>
          </div>
        </header>
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
