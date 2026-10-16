import { useState } from 'react';
import { API } from '../store/hotelSlice';

const FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'>
      <rect width='400' height='300' fill='#e8edf6'/>
      <g fill='none' stroke='#9aa9c4' stroke-width='6' stroke-linecap='round' stroke-linejoin='round'>
        <path d='M140 220V100h120v120M110 220h180'/>
        <path d='M165 130h20M215 130h20M165 165h20M215 165h20M190 220v-35h20v35'/>
      </g>
    </svg>`
  );

export default function HotelImage({ path, alt, className = '' }) {
  const [failed, setFailed] = useState(false);
  const src = !path || failed ? FALLBACK : `${API}/${path}`;
  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}