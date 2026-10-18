/* eslint-disable react-refresh/only-export-components */

import MemberAuthGuard from '../../../components/members/MemberAuthGuard';
import MemberDashboard from '../../../components/members/MemberDashboard';

export const metadata = {
  title: 'Member Dashboard - IEEE Student Branch GEHU',
  robots: { index: false, follow: false },
};

export default function MemberDashboardPage() {
  return <MemberAuthGuard><MemberDashboard /></MemberAuthGuard>;
}
