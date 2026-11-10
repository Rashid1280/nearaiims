import { useState, useEffect } from "react";
import api from "../api/axios";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Sofa,
  Snowflake,
  UtensilsCrossed,
  ParkingCircle,
  CheckCircle2,
} from "lucide-react";
import { loadRazorpay } from "../utils/loadRazorpay";

const AMENITY_DISPLAY = {
  furnished: { label: "Furnished", Icon: Sofa },
  ac: { label: "AC", Icon: Snowflake },
  kitchenAccess: { label: "Kitchen access", Icon: UtensilsCrossed },
  parking: { label: "Parking", Icon: ParkingCircle },
};

function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingStatus, setBookingStatus] = useState("");
  const [bookingError, setBookingError] = useState("");

  const { user } = useAuth();

  useEffect(() => {
    async function fetchProperty() {
      try {
        const response = await api.get(`/api/properties/${id}`);
        setProperty(response.data);
      } catch (error) {
        console.error("Failed to fetch property:", error);
      }
    }

    fetchProperty();
  }, [id]);

  if (!property) {
    return <p className="text-center text-muted mt-12">Loading...</p>;
  }

  const {
    propertyType,
    location,
    address,
    pricePerNight,
    description,
    images,
    owner,
    amenities,
  } = property;

  async function handleBookingSubmit(e) {
    e.preventDefault();
    setBookingError("");
    setSubmitting(true);

    try {
      const { data } = await api.post("/api/bookings/reserve", {
        propertyId: id,
        startDate,
        endDate,
      });

      let paid = false;
      let failureReason = "";

      const Razorpay = await loadRazorpay();
      const popup = new Razorpay({
        key: data.keyId,
        order_id: data.orderId,
        amount: data.amountInPaise,
        currency: "INR",
        name: "NearAIIMS",
        description: `${propertyType} in ${location}`,
        prefill: { name: user.name, email: user.email },
        handler: (response) => {
          paid = true;
          handlePaymentSuccess(response);
        },
        modal: {
          ondismiss: () => {
            if (paid) return;
            setBookingError(
              failureReason ||
                "Payment was not completed. Your dates are not booked yet.",
            );
            setBookingStatus("error");
          },
        },
      });
      popup.on("payment.failed", (response) => {
        failureReason = response.error.description;
      });
      popup.open();
    } catch (error) {
      setBookingError(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
      setBookingStatus("error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePaymentSuccess(response) {
    setSubmitting(true);
    try {
      await api.post("/api/payments/verify", {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });
      setBookingStatus("success");
      setStartDate("");
      setEndDate("");
    } catch {
      setBookingError(
        "Your payment went through, but we could not confirm the booking yet. Please check My Bookings in a minute.",
      );
      setBookingStatus("error");
    } finally {
      setSubmitting(false);
    }
  }

  // brings the form back after a successful request
  function handleRequestAnother() {
    setBookingStatus("");
    setBookingError("");
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="lg:flex lg:gap-10">
        {/* ---- left column: property info + gallery, grows to fill remaining space ---- */}
        <div className="lg:flex-1">
          <h1 className="text-2xl font-semibold text-ink">
            {propertyType} in {location}
          </h1>
          <p className="text-muted mt-1">{address}</p>
          <p className="text-brand font-medium text-lg mt-2">
            ₹{pricePerNight} / night
          </p>
          <p className="text-ink mt-4">{description}</p>
          <p className="text-sm text-muted mt-2">Listed by: {owner?.name}</p>

          {amenities && amenities.length > 0 && (
            <div className="mt-6">
              <h2 className="font-semibold text-ink mb-2">Amenities</h2>
              <div className="flex flex-wrap gap-3">
                {amenities.map((amenity) => {
                  const display = AMENITY_DISPLAY[amenity];
                  const Icon = display?.Icon;
                  return (
                    <span
                      key={amenity}
                      className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-surface text-ink border border-line"
                    >
                      {Icon && <Icon size={16} className="text-brand" />}
                      {display?.label || amenity}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
            {images &&
              images.map((img, index) => (
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
          <div className="mt-8 lg:mt-0 lg:w-80 lg:shrink-0 border border-line rounded-lg p-6 h-fit lg:sticky lg:top-6">
            {bookingStatus === "success" ? (
              <div className="text-center py-4">
                <CheckCircle2 size={40} className="text-accent mx-auto" />
                <h2 className="font-semibold text-ink text-lg mt-3">
                  Booking confirmed!
                </h2>
                <p className="text-sm text-muted mt-2">
                  Your payment was received. You can see this booking under My
                  Bookings.
                </p>
                <button
                  onClick={handleRequestAnother}
                  className="w-full px-5 py-2 rounded-md border border-line text-ink text-sm font-medium hover:bg-surface mt-5"
                >
                  Request another stay
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit}>
                <h2 className="font-semibold text-ink mb-4">Book this stay</h2>

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

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-5 py-2 rounded-md bg-accent text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? "Reserving..." : "Reserve & Pay"}
                </button>

                {bookingStatus === "error" && (
                  <p className="text-danger text-sm mt-3">{bookingError}</p>
                )}
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PropertyDetail;
