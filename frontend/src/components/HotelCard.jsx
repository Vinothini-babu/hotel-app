import { Link, useNavigate } from 'react-router-dom';
import HotelImage from './HotelImage';
import Icon from './Icons';

export default function HotelCard({ hotel, onDelete, view = 'list' }) {
  const navigate = useNavigate();
  const snippet =
    hotel.description.length > 140 ? hotel.description.slice(0, 140).trim() + '…' : hotel.description;
  const stop = (e) => e.stopPropagation();

  return (
    <article
      className={`hotel-card ${view}`}
      onClick={() => navigate(`/hotel/${hotel.id}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/hotel/${hotel.id}`)}
      tabIndex={0}
    >
      <div className="hotel-media">
        <HotelImage path={hotel.image_path} alt={`${hotel.title} - hotel photo`} />
      </div>

      <div className="hotel-info">
        <h3><Link to={`/hotel/${hotel.id}`} onClick={stop}>{hotel.title}</Link></h3>
        <p className="hotel-loc">
          <Icon name="pin" size={14} /> {Number(hotel.latitude).toFixed(4)}, {Number(hotel.longitude).toFixed(4)}
        </p>
        <p className="hotel-desc">{snippet}</p>
      </div>

      <div className="hotel-side">
        <div className="hotel-price">
          ₹{Number(hotel.price).toLocaleString('en-IN')}
          <small>per night</small>
        </div>
        <div className="hotel-actions" onClick={stop}>
          <Link to={`/hotel/${hotel.id}`} className="btn btn-primary btn-sm btn-view">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            View details
          </Link>
          <Link to={`/edit/${hotel.id}`} className="btn btn-outline btn-sm">
            <Icon name="edit" size={15} /> Edit
          </Link>
          <button className="btn btn-danger-outline btn-sm" onClick={() => onDelete(hotel)}>
            <Icon name="trash" size={15} /> Delete
          </button>
        </div>
      </div>
    </article>
  );
}