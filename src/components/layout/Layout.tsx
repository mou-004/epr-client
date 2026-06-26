import { useState } from "react";
import {
  BarChart3,
  Boxes,
  ChevronRight,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  ShoppingBag,
  ShoppingCart,
  Truck,
  Users,
  X,
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
  { label: "Reports", to: "/reports", icon: FileText },
];

const titles: Record<string, string> = {
  "/": "Executive Dashboard",
  "/products": "Product Management",
  "/customers": "Customer Management",
  "/suppliers": "Supplier Management",
  "/purchases": "Purchase Management",
  "/sales": "Sales Management",
  "/reports": "Reports Center",
};

export const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const title =
    titles[location.pathname] ||
    (location.pathname.includes("invoice") ? "Invoice" : "Mini ERP");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white px-5 py-6 shadow-2xl transition-transform duration-300 lg:z-40 lg:translate-x-0 lg:shadow-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between gap-3 px-2">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white">
              <BarChart3 size={22} />
            </div>
            <div>
              <p className="text-lg font-black text-slate-950">Mini ERP</p>
              <p className="text-xs font-medium text-slate-500">
                Mongo + React
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="mt-8 grid gap-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "group flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition",
                  isActive
                    ? "bg-slate-950 text-white shadow-lg shadow-slate-950/15"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                )
              }
            >
              <span className="flex items-center gap-3">
                <item.icon size={18} />
                {item.label}
              </span>
              <ChevronRight size={16} className="opacity-50" />
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-6 left-5 right-5 lg:hidden">
          <Button variant="secondary" onClick={logout} className="w-full">
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-slate-50/90 px-4 py-4 backdrop-blur no-print sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 lg:hidden"
              >
                <Menu size={22} />
              </button>

              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-500 sm:text-sm">
                  Welcome back, {user?.name || "Admin"}
                </p>
                <h1 className="truncate text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                  {title}
                </h1>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-2 text-right md:block">
                <p className="max-w-40 truncate text-sm font-bold text-slate-900">
                  {user?.name}
                </p>
                <p className="max-w-40 truncate text-xs text-slate-500">
                  {user?.email}
                </p>
              </div>

              <Button
                variant="secondary"
                onClick={logout}
                className="hidden sm:inline-flex"
              >
                <LogOut size={16} />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <div className="w-full overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
