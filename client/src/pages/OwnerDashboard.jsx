import { useState, useEffect } from 'react';
import axios from 'axios';

function OwnerDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <p className="text-center text-muted mt-12">Loading requests...</p>;
  }

  async function handleStatusUpdate(bookingId, newStatus) {
    try {
     await axios.put(`http://localhost:5000/api/bookings/${bookingId}/status`, { status: newStatus }, {withCredentials:true});
     setBookings((prevBookings)=>
      prevBookings.map((booking)=>
        booking._id===bookingId ? {...booking, status:newStatus} : booking
      )
     )
     
    } catch (error) {
      console.error('Failed to update booking status:',error)
    }
  }

  // returns the right background/text color pair for each status - kept in one place
  // so every badge stays consistent instead of repeating the logic per booking
  function statusBadgeStyle(status) {
    if (status === 'accepted') return 'bg-accent/10 text-accent';
    if (status === 'declined') return 'bg-danger/10 text-danger';
    return 'bg-line text-muted';
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold text-ink">Booking Requests</h1>

      {bookings.length === 0 ? (
        <p className="text-muted mt-6">No booking requests yet.</p>
      ) : (
        <div className="flex flex-col gap-4 mt-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="border border-line rounded-lg p-5">

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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OwnerDashboard;