import { Link } from "react-router-dom";

function PropertyCard({ property }) {
  if (!property) return null;
  const { _id, propertyType, location, address, price, priceType, images } = property;

  return (
    <Link to={`/properties/${_id}`}>
      <div className="rounded-lg border border-line bg-white overflow-hidden hover:shadow-md transition-shadow">
        {images && images.length > 0 && (
          <img
            src={`http://localhost:5000${images[0]}`}
            alt={propertyType}
            className="w-full h-48 object-cover"
          />
        )}
        <div className="p-4">
          <h2 className="font-semibold text-ink">{propertyType} in {location}</h2>
          <p className="text-sm text-muted mt-1">{address}</p>
          <p className="text-brand font-medium mt-2">₹{price} / {priceType}</p>
        </div>
      </div>
    </Link>
  );
}

export default PropertyCard;