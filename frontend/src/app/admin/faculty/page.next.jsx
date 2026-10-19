/* eslint-disable react-refresh/only-export-components */

import AdminTeamNext from '../../../components/admin-next/AdminTeamNext';

export const metadata = {
  title: 'Manage Faculty - IEEE Student Branch GEHU',
  robots: { index: false, follow: false },
};

export default function AdminFacultyPage() {
  return <AdminTeamNext facultyOnly />;
}
