import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import YearSelector from '../../components/archive/YearSelector';
import MemberCard from '../../components/archive/MemberCard';
import API_BASE_URL from '../../config';
import { Skeleton } from '../../components/ui/skeleton';
import ieeeLogo from '../../assets/logo.png';
import './LeadershipArchive.css';

const LeadershipArchive = () => {
  const [selectedYear, setSelectedYear] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = ['all', 'executive', 'technical', 'creative', 'management', 'member'];

  useEffect(() => {
    if (!selectedYear) return;
    const fetchMembers = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ year: selectedYear });
        if (activeCategory !== 'all') params.append('category', activeCategory);
        const res = await fetch(`${API_BASE_URL}/team?${params}`);
        if (!res.ok) throw new Error('Failed to fetch members');
        const data = await res.json();
        setMembers(data);
      } catch (err) {
        setError('Could not load members. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [selectedYear, activeCategory]);

  // Three-Tier Filter Logic
  const leads = members.filter(m => m.isLead);
  const coreMembers = members.filter(m => !m.isLead && m.category !== 'member');
  const generalMembers = members.filter(m => !m.isLead && m.category === 'member');

  return (
    <div className="la-root">
      {/* Navbar with official branding */}
      <nav className="la-nav">
        <Link to="/" className="la-nav__logo">
          <img src={ieeeLogo} alt="IEEE GEHU" className="la-nav__logo-img" />
        </Link>
        <div className="la-nav__links">
          <Link to="/events" className="la-nav__link">Events Archive</Link>
          <Link to="/" className="la-nav__back">
            Return to Home
          </Link>
        </div>
      </nav>

      {/* Structured Layout */}
      <div className="la-layout">
        {/* Lateral Sidebar (History Navigation) */}
        <aside className="la-sidebar">
          <div className="la-sidebar__label">Archive Explorer</div>
          <YearSelector selectedYear={selectedYear} onYearChange={setSelectedYear} />
        </aside>

        {/* Main Content Area */}
        <main className="la-content">
          <header className="la-header">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="la-header__title"
            >
              The <span className="la-header__highlight">Leadership</span> Chronicle
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="la-header__sub"
            >
              A professional directory of students and faculty who have shaped 
              the legacy of the IEEE Student Branch at GEHU Dehradun.
            </motion.p>
          </header>

          {/* Category Bar */}
          {selectedYear && (
            <div className="la-cat-bar">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`la-cat-btn ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat === 'all' ? 'All Roles' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          )}

          {/* Animated Transition Grid */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="la-grid"
              >
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="prof-card">
                    <Skeleton className="prof-card__img-container rounded-none" />
                    <div className="prof-card__content p-4 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : error ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="la-error"
              >
                <span>⚠</span> {error}
              </motion.div>
            ) : members.length === 0 && selectedYear ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="la-empty"
              >
                <div className="la-empty__icon">📑</div>
                <p>No records found for session <strong>{selectedYear}</strong> in this category.</p>
                <p className="la-empty__sub">Please select a different category or year.</p>
              </motion.div>
            ) : (
              <motion.div 
                key="content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Executive Section */}
                {leads.length > 0 && (
                  <section className="la-section">
                    <div className="la-section__header">
                      <h2 className="la-section__title">Executive Leads</h2>
                      <span className="la-section__line" />
                    </div>
                    <div className="la-grid">
                      {leads.map((member, i) => (
                        <MemberCard key={member._id} member={member} index={i} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Core Section */}
                {coreMembers.length > 0 && (
                  <section className="la-section">
                    <div className="la-section__header">
                      <h2 className="la-section__title">Core Committee</h2>
                      <span className="la-section__line" />
                    </div>
                    <div className="la-grid">
                      {coreMembers.map((member, i) => (
                        <MemberCard key={member._id} member={member} index={leads.length + i} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Volunteers Section */}
                {generalMembers.length > 0 && (
                  <section className="la-section">
                    <div className="la-section__header">
                      <h2 className="la-section__title">Student Volunteers</h2>
                      <span className="la-section__line" />
                    </div>
                    <div className="la-grid">
                      {generalMembers.map((member, i) => (
                        <MemberCard key={member._id} member={member} index={leads.length + coreMembers.length + i} />
                      ))}
                    </div>
                  </section>
                )}

                <p className="la-count">
                  Records Found: <strong>{members.length}</strong> profiles for {selectedYear}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Refined Footer */}
      <footer className="la-footer">
        <p>IEEE GEHU Student Branch &mdash; Historical Archive System</p>
        <p className="la-footer__copy">&copy; {new Date().getFullYear()} IEEE GEHU. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default LeadershipArchive;
