import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Events from './components/Events';
import ExecTeam from './components/ExecTeam';

function App() {
  return (
    <div className="bg-light text-dark font-body min-h-screen">
      <Navbar />
      <Hero />
      <Events />
      <ExecTeam />

      {/* Footer Placeholder */}
      <footer className="bg-dark text-white py-12 border-t border-gray-800">
        <div className="container mx-auto px-6 text-center">
          <div className="flex justify-center gap-6 mb-8">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Instagram</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
          </div>
          <p className="opacity-60">&copy; 2026 IEEE Student Branch GEHU Dehradun. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
