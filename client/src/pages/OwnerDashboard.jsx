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
    return <p>Loading requests...</p>;
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

  return (
    <div>
      <h1>Booking Requests</h1>

      {bookings.length === 0 ? (
        <p>No booking requests yet.</p>
      ) : (
        bookings.map((booking) => (
          <div key={booking._id}>
            <h3>{booking.property.propertyType} in {booking.property.location}</h3>
            <p>Requested by: {booking.renter.name} ({booking.renter.phone})</p>
            <p>{booking.startDate.slice(0, 10)} to {booking.endDate.slice(0, 10)}</p>
            {booking.message && <p>Message: {booking.message}</p>}
            <p>Status: {booking.status}</p>
            {booking.status === 'pending' && (
        <>
       <button onClick={() => handleStatusUpdate(booking._id, 'accepted')}>Accept</button>
       <button onClick={() => handleStatusUpdate(booking._id, 'declined')}>Decline</button>
        </>
      )}
          </div>
        ))
      )}

      
    </div>
  );
}

export default OwnerDashboard;