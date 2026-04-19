import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../../config';
import './YearSelector.css';

const YearSelector = ({ selectedYear, onYearChange }) => {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/team/years`)
      .then(res => res.json())
      .then(data => {
        setYears(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch years:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (years.length > 0 && !selectedYear) {
      onYearChange(years[0]);
    }
  }, [years, selectedYear, onYearChange]);

  if (loading || years.length === 0) return null;

  return (
    <div className="year-history">
      <div className="year-history__header">
        <span className="year-history__line" />
        <h4 className="year-history__title">Archive Timeline</h4>
      </div>
      
      <div className="year-history__list">
        {years.map((year, index) => (
          <button
            key={year}
            onClick={() => onYearChange(year)}
            className={`year-item ${selectedYear === year ? 'year-item--active' : ''}`}
          >
            {/* Timeline Dot & Line */}
            <div className="year-item__timeline">
              <div className={`year-item__dot ${selectedYear === year ? 'year-item__dot--active' : ''}`} />
              {index !== years.length - 1 && <div className="year-item__connector" />}
            </div>

            {/* Label Content */}
            <div className="year-item__content">
              <span className="year-item__label">{year}</span>
              <AnimatePresence>
                {selectedYear === year && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="year-item__status"
                  >
                    Active Session
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default YearSelector;
