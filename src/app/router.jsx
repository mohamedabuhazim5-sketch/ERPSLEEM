import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import AppShell from '../components/layout/AppShell';
import LoginPage from '../features/auth/LoginPage';
import DashboardPage from '../features/dashboard/DashboardPage';
import ProductsPage from '../features/products/ProductsPage';
import SalesPage from '../features/sales/SalesPage';
import SalesHistoryPage from '../features/sales/SalesHistoryPage';
import PurchasesPage from '../features/purchases/PurchasesPage';
import PurchasesHistoryPage from '../features/purchases/PurchasesHistoryPage';
import CustomersPage from '../features/customers/CustomersPage';
import CustomerStatementPage from '../features/customers/CustomerStatementPage';
import SuppliersPage from '../features/suppliers/SuppliersPage';
import SupplierStatementPage from '../features/suppliers/SupplierStatementPage';
import ExpensesPage from '../features/expenses/ExpensesPage';
import ReportsPage from '../features/reports/ReportsPage';
import ReceiptPage from '../features/finance/ReceiptPage';
import PaymentVoucherPage from '../features/finance/PaymentVoucherPage';
import AuditLogPage from '../features/audit/AuditLogPage';
import UsersPage from '../features/users/UsersPage';
import SettingsPage from '../features/settings/SettingsPage';
import AdminControlCenterPage from '../features/admin/AdminControlCenterPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'admin/control-center', element: <AdminControlCenterPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'sales', element: <SalesPage /> },
      { path: 'sales/history', element: <SalesHistoryPage /> },
      { path: 'purchases', element: <PurchasesPage /> },
      { path: 'purchases/history', element: <PurchasesHistoryPage /> },
      { path: 'customers', element: <CustomersPage /> },
      { path: 'customers/:id/statement', element: <CustomerStatementPage /> },
      { path: 'suppliers', element: <SuppliersPage /> },
      { path: 'suppliers/:id/statement', element: <SupplierStatementPage /> },
      { path: 'expenses', element: <ExpensesPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'finance/receipt', element: <ReceiptPage /> },
      { path: 'finance/payment-voucher', element: <PaymentVoucherPage /> },
      { path: 'audit-log', element: <AuditLogPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'settings', element: <SettingsPage /> }
    ],
  },
]);
