/* eslint-disable react-refresh/only-export-components */

import LegalPage from '../../components/legal/LegalPage';

export const metadata = {
  title: 'Terms and Conditions',
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return <LegalPage kind="terms" />;
}
