import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import VisionMission from '../components/VisionMission';
import FacultyCounselor from '../components/FacultyCounselor';
import FacultyCoordinators from '../components/FacultyCoordinators';
import ExecTeam from '../components/ExecTeam';
import Events from '../components/Events';
import ShapeFuture from '../components/ShapeFuture';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

export default function Homepage() {
  return (
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
}
