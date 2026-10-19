import { useNavigate } from 'react-router-dom';
import MemberQrScanner from '../components/members/MemberQrScanner';

const CommunityScanner = () => {
  const navigate = useNavigate();
  return <MemberQrScanner onNavigate={path => navigate(path)} />;
};

export default CommunityScanner;
