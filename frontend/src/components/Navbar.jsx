import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Icon from './Icons';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef(null);
  const urlSearch = new URLSearchParams(location.search).get('search') || '';
  const onList = location.pathname === '/';
  const [text, setText] = useState(urlSearch);

  useEffect(() => { setText(onList ? urlSearch : ''); }, [urlSearch, onList]);

  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(onList ? location.search : '');
    if (text.trim()) params.set('search', text.trim());
    else params.delete('search');
    params.delete('page');
    navigate({ pathname: '/', search: params.toString() });
  };

  const clear = () => {
    setText('');
    inputRef.current?.focus();
    if (onList && urlSearch) {
      const params = new URLSearchParams(location.search);
      params.delete('search');
      params.delete('page');
      navigate({ pathname: '/', search: params.toString() });
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo" aria-label="Hotel Hub home">
          <span className="logo-mark"><Icon name="building" size={20} /></span>
          Hotel Hub
        </Link>

        <form className="nav-search" onSubmit={submit} role="search">
          <span className="search-lead"><Icon name="search" size={18} /></span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search hotels by title..."
            aria-label="Search hotels by title"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {text ? (
            <button type="button" className="search-clear" aria-label="Clear search" onClick={clear}>
              <Icon name="x" size={14} />
            </button>
          ) : (
            <kbd className="search-kbd" aria-hidden="true">/</kbd>
          )}
          <button type="submit" className="search-submit" aria-label="Search">Search</button>
        </form>

        <Link to="/add" className="btn btn-light">
          <Icon name="plus" size={16} /> <span>Add Hotel</span>
        </Link>
      </div>
    </header>
  );
}