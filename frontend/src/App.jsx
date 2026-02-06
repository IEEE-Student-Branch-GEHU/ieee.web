import Header from './components/Header';
import Hero from './components/Hero';
import VisionMission from './components/VisionMission';
import Events from './components/Events';
import ExecTeam from './components/ExecTeam';
import FacultyCounselor from './components/FacultyCounselor';
import ShapeFuture from './components/ShapeFuture';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  return (
    <div className="bg-light text-dark font-body min-h-screen">
      <Header />
      <Hero />
      <VisionMission />
      <FacultyCounselor />
      <ExecTeam />
      <Events />
      <ShapeFuture />
      <Contact />
      <Footer />
    </div>
  )
}

export default App
