import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
// Verification Comment: Ensuring CI/CD pipeline triggers correctly on PR
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import VisionMission from './components/VisionMission';
import Events from './components/Events';
import ExecTeam from './components/ExecTeam';
import FacultyCounselor from './components/FacultyCounselor';
import FacultyCoordinators from './components/FacultyCoordinators';
import ShapeFuture from './components/ShapeFuture';
import Contact from './components/Contact';
import Footer from './components/Footer';

// Page Components
import EventsArchive from './pages/EventsArchive';

// Admin Components
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminLayout from './components/admin/AdminLayout';
import EventsManage from './pages/admin/EventsManage';
import TeamManage from './pages/admin/TeamManage';
import FacultyManage from './pages/admin/FacultyManage';
import MemberProfile from './components/members/MemberProfile';
import LegalPage from './components/legal/LegalPage';
import TeamsArchive from './components/members/TeamsArchive';
import MemberLogin from './components/members/MemberLogin';
import MemberActivation from './components/members/MemberActivation';
import MemberDashboard from './components/members/MemberDashboard';
import MemberAuthGuard from './components/members/MemberAuthGuard';
import CommunityScanner from './pages/CommunityScanner';

const LandingPage = () => (
    <div className="theme-public bg-mesh min-h-screen">
    <Navbar />
    <Hero />
    <VisionMission />
    <FacultyCounselor />
    <FacultyCoordinators />
    <ExecTeam />
    <Events />
    <ShapeFuture />
    <Contact />
    <Footer />
  </div>
);


const ProtectedRoute = ({ children }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  if (!token) return <Navigate to="/admin/login" />;
  return children;
};

const LegacyTeamsRoute = () => {
  const location = useLocation();
  return <Navigate to={{ pathname: '/community', search: location.search, hash: location.hash }} replace />;
};

function App() {
  return (
    <div className="site-surface font-body min-h-screen">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/events" element={<EventsArchive />} />
        <Route path="/community" element={<TeamsArchive />} />
        <Route path="/community/scan" element={<CommunityScanner />} />
        <Route path="/teams" element={<LegacyTeamsRoute />} />
        <Route path="/members/:memberId" element={<MemberProfileRoute />} />
        <Route path="/member/login" element={<MemberLogin />} />
        <Route path="/member/activate" element={<MemberActivation />} />
        <Route path="/member/dashboard" element={<MemberAuthGuard><MemberDashboard /></MemberAuthGuard>} />
        <Route path="/privacy" element={<LegalPage kind="privacy" />} />
        <Route path="/terms" element={<LegalPage kind="terms" />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Routes>
                  <Route index element={<AdminDashboard />} />
                  <Route path="events" element={<EventsManage />} />
                  <Route path="faculty" element={<FacultyManage />} />
                  <Route path="team" element={<TeamManage />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}

function MemberProfileRoute() {
  const { memberId = '' } = useParams();
  return <MemberProfile memberId={memberId} />;
}

export default App
