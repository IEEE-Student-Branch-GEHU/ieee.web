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
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-primary focus:shadow-lg">
        Skip to content
      </a>
      <Navbar />
      <main id="main-content">
        <Hero />
        <VisionMission />
        <FacultyCounselor />
        <FacultyCoordinators />
        <ExecTeam />
        <Events />
        <ShapeFuture />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
