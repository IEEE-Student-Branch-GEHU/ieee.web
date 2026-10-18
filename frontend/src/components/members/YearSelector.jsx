import { useId } from 'react';

export const ALL_YEARS = 'all';

const YEAR_PATTERN = /^\d{4}-\d{4}$/;

const normalizeYears = (years) => Array.from(new Set(
  (Array.isArray(years) ? years : [])
    .filter((year) => typeof year === 'string' && YEAR_PATTERN.test(year)),
)).sort((left, right) => right.localeCompare(left));

const YearSelector = ({ years = [], value = ALL_YEARS, onChange, disabled = false }) => {
  const generatedId = useId();
  const id = 'team-year-selector';
  const descriptionId = `${generatedId}-description`;
  const normalizedYears = normalizeYears(years);
  const optionValues = [ALL_YEARS, ...normalizedYears];
  const selectedValue = optionValues.includes(value) ? value : ALL_YEARS;

  const handleKeyDown = (event) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;

    const currentIndex = Math.max(optionValues.indexOf(selectedValue), 0);
    const nextIndex = event.key === 'ArrowDown'
      ? Math.min(currentIndex + 1, optionValues.length - 1)
      : event.key === 'ArrowUp'
        ? Math.max(currentIndex - 1, 0)
        : event.key === 'Home'
          ? 0
          : optionValues.length - 1;

    if (nextIndex === currentIndex) return;

    event.preventDefault();
    onChange(optionValues[nextIndex]);
  };

  return (
    <div className="min-w-0">
      <label htmlFor={id} className="site-text block text-sm font-semibold">
        Team year
      </label>
      <select
        id={id}
        name="year"
        value={selectedValue}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        aria-describedby={descriptionId}
        className="site-panel site-border site-text mt-2 min-h-11 w-full rounded-xl border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary disabled:cursor-wait disabled:opacity-60"
      >
        <option value={ALL_YEARS}>All years (including undated members)</option>
        {normalizedYears.map((year) => <option key={year} value={year}>{year}</option>)}
      </select>
      <p id={descriptionId} className="site-muted mt-2 text-xs leading-5">
        Use the arrow keys to change years.
      </p>
    </div>
  );
};

export default YearSelector;
