export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type Product = {
  _id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  status: "active" | "inactive";
  createdAt?: string;
};

export type Customer = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  openingBalance?: number;
};

export type Supplier = Customer;

export type LineItem<TProduct = Product | string> = {
  product: TProduct;
  quantity: number;
  costPrice?: number;
  unitPrice?: number;
  lineTotal: number;
};

export type Purchase = {
  _id: string;
  supplier: Supplier | string;
  referenceNo?: string;
  purchaseDate: string;
  items: LineItem<Product>[];
  totalAmount: number;
  note?: string;
};

export type Sale = {
  _id: string;
  customer: Customer | string;
  invoiceNo: string;
  saleDate: string;
  items: LineItem<Product>[];
  totalAmount: number;
  paidAmount: number;
  paymentStatus: "paid" | "partial" | "unpaid";
  note?: string;
};
