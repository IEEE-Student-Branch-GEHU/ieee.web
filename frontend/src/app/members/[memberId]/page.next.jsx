import MemberProfile from '../../../components/members/MemberProfile';

export default async function MemberProfilePage({ params }) {
  const { memberId } = await params;
  return <MemberProfile memberId={memberId} />;
}
