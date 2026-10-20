import { redirect } from 'next/navigation';

export default async function LegacyTeamsPage({ searchParams }) {
  const params = await searchParams;
  const query = new URLSearchParams(params || {}).toString();
  redirect(`/community${query ? `?${query}` : ''}`);
}
