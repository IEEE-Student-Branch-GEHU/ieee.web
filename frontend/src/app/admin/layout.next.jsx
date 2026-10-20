import AdminAuthGuard from '../../components/admin-next/AdminAuthGuard';
import AdminLayoutNext from '../../components/admin-next/AdminLayoutNext';

export default function AdminLayout({ children }) {
  return (
    <AdminAuthGuard>
      <AdminLayoutNext>{children}</AdminLayoutNext>
    </AdminAuthGuard>
  );
}
