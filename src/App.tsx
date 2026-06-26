import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Spinner } from "./components/ui/Spinner";
import { useAuth } from "./context/AuthContext";
import Customers from "./pages/Customers";
import Dashboard from "./pages/Dashboard";
import Invoice from "./pages/Invoice";
import Login from "./pages/Login";
import Products from "./pages/Products";
import Purchases from "./pages/Purchases";
import Register from "./pages/Register";
import Reports from "./pages/Reports";
import Sales from "./pages/Sales";
import Suppliers from "./pages/Suppliers";

const Protected = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="grid min-h-screen place-items-center"><Spinner /></div>;
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicOnly = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center"><Spinner /></div>;
  return user ? <Navigate to="/" replace /> : <>{children}</>;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
      <Route element={<Protected><Layout /></Protected>}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="customers" element={<Customers />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="purchases" element={<Purchases />} />
        <Route path="sales" element={<Sales />} />
        <Route path="sales/:id/invoice" element={<Invoice />} />
        <Route path="reports" element={<Reports />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
