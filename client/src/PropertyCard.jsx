import { Link } from "react-router-dom";

const AMENITY_LABELS = {
  furnished: 'Furnished',
  ac: 'AC',
  kitchenAccess: 'Kitchen access',
  parking: 'Parking',
};

function PropertyCard({ property }) {
  if (!property) return null;
  const { _id, propertyType, location, address, price, priceType, images, amenities } = property;

  return (
    <Link to={`/properties/${_id}`}>
      <div className="rounded-lg border border-line bg-white overflow-hidden hover:shadow-md transition-shadow">
        {images && images.length > 0 && (
          <img
            src={images[0]}
            alt={propertyType}
            className="w-full h-48 object-cover"
          />
        )}
        <div className="p-4">
          <h2 className="font-semibold text-ink">{propertyType} in {location}</h2>
          <p className="text-sm text-muted mt-1">{address}</p>
          <p className="text-brand font-medium mt-2">₹{price} / {priceType}</p>

          {amenities && amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="text-xs px-2 py-0.5 rounded-full bg-surface text-muted border border-line"
                >
                  {AMENITY_LABELS[amenity] || amenity}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default PropertyCard;