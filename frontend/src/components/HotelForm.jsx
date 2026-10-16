import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../store/hotelSlice';
import Icon from './Icons';

const EMPTY = { title: '', description: '', latitude: '', longitude: '', price: '' };

export default function HotelForm({ initialData, onSubmit, submitting, serverErrors = [] }) {
  const isEdit = Boolean(initialData);
  const fileRef = useRef(null);

  const [values, setValues] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [errors, setErrors] = useState({});
  const [locating, setLocating] = useState(false);
  const [dragging, setDragging] = useState(false);
  useEffect(() => {
    if (initialData) {
      setValues({
        title: initialData.title ?? '',
        description: initialData.description ?? '',
        latitude: initialData.latitude ?? '',
        longitude: initialData.longitude ?? '',
        price: initialData.price ?? '',
      });
      setPreview(initialData.image_path ? `${API}/${initialData.image_path}` : '');
    } else {
      setValues(EMPTY);
      setPreview('');
    }
    setFile(null);
    setErrors({});
  }, [initialData]);

  useEffect(() => {
    return () => { if (preview.startsWith('blob:')) URL.revokeObjectURL(preview); };
  }, [preview]);

  const change = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((er) => ({ ...er, [name]: '' }));
  };

  const pickFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setErrors((er) => ({ ...er, image: 'Only image files are allowed' }));
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setErrors((er) => ({ ...er, image: 'Image must be 5MB or smaller' }));
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setErrors((er) => ({ ...er, image: '' }));
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setErrors((er) => ({ ...er, latitude: 'Location is not supported in this browser' }));
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValues((v) => ({
          ...v,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setErrors((er) => ({ ...er, latitude: '', longitude: '' }));
        setLocating(false);
      },
      () => {
        setErrors((er) => ({ ...er, latitude: 'Could not get your location. Please type it in.' }));
        setLocating(false);
      }
    );
  };

  const validate = () => {
    const er = {};
    if (!values.title.trim()) er.title = 'Title is required';
    if (!values.description.trim()) er.description = 'Description is required';
    const lat = Number(values.latitude);
    if (values.latitude === '' || isNaN(lat) || lat < -90 || lat > 90)
      er.latitude = 'Latitude must be between -90 and 90';
    const lng = Number(values.longitude);
    if (values.longitude === '' || isNaN(lng) || lng < -180 || lng > 180)
      er.longitude = 'Longitude must be between -180 and 180';
    const price = Number(values.price);
    if (values.price === '' || isNaN(price) || price < 0) er.price = 'Price must be a valid positive number';
    if (!isEdit && !file) er.image = 'Image is required';
    return er;
  };

  const submit = (e) => {
    e.preventDefault();
    const er = validate();
    setErrors(er);
    if (Object.keys(er).length) return;

    const fd = new FormData();
    fd.append('title', values.title.trim());
    fd.append('description', values.description.trim());
    fd.append('latitude', values.latitude);
    fd.append('longitude', values.longitude);
    fd.append('price', values.price);
    if (file) fd.append('image', file);
    onSubmit(fd);
  };

  // live preview values
  const pTitle = values.title.trim() || 'Your hotel name';
  const pDesc = values.description.trim() || 'Your hotel description will appear here as you type.';
  const pPrice = values.price !== '' && !isNaN(values.price) ? Number(values.price).toLocaleString('en-IN') : '0';
  const hasCoords = values.latitude !== '' && values.longitude !== '' && !isNaN(values.latitude) && !isNaN(values.longitude);

  return (
    <div className="form-layout">
      <form className="form-card" onSubmit={submit} noValidate>
        {serverErrors.length > 0 && (
          <div className="server-errors" role="alert">
            {serverErrors.map((m, i) => <div key={i}>{m}</div>)}
          </div>
        )}

        {}
        <section className="form-section">
          <h3 className="section-title"><span className="step">1</span> Basic information</h3>

          <div className={`form-group ${errors.title ? 'has-error' : ''}`}>
            <label htmlFor="title">Hotel title <span className="req">*</span></label>
            <input id="title" name="title" value={values.title} onChange={change} placeholder="e.g. Marina Beach Hotel, Chennai" />
            {errors.title && <span className="error">{errors.title}</span>}
          </div>

          <div className={`form-group ${errors.description ? 'has-error' : ''}`}>
            <label htmlFor="description">Description <span className="req">*</span></label>
            <textarea
              id="description"
              name="description"
              rows={5}
              value={values.description}
              onChange={change}
              placeholder="Describe the rooms, amenities and what makes this stay special..."
            />
            <div className="field-foot">
              {errors.description ? <span className="error">{errors.description}</span> : <span />}
              <span className="hint">{values.description.length} characters</span>
            </div>
          </div>
        </section>

        {}
        <section className="form-section">
          <h3 className="section-title"><span className="step">2</span> Location</h3>

          <div className="row">
            <div className={`form-group ${errors.latitude ? 'has-error' : ''}`}>
              <label htmlFor="latitude">Latitude <span className="req">*</span></label>
              <input id="latitude" name="latitude" type="number" step="any" value={values.latitude} onChange={change} placeholder="e.g. 13.0827" />
              {errors.latitude && <span className="error">{errors.latitude}</span>}
            </div>
            <div className={`form-group ${errors.longitude ? 'has-error' : ''}`}>
              <label htmlFor="longitude">Longitude <span className="req">*</span></label>
              <input id="longitude" name="longitude" type="number" step="any" value={values.longitude} onChange={change} placeholder="e.g. 80.2707" />
              {errors.longitude && <span className="error">{errors.longitude}</span>}
            </div>
          </div>

          <button type="button" className="btn btn-outline btn-sm locate-btn" onClick={useMyLocation} disabled={locating}>
            <Icon name="pin" size={15} /> {locating ? 'Getting location...' : 'Use my current location'}
          </button>
        </section>

        {}
        <section className="form-section">
          <h3 className="section-title"><span className="step">3</span> Pricing</h3>

          <div className={`form-group ${errors.price ? 'has-error' : ''}`}>
            <label htmlFor="price">Price per night <span className="req">*</span></label>
            <div className="input-prefix">
              <span>₹</span>
              <input id="price" name="price" type="number" min="0" step="any" value={values.price} onChange={change} placeholder="e.g. 4500" />
            </div>
            {errors.price && <span className="error">{errors.price}</span>}
          </div>
        </section>

        {}
        <section className="form-section">
          <h3 className="section-title"><span className="step">4</span> Hotel photo</h3>

          <div className={`form-group ${errors.image ? 'has-error' : ''}`}>
            <div
              className={`dropzone ${preview ? 'has-preview' : ''} ${dragging ? 'drag' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files[0]); }}
            >
              {preview ? (
                <>
                  <img className="preview" src={preview} alt="Hotel preview" />
                  <div className="preview-actions">
                    <button type="button" className="btn btn-light btn-sm" onClick={() => fileRef.current.click()}>
                      Change photo
                    </button>
                  </div>
                </>
              ) : (
                <button type="button" className="drop-empty" onClick={() => fileRef.current.click()}>
                  <span className="drop-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 16V4" /><path d="M7 9l5-5 5 5" /><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
                    </svg>
                  </span>
                  <strong>Click to upload</strong>
                  <span>or drag and drop an image here</span>
                  <small>PNG, JPG or WEBP up to 5MB</small>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pickFile(e.target.files[0])} />
            </div>
            {errors.image && <span className="error">{errors.image}</span>}
          </div>
        </section>

        <div className="form-actions">
          <Link to="/" className="btn btn-outline">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Add hotel'}
          </button>
        </div>
      </form>

      {}
      <aside className="live-preview" aria-label="Live preview">
        <p className="live-label"><span className="dot" /> Live preview</p>
        <div className="preview-card">
          <div className="preview-media">
            {preview ? <img src={preview} alt="" /> : <div className="preview-placeholder">Photo preview</div>}
          </div>
          <div className="preview-body">
            <h4>{pTitle}</h4>
            <p className="hotel-loc">
              <Icon name="pin" size={14} />
              {hasCoords ? `${Number(values.latitude).toFixed(4)}, ${Number(values.longitude).toFixed(4)}` : 'Location not set'}
            </p>
            <p className="preview-desc">{pDesc.length > 110 ? pDesc.slice(0, 110).trim() + '…' : pDesc}</p>
            <div className="preview-price">₹{pPrice} <small>per night</small></div>
          </div>
        </div>
        <p className="hint">This is how your hotel will look in the list.</p>
      </aside>
    </div>
  );
}