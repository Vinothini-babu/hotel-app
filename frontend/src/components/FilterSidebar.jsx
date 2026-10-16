import { useEffect, useState } from 'react';
import Icon from './Icons';

const QUICK_RANGES = [
  { label: 'Under ₹2,000', min: '', max: '2000' },
  { label: '₹2,000 – ₹5,000', min: '2000', max: '5000' },
  { label: '₹5,000 – ₹10,000', min: '5000', max: '10000' },
  { label: 'Above ₹10,000', min: '10000', max: '' },
];

export default function FilterSidebar({ minPrice, maxPrice, onApply, onReset, hasFilters }) {
  const [min, setMin] = useState(minPrice);
  const [max, setMax] = useState(maxPrice);
  const [error, setError] = useState('');

  useEffect(() => { setMin(minPrice); setMax(maxPrice); setError(''); }, [minPrice, maxPrice]);

  const apply = (e) => {
    e.preventDefault();
    if (min !== '' && max !== '' && Number(min) > Number(max)) {
      setError('Min price cannot be greater than max price');
      return;
    }
    setError('');
    onApply({ minPrice: min, maxPrice: max });
  };

  const isActive = (r) => r.min === minPrice && r.max === maxPrice;

  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <h2><Icon name="filter" size={16} /> Filters</h2>
        {hasFilters && <button className="link-btn" onClick={onReset}>Clear all</button>}
      </div>

      <form onSubmit={apply} className="filter-block">
        <h3>Price range</h3>
        <div className="quick-ranges">
          {QUICK_RANGES.map((r) => (
            <button
              type="button"
              key={r.label}
              className={`chip ${isActive(r) ? 'active' : ''}`}
              onClick={() => onApply({ minPrice: r.min, maxPrice: r.max })}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="price-inputs">
          <label>
            Min
            <input type="number" min="0" placeholder="₹0" value={min} onChange={(e) => setMin(e.target.value)} />
          </label>
          <label>
            Max
            <input type="number" min="0" placeholder="₹10,000" value={max} onChange={(e) => setMax(e.target.value)} />
          </label>
        </div>
        {error && <span className="error">{error}</span>}
        <button type="submit" className="btn btn-outline btn-block">Apply</button>
      </form>
    </aside>
  );
}