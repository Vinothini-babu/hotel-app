import { Link } from 'react-router-dom';
import Icon from './Icons';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        {}
        <div className="footer-cta">
          <div>
            <h3>Ready to list your hotel?</h3>
            <p>Add a new property in under a minute and let guests find it.</p>
          </div>
          <Link to="/add" className="btn btn-light">
            <Icon name="plus" size={16} /> Add a hotel
          </Link>
        </div>

        <div className="footer-grid">
          <div className="footer-about">
            <Link to="/" className="footer-logo">
              <span className="logo-mark"><Icon name="building" size={18} /></span>
              Hotel Hub
            </Link>
            <p>Browse, search and manage hotels with ease. Filter by price, sort your way and keep every listing up to date.</p>
          </div>

          <div>
            <h5>Explore</h5>
            <Link to="/">All hotels</Link>
            <Link to="/add">Add a hotel</Link>
            <Link to="/?sort=price_asc">Budget stays</Link>
            <Link to="/?view=grid">Grid view</Link>
          </div>

        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-inner bottom-inner">
          <span>© {new Date().getFullYear()} Hotel Hub. All rights reserved.</span>
          <span>Made with care for better stays</span>
        </div>
      </div>
    </footer>
  );
}