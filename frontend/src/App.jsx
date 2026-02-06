import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Events from './components/Events';
import ExecTeam from './components/ExecTeam';
import FacultyCounselor from './components/FacultyCounselor';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  return (
    <div className="bg-light text-dark font-body min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <FacultyCounselor />
      <Events />
      <ExecTeam />
      <Contact />
      <Footer />
    </div>
  )
}

export default App
