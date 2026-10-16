import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { fetchHotel, saveHotel, clearCurrent } from '../store/hotelSlice';
import HotelForm from '../components/HotelForm';
import PageBanner from '../components/PageBanner';
import Popup from '../components/Popup';

export default function HotelFormPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current, error } = useSelector((s) => s.hotels);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [popup, setPopup] = useState('');

  useEffect(() => {
    if (id) dispatch(fetchHotel(id));
    else dispatch(clearCurrent());
    return () => { dispatch(clearCurrent()); };
  }, [id, dispatch]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setErrors([]);
    const result = await dispatch(saveHotel({ id, formData }));
    setSubmitting(false);
    if (saveHotel.fulfilled.match(result)) {
      setPopup(id ? 'Hotel updated successfully!' : 'Hotel added successfully!');
    } else {
      setErrors(result.payload || ['Something went wrong']);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const title = id ? 'Edit hotel' : 'Add new hotel';
  const ready = !id || (current && String(current.id) === String(id));

  return (
    <>
      <Helmet>
        <title>{title} | Hotel Hub</title>
        <meta name="description" content="Add a new hotel or edit an existing hotel's details." />
      </Helmet>

      <PageBanner title={title} crumbs={[{ label: 'Hotel list', to: '/' }, { label: title }]} />

      <div className="wrap">
        {ready ? (
          <HotelForm
            initialData={id ? current : null}
            onSubmit={handleSubmit}
            submitting={submitting}
            serverErrors={errors}
          />
        ) : error ? (
          <div className="state">
            <p>{error}. This hotel may have been deleted or the server is not running.</p>
            <button onClick={() => navigate('/')}>Back to hotel list</button>
          </div>
        ) : (
          <div className="state"><p>Loading...</p></div>
        )}
      </div>

      <Popup message={popup} onClose={() => navigate('/')} />
    </>
  );
}