import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchHotels, deleteHotel } from '../store/hotelSlice';
import HotelCard from '../components/HotelCard';
import FilterSidebar from '../components/FilterSidebar';
import Pagination from '../components/Pagination';
import PageBanner from '../components/PageBanner';
import Popup from '../components/Popup';
import ConfirmDialog from '../components/ConfirmDialog';
import Icon from '../components/Icons';

const LIMIT = 5;

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'title', label: 'Title: A to Z' },
  { value: 'oldest', label: 'Oldest first' },
];

export default function HotelList() {
  const dispatch = useDispatch();
  const { items, total, loading, error } = useSelector((s) => s.hotels);

  const [params, setParams] = useSearchParams();
  const search = params.get('search') || '';
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';
  const sort = params.get('sort') || 'newest';
  const view = params.get('view') === 'grid' ? 'grid' : 'list';
  const page = Math.max(1, Number(params.get('page')) || 1);

  const [popup, setPopup] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const update = (changes, { keepPage = false } = {}) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v === '' || v == null ? next.delete(k) : next.set(k, v)));
    if (!keepPage && !('page' in changes)) next.delete('page');
    setParams(next);
  };

  const load = () =>
    dispatch(fetchHotels({ search, minPrice, maxPrice, sort, limit: LIMIT, offset: (page - 1) * LIMIT }));

  useEffect(() => {
    load();
  }, [search, minPrice, maxPrice, sort, page]);

  const totalPages = Math.ceil(total / LIMIT);
  const hasFilters = Boolean(search || minPrice || maxPrice);

  const resetAll = () => {
    const next = new URLSearchParams();
    if (view === 'grid') next.set('view', 'grid');
    setParams(next);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await dispatch(deleteHotel(toDelete.id)).unwrap();
      setToDelete(null);
      setPopup('Hotel deleted successfully!');
      if (items.length === 1 && page > 1) update({ page: page - 1 }, { keepPage: true });
      else load();
    } catch {
      setToDelete(null);
      setPopup('');
      alert('Could not delete the hotel. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const from = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const to = Math.min(page * LIMIT, total);

  return (
    <>
      <Helmet>
        <title>{search ? `"${search}" - Hotels` : 'Hotels'} | Hotel Hub</title>
        <meta
          name="description"
          content="Browse, search and filter hotels by title and price range. Find the perfect stay on Hotel Hub."
        />
        <meta property="og:title" content="Hotels | Hotel Hub" />
      </Helmet>

      <PageBanner
      title="Discover Your Next Stay"
      subtitle="Search, filter and manage all your hotels in one place."
      crumbs={[{ label: 'Hotels' }]}
      />

      <div className="wrap layout">
        <button className="btn btn-outline filter-toggle" onClick={() => setShowFilters((v) => !v)}>
          <Icon name="filter" size={16} /> {showFilters ? 'Hide filters' : 'Show filters'}
        </button>

        <div className={`sidebar-wrap ${showFilters ? 'open' : ''}`}>
          <FilterSidebar
            minPrice={minPrice}
            maxPrice={maxPrice}
            hasFilters={hasFilters}
            onApply={(c) => update(c)}
            onReset={resetAll}
          />
        </div>

        <section className="results">
          <div className="toolbar">
            <p className="count">
              <strong>{total}</strong> {total === 1 ? 'hotel' : 'hotels'} found
              {total > 0 && <span className="range"> · showing {from}–{to}</span>}
            </p>
            <div className="toolbar-right">
              <select
                aria-label="Sort hotels"
                value={sort}
                onChange={(e) => update({ sort: e.target.value === 'newest' ? '' : e.target.value })}
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div className="view-toggle" role="group" aria-label="Layout">
                <button className={view === 'list' ? 'active' : ''} aria-label="List view" onClick={() => update({ view: '' }, { keepPage: true })}>
                  <Icon name="list" />
                </button>
                <button className={view === 'grid' ? 'active' : ''} aria-label="Grid view" onClick={() => update({ view: 'grid' }, { keepPage: true })}>
                  <Icon name="grid" />
                </button>
              </div>
            </div>
          </div>

          {hasFilters && (
            <div className="active-filters">
              {search && (
                <span className="tag">Title: “{search}”
                  <button aria-label="Remove search filter" onClick={() => update({ search: '' })}><Icon name="x" size={12} /></button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="tag">
                  Price: ₹{minPrice || '0'} – {maxPrice ? `₹${maxPrice}` : 'any'}
                  <button aria-label="Remove price filter" onClick={() => update({ minPrice: '', maxPrice: '' })}><Icon name="x" size={12} /></button>
                </span>
              )}
            </div>
          )}

          {error ? (
            <div className="state">
              <p>{error}. Make sure the backend server is running.</p>
              <button className="btn btn-primary" onClick={load}>Try again</button>
            </div>
          ) : loading && items.length === 0 ? (
            <div className={`hotel-list ${view}`}>
              {Array.from({ length: 3 }).map((_, i) => <div className="skeleton" key={i} />)}
            </div>
          ) : items.length === 0 ? (
            <div className="state">
              <Icon name="building" size={42} />
              <h3>No hotels found</h3>
              <p>{hasFilters ? 'Try changing or clearing your filters.' : 'Add your first hotel to get started.'}</p>
              {hasFilters && <button className="btn btn-outline" onClick={resetAll}>Clear filters</button>}
            </div>
          ) : (
            <div className={`hotel-list ${view} ${loading ? 'is-loading' : ''}`}>
              {items.map((h) => (
                <HotelCard key={h.id} hotel={h} view={view} onDelete={setToDelete} />
              ))}
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} onChange={(p) => { update({ page: p === 1 ? '' : p }, { keepPage: true }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this hotel?"
        message={toDelete ? `“${toDelete.title}” and its image will be permanently removed.` : ''}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
      <Popup message={popup} onClose={() => setPopup('')} />
    </>
  );
}