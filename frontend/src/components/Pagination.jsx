import Icon from './Icons';

function buildPages(page, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) pages.push('…');
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push('…');
  pages.push(total);
  return pages;
}

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <nav className="pagination" aria-label="Pagination">
      <button disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
        <Icon name="chevronLeft" size={16} />
      </button>
      {buildPages(page, totalPages).map((p, i) =>
        p === '…' ? (
          <span key={`dots-${i}`} className="dots">…</span>
        ) : (
          <button
            key={p}
            className={p === page ? 'active' : ''}
            aria-current={p === page ? 'page' : undefined}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        )
      )}
      <button disabled={page === totalPages} onClick={() => onChange(page + 1)} aria-label="Next page">
        <Icon name="chevronRight" size={16} />
      </button>
    </nav>
  );
}