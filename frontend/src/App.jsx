import Navbar from './components/Navbar';
import Hero from './components/Hero';

function App() {
  return (
    <div className="bg-light text-dark font-body min-h-screen">
      <Navbar />
      <Hero />

      {/* Content Section Placeholder */}
      <section id="events" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-dark font-sans">Upcoming Events</h2>
            <div className="w-24 h-1 bg-secondary mx-auto rounded-full"></div>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Discover the latest workshops, seminars, and technical competitions organized by our student branch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/80 to-secondary/80 flex items-center justify-center text-white font-bold text-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    View Details
                  </div>
                  <img src={`https://picsum.photos/seed/${item}/800/600`} alt="Event" className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-blue-50 text-primary text-xs font-bold rounded-full uppercase tracking-wider">Technical</span>
                    <span className="text-gray-500 text-sm">March 15, 2026</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">AI & Machine Learning Workshop</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">Join us for a hands-on session on the latest trends in Artificial Intelligence and Neural Networks.</p>
                  <a href="#" className="font-medium text-primary hover:text-secondary inline-flex items-center gap-1">
                    Register Now &rarr;
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Placeholder */}
      <footer className="bg-dark text-white py-12 border-t border-gray-800">
        <div className="container mx-auto px-6 text-center">
          <p className="opacity-60">&copy; 2026 IEEE Student Branch GEHU Dehradun. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
