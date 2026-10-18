/* eslint-disable react-refresh/only-export-components */

import LegalPage from '../../components/legal/LegalPage';

export const metadata = {
  title: 'Privacy Policy',
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return <LegalPage kind="privacy" />;
}
