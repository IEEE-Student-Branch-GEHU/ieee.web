import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Events from './components/Events';
import ExecTeam from './components/ExecTeam';
import FacultyCounselor from './components/FacultyCounselor';
import Footer from './components/Footer';

function App() {
  return (
    <div className="bg-light text-dark font-body min-h-screen">
      <Navbar />
      <Hero />
      <FacultyCounselor />
      <Events />
      <ExecTeam />
      <Footer />
    </div>
  )
}

export default App
