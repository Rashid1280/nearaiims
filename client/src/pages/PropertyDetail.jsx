import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

function PropertyDetail() {

  const { id } = useParams();
  const [property, setProperty] = useState(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [bookingStatus, setBookingStatus] = useState('');
  const [bookingError, setBookingError] = useState('');

  const { user } = useAuth();

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
    return <p className="text-center text-muted mt-12">Loading...</p>;
  }

  const { propertyType, location, address, price, priceType, description, images, owner } = property;

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
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="lg:flex lg:gap-10">

        {/* ---- left column: property info + gallery, grows to fill remaining space ---- */}
        <div className="lg:flex-1">
          <h1 className="text-2xl font-semibold text-ink">{propertyType} in {location}</h1>
          <p className="text-muted mt-1">{address}</p>
          <p className="text-brand font-medium text-lg mt-2">₹{price} / {priceType}</p>
          <p className="text-ink mt-4">{description}</p>
          <p className="text-sm text-muted mt-2">Listed by: {owner?.name}</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
            {images && images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${propertyType} photo ${index + 1}`}
                className="w-full h-40 object-cover rounded-lg"
              />
            ))}
          </div>
        </div>

        {/* ---- right column: booking form, fixed width, stays visible while scrolling ---- */}
        {user && owner && user.id !== owner._id && (
          <form
            onSubmit={handleBookingSubmit}
            className="mt-8 lg:mt-0 lg:w-80 lg:shrink-0 border border-line rounded-lg p-6 h-fit lg:sticky lg:top-6"
          >
            <h2 className="font-semibold text-ink mb-4">Request to book</h2>

            <label className="block mb-4">
              <span className="text-sm text-muted">Check-in</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full border border-line rounded-md px-3 py-2 text-sm mt-1"
              />
            </label>

            <label className="block mb-4">
              <span className="text-sm text-muted">Check-out</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full border border-line rounded-md px-3 py-2 text-sm mt-1"
              />
            </label>

            <label className="block mb-4">
              <span className="text-sm text-muted">Message to owner (optional)</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Any details the owner should know..."
                className="w-full border border-line rounded-md px-3 py-2 text-sm mt-1"
                rows="3"
              />
            </label>

            <button
              type="submit"
              className="w-full px-5 py-2 rounded-md bg-accent text-white text-sm font-medium hover:opacity-90"
            >
              Request to Book
            </button>

            {bookingStatus === 'success' && <p className="text-accent text-sm mt-3">Booking request sent!</p>}
            {bookingStatus === 'error' && <p className="text-danger text-sm mt-3">{bookingError}</p>}
          </form>
        )}

      </div>
    </div>
  );
}

export default PropertyDetail;