import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

function PropertyDetail() {

  const { id } = useParams();
  const [property, setProperty] = useState(null);

  // ---- booking form state ----
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [bookingStatus, setBookingStatus] = useState('');
  const [bookingError, setBookingError] = useState('');

  const { user } = useAuth();

  // fetch the one property this page is for, based on the url's :id
  useEffect(() => {
    async function fetchProperty() {
      try {
        const response = await axios.get(`http://localhost:5000/api/properties/${id}`);
        setProperty(response.data);
      } catch (error) {
        console.error('Failed to fetch property:', error);
      }
    }

    fetchProperty();
  }, [id]);

  if (!property) {
    return <p>Loading...</p>;
  }

  const { propertyType, location, address, price, priceType, description, images, owner } = property;

  // sends the booking request
  async function handleBookingSubmit(e) {
    e.preventDefault();
    setBookingStatus('');
    setBookingError('');

    try {
      await axios.post(
        'http://localhost:5000/api/bookings',
        { propertyId: id, startDate, endDate, message },
        { withCredentials: true }
      );
      setBookingStatus('success');
      setStartDate('');
      setEndDate('');
      setMessage('');
    } catch (error) {
      setBookingError(error.response?.data?.message || 'Something went wrong. Please try again.');
      setBookingStatus('error');
    }
  }

  return (
    <div>

      {/* ---- property info ---- */}
      <h1>{propertyType} in {location}</h1>
      <p>{address}</p>
      <p>₹{price} / {priceType}</p>
      <p>{description}</p>
      <p>Listed by: {owner?.name}</p>

      <div>
        {images && images.map((img, index) => (
          <img
            key={index}
            src={`http://localhost:5000${img}`}
            alt={`${propertyType} photo ${index + 1}`}
            width="300"
          />
        ))}
      </div>

      {/* ---- booking form - hidden if not logged in, or if viewing your own listing ---- */}
      {user && owner && user.id !== owner._id && (
        <form onSubmit={handleBookingSubmit}>
          <label>
            Check-in
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </label>

          <label>
            Check-out
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </label>

          <label>
            Message to owner (optional)
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Any details the owner should know..."
            />
          </label>

          <button type="submit">Request to Book</button>

          {bookingStatus === 'success' && <p>Booking request sent!</p>}
          {bookingStatus === 'error' && <p>{bookingError}</p>}
        </form>
      )}

    </div>
  );
}

export default PropertyDetail;