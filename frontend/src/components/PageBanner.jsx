import { Link } from 'react-router-dom';

export default function PageBanner({ title, subtitle, crumbs = [] }) {
  return (
    <section className="banner">
      <div className="wrap banner-inner">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          {crumbs.map((c, i) => (
            <span key={i}>
              <span className="sep">/</span>
              {c.to ? <Link to={c.to}>{c.label}</Link> : <strong aria-current="page">{c.label}</strong>}
            </span>
          ))}
        </nav>
        <h1>{title}</h1>
        {subtitle && <p className="banner-sub">{subtitle}</p>}
      </div>
    </section>
  );
}