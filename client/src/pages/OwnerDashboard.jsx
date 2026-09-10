import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ImageOff } from 'lucide-react'

function OwnerDashboard() {
 
  const [activeTab, setActiveTab] = useState('received');

    // ---- Requests Received ----
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

    // ---- My Listings ----
  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);

   function daysAgo(dateString) {
    if (!dateString) return '';
    const diffMs = Date.now() - new Date(dateString).getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Listed today';
    if (days === 1) return 'Listed 1 day ago';
    return `Listed ${days} days ago`;
  }

  useEffect(() => {
    async function fetchBookings() {
      try {
        const response = await axios.get(
          'http://localhost:5000/api/bookings/received',
          { withCredentials: true }
        );
        setBookings(response.data);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  useEffect(() => {
    async function fetchListings() {
      try {
        const response = await axios.get(
          'http://localhost:5000/api/properties/mine',
          { withCredentials: true }
        );
        const withLabels = response.data.map((property) => ({
          ...property,
          daysAgoLabel: daysAgo(property.createdAt),
        }));
        setListings(withLabels);
      } catch (error) {
        console.error('Failed to fetch listings:', error);
      } finally {
        setListingsLoading(false);
      }
    }
    fetchListings();
  }, []);

  async function handleStatusUpdate(bookingId, newStatus) {
    try {
      await axios.put(`http://localhost:5000/api/bookings/${bookingId}/status`, { status: newStatus }, { withCredentials: true });
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking._id === bookingId ? { ...booking, status: newStatus } : booking
        )
      );
    } catch (error) {
      console.error('Failed to update booking status:', error);
    }
  }

  function statusBadgeStyle(status) {
    if (status === 'accepted') return 'bg-accent/10 text-accent';
    if (status === 'declined') return 'bg-danger/10 text-danger';
    return 'bg-line text-muted';
  }

  //isActive compares the passed-in tab argument against the component's activeTab state — if they match, it gets underline and colored text, signaling "you're here"
  function tabClassName(tab) {
    const isActive = activeTab === tab;
    return `px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
      isActive ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-ink'
    }`;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold text-ink">My Dashboard</h1>

      <div className="flex gap-2 border-b border-line mt-6">
        <button onClick={() => setActiveTab('listings')} className={tabClassName('listings')}>
          My Listings
        </button>
        <button onClick={() => setActiveTab('received')} className={tabClassName('received')}>
          Requests Received
        </button>
      </div>

      {/* ---------------- My Listings ---------------- */}
      {activeTab === 'listings' && (
        <section className="mt-6">
          <div className="flex justify-end">
            <Link
              to="/add-property"
              className="px-4 py-2 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-dark"
            >
              + Add a property
            </Link>
          </div>

          {listingsLoading ? (
            <p className="text-muted mt-4">Loading your listings...</p>
          ) : listings.length === 0 ? (
            <p className="text-muted mt-4">
              You haven't listed any properties yet.{' '}
              <Link to="/add-property" className="text-brand underline">List one now</Link>
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {listings.map((property) => (
                <div key={property._id} className="border border-line rounded-lg overflow-hidden flex flex-col">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={`http://localhost:5000${property.images[0]}`}
                      alt={property.propertyType}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 flex items-center justify-center bg-surface text-muted">
                      <ImageOff size={28} />
                    </div>
                  )}

                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-ink">
                        {property.propertyType} in {property.location}
                      </h3>
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${
                          property.isAvailable ? 'bg-accent/10 text-accent' : 'bg-line text-muted'
                        }`}
                      >
                        {property.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <p className="text-sm text-muted mt-1">₹{property.price} / {property.priceType}</p>
                    <p className="text-xs text-muted mt-1">{property.daysAgoLabel}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ---------------- Requests Received ---------------- */}
      {activeTab === 'received' && (
        <section className="mt-6">
          {loading ? (
            <p className="text-muted mt-4">Loading requests...</p>
          ) : bookings.length === 0 ? (
            <p className="text-muted mt-4">No booking requests yet.</p>
          ) : (
            <div className="flex flex-col gap-4 mt-4">
              {bookings.map((booking) => (
                <div key={booking._id} className="border border-line rounded-lg p-5">
                  {booking.property ? (
                <>
                   <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-ink">
                        {booking.property.propertyType} in {booking.property.location}
                      </h3>
                      <p className="text-sm text-muted mt-1">
                        Requested by: {booking.renter.name} ({booking.renter.phone})
                      </p>
                      <p className="text-sm text-ink mt-1">
                        {booking.startDate.slice(0, 10)} to {booking.endDate.slice(0, 10)}
                      </p>
                      {booking.message && (
                        <p className="text-sm text-muted mt-1">Message: {booking.message}</p>
                      )}
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${statusBadgeStyle(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  {booking.status === 'pending' && (
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleStatusUpdate(booking._id, 'accepted')}
                        className="px-4 py-1.5 rounded-md bg-accent text-white text-sm font-medium hover:opacity-90"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(booking._id, 'declined')}
                        className="px-4 py-1.5 rounded-md border border-danger text-danger text-sm font-medium hover:bg-danger/10"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </> 
                ) : (
    <p className="text-sm text-muted">
      Requested by: {booking.renter.name} — this listing has since been deleted.
    </p>
  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default OwnerDashboard;