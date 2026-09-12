import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ImageOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext';

function OwnerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('received');

    // ---- Requests Received ----
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

    // ---- My Listings ----
  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingsError, setListingsError] = useState('');

  // ---- My Bookings (as a renter) ----
  const [myBookings, setMyBookings] = useState([]);
  const [myBookingsLoading, setMyBookingsLoading] = useState(true);

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

  useEffect(() => {
    async function fetchMyBookings() {
      try {
        const response = await axios.get(
          'http://localhost:5000/api/bookings/mine',
          { withCredentials: true }
        );
        setMyBookings(response.data);
      } catch (error) {
        console.error('Failed to fetch my bookings:', error);
      } finally {
        setMyBookingsLoading(false);
      }
    }
    fetchMyBookings();
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

  // ---- Listing management actions ----

  async function toggleAvailability(propertyId, currentValue) {
    setListingsError('');
    try {
      await axios.put(
        `http://localhost:5000/api/properties/${propertyId}`,
        { isAvailable: !currentValue },
        { withCredentials: true }
      );
      setListings((prev) =>
        prev.map((property) =>
          property._id === propertyId ? { ...property, isAvailable: !currentValue } : property
        )
      );
    } catch (error) {
      console.error('Failed to update availability:', error);
      setListingsError('Could not update availability. Please try again.');
    }
  }

  async function handleDelete(propertyId) {
    const confirmed = window.confirm('Delete this listing permanently? This cannot be undone.');
    if (!confirmed) return;

    setListingsError('');
    try {
      await axios.delete(`http://localhost:5000/api/properties/${propertyId}`, { withCredentials: true });
      setListings((prev) => prev.filter((property) => property._id !== propertyId));
    } catch (error) {
      console.error('Failed to delete property:', error);
      setListingsError('Could not delete this listing. Please try again.');
    }
  }

  function statusBadgeStyle(status) {
    if (status === 'accepted') return 'bg-accent/10 text-accent';
    if (status === 'declined') return 'bg-danger/10 text-danger';
    return 'bg-line text-muted';
  }

  // guards against bad/missing 
  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return dateString.slice(0, 10);
  }

  function pendingCountFor(propertyId) {
    return bookings.filter(
      (booking) => booking.property && booking.property._id === propertyId && booking.status === 'pending'
    ).length;
  }

  //isActive compares the passed-in tab argument against the component's activeTab state — if they match, it gets underline and colored text, signaling "you're here"
  function tabClassName(tab) {
    const isActive = activeTab === tab;
    return `px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-2 ${
      isActive ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-ink'
    }`;
  }

  // derived, not stored in state - recalculates automatically whenever
  // `bookings` changes, so it can never drift out of sync with the real data
  const totalPending = bookings.filter((booking) => booking.status === 'pending').length;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">

      {/* ---- welcome header + quick stats ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Welcome back, {user?.name}</h1>
          <p className="text-sm text-muted mt-1">{user?.email}</p>
        </div>

        <div className="flex gap-6">
          <div className="text-center">
            <p className="text-xl font-semibold text-ink">{listings.length}</p>
            <p className="text-xs text-muted">Listings</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold text-ink">{totalPending}</p>
            <p className="text-xs text-muted">Pending requests</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold text-ink">{myBookings.length}</p>
            <p className="text-xs text-muted">My bookings</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-line mt-6">
        <button onClick={() => setActiveTab('listings')} className={tabClassName('listings')}>
          My Listings
        </button>
        <button onClick={() => setActiveTab('received')} className={tabClassName('received')}>
          Requests Received
          {totalPending > 0 && (
            <span className="bg-danger text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
              {totalPending}
            </span>
          )}
        </button>
        <button onClick={() => setActiveTab('bookings')} className={tabClassName('bookings')}>
          My Bookings
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

          {listingsError && <p className="text-danger text-sm mt-2">{listingsError}</p>}

          {listingsLoading ? (
            <p className="text-muted mt-4">Loading your listings...</p>
          ) : listings.length === 0 ? (
            <p className="text-muted mt-4">
              You haven't listed any properties yet.{' '}
              <Link to="/add-property" className="text-brand underline">List one now</Link>
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {listings.map((property) => {
                const pending = pendingCountFor(property._id);
                return (
                <div key={property._id} className="border border-line rounded-lg overflow-hidden flex flex-col">
                  <div className="relative">
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

                    {pending > 0 && (
                      <span className="absolute top-2 right-2 bg-danger text-white text-xs font-medium px-2 py-1 rounded-full">
                        {pending} pending
                      </span>
                    )}
                  </div>

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

                    <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-line mt-3">
                      <Link
                        to={`/edit-property/${property._id}`}
                        className="px-3 py-1.5 rounded-md border border-line text-ink text-xs font-medium hover:bg-surface"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => toggleAvailability(property._id, property.isAvailable)}
                        className="px-3 py-1.5 rounded-md border border-line text-ink text-xs font-medium hover:bg-surface"
                      >
                        {property.isAvailable ? 'Mark unavailable' : 'Mark available'}
                      </button>
                      <button
                        onClick={() => handleDelete(property._id)}
                        className="px-3 py-1.5 rounded-md border border-danger text-danger text-xs font-medium hover:bg-danger/10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                );
              })}
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
                        {formatDate(booking.startDate)} to {formatDate(booking.endDate)}
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

      {/* ---------------- My Bookings (as a renter) ---------------- */}
      {activeTab === 'bookings' && (
        <section className="mt-6">
          {myBookingsLoading ? (
            <p className="text-muted mt-4">Loading your bookings...</p>
          ) : myBookings.length === 0 ? (
            <p className="text-muted mt-4">
              You haven't requested any bookings yet.{' '}
              <Link to="/properties" className="text-brand underline">Browse properties</Link>
            </p>
          ) : (
            <div className="flex flex-col gap-4 mt-4">
              {myBookings.map((booking) => (
                <div key={booking._id} className="border border-line rounded-lg p-5">
                  {booking.property ? (
                    <>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-ink">
                            <Link to={`/properties/${booking.property._id}`} className="hover:text-brand">
                              {booking.property.propertyType} in {booking.property.location}
                            </Link>
                          </h3>
                          <p className="text-sm text-ink mt-1">
                            {formatDate(booking.startDate)} to {formatDate(booking.endDate)}
                          </p>
                          <p className="text-sm text-muted mt-1">₹{booking.property.price}</p>
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${statusBadgeStyle(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                     
                      {booking.status === 'accepted' && (
                    <p className="text-sm text-accent mt-3">
                      Accepted! Contact the owner at{' '}                       
                        <a href={`tel:${booking.property.ownerContactNumber}`}
                        className="font-medium underline">
                        {booking.property.ownerContactNumber}
                           </a>
                          </p>
                        )}
                    </>
                  ) : (
                    <p className="text-sm text-muted">
                      This listing is no longer available.
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