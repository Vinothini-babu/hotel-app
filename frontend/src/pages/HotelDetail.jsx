import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { fetchHotel, API } from '../store/hotelSlice';
import PageBanner from '../components/PageBanner';
import HotelImage from '../components/HotelImage';
import Icon from '../components/Icons';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) map.fitBounds(points, { padding: [50, 50] });
  }, [points, map]);
  return null;
}

function distanceKm([lat1, lon1], [lat2, lon2]) {
  const R = 6371;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export default function HotelDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current: hotel, error } = useSelector((s) => s.hotels);
  const [userPos, setUserPos] = useState(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState('');

  useEffect(() => { dispatch(fetchHotel(id)); }, [id, dispatch]);

  const locateMe = () => {
    if (!navigator.geolocation) return setGeoError('Geolocation is not supported by your browser.');
    setGeoError('');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserPos([pos.coords.latitude, pos.coords.longitude]); setLocating(false); },
      () => { setGeoError('Unable to get your location. Please allow location access.'); setLocating(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (error) {
    return (
      <>
        <PageBanner title="Hotel not found" crumbs={[{ label: 'Hotels', to: '/' }]} />
        <div className="wrap"><div className="state"><p>{error}</p><Link to="/" className="btn btn-primary">Back to hotels</Link></div></div>
      </>
    );
  }
  if (!hotel || String(hotel.id) !== String(id)) {
    return (
      <>
        <PageBanner title="Hotel details" crumbs={[{ label: 'Hotels', to: '/' }]} />
        <div className="wrap"><div className="state"><p>Loading...</p></div></div>
      </>
    );
  }

  const position = [Number(hotel.latitude), Number(hotel.longitude)];
  const points = userPos ? [position, userPos] : [position];

  return (
    <>
      <Helmet>
        <title>{hotel.title} | Hotel Hub</title>
        <meta name="description" content={hotel.description.slice(0, 150)} />
        <meta property="og:title" content={hotel.title} />
        <meta property="og:description" content={hotel.description.slice(0, 150)} />
        <meta property="og:image" content={`${API}/${hotel.image_path}`} />
      </Helmet>

      <PageBanner title={hotel.title} crumbs={[{ label: 'Hotels', to: '/' }, { label: hotel.title }]} />

      <div className="wrap detail-page">
        <Link to="/" className="back-link"><Icon name="arrowLeft" size={16} /> Back to hotels</Link>

        <div className="detail-card">
          <div className="detail-media">
            <HotelImage path={hotel.image_path} alt={`${hotel.title} - hotel photo`} />
          </div>
          <div className="detail-body">
            <h2>{hotel.title}</h2>
            <div className="detail-price">
              ₹{Number(hotel.price).toLocaleString('en-IN')} <small>per night</small>
            </div>
            <p className="detail-desc">{hotel.description}</p>

            <dl className="facts">
              <div><dt>Latitude</dt><dd>{Number(hotel.latitude).toFixed(6)}</dd></div>
              <div><dt>Longitude</dt><dd>{Number(hotel.longitude).toFixed(6)}</dd></div>
              <div><dt>Listed on</dt><dd>{new Date(hotel.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</dd></div>
            </dl>

           <div className="detail-actions">
  <Link to={`/edit/${hotel.id}`} className="btn btn-primary">
    <Icon name="edit" size={16} /> Edit hotel
  </Link>
  <a
    className="btn btn-outline"
    target="_blank"
    rel="noreferrer"
    href={`https://www.google.com/maps/dir/?api=1&destination=${position[0]},${position[1]}&travelmode=driving`}
  >
    <Icon name="pin" size={16} /> Get directions
  </a>
</div>
          </div>
        </div>

        <section className="map-card">
          <div className="map-head">
            <div>
              <h3>Location</h3>
              {userPos && (
                <p className="muted">You are about <strong>{distanceKm(userPos, position).toFixed(1)} km</strong> from this hotel.</p>
              )}
              {geoError && <p className="error">{geoError}</p>}
            </div>
            <button className="btn btn-outline" onClick={locateMe} disabled={locating}>
              <Icon name="locate" size={16} /> {locating ? 'Locating...' : 'Show my location'}
            </button>
          </div>

          <MapContainer key={hotel.id} center={position} zoom={13} className="map" scrollWheelZoom={false}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}><Popup>{hotel.title}</Popup></Marker>
            {userPos && <Marker position={userPos}><Popup>You are here</Popup></Marker>}
            <FitBounds points={points} />
          </MapContainer>
        </section>
      </div>
    </>
  );
}