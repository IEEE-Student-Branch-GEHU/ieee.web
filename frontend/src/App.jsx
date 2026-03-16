import { Routes, Route, Navigate } from 'react-router-dom';
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

// Admin Components
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminLayout from './components/admin/AdminLayout';
import EventsManage from './pages/admin/EventsManage';
import TeamManage from './pages/admin/TeamManage';
import FacultyManage from './pages/admin/FacultyManage';

const LandingPage = () => (
  <div className="bg-mesh min-h-screen">
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
  const token = localStorage.getItem('adminToken');
  if (!token) return <Navigate to="/admin/login" />;
  return children;
};

function App() {
  return (
    <div className="bg-light text-dark font-body min-h-screen">
      <Routes>
        <Route path="/" element={<LandingPage />} />
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

export default App
