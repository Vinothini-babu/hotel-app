import { useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HotelList from './pages/HotelList';
import HotelFormPage from './pages/HotelFormPage';
import HotelDetail from './pages/HotelDetail';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <div className="wrap">
      <div className="state">
        <h3>404 - Page not found</h3>
        <Link to="/" className="btn btn-primary">Go to hotels</Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="app">
      <ScrollToTop />
      <Navbar />
      <main className="main">
        <Routes>
          <Route path="/" element={<HotelList />} />
          <Route path="/add" element={<HotelFormPage />} />
          <Route path="/edit/:id" element={<HotelFormPage />} />
          <Route path="/hotel/:id" element={<HotelDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}