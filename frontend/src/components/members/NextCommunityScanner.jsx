'use client';

import { useRouter } from 'next/navigation';
import MemberQrScanner from './MemberQrScanner';

const NextCommunityScanner = () => {
  const router = useRouter();
  return <MemberQrScanner onNavigate={path => router.push(path)} />;
};

export default NextCommunityScanner;
