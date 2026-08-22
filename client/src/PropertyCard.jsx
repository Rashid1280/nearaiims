import { Link } from "react-router-dom";

function PropertyCard({ property }) {
 if (!property) return null;
  const {_id, propertyType, location, address, price, priceType, images } = property;

  return (
    <Link to={`/properties/${_id}`}>
    <div className="property-card">
      {images && images.length > 0 && (
        <img
          src={`http://localhost:5000/${images[0]}`}
          alt={propertyType}
          width="200"
        />
      )}
      <h2>{propertyType} in {location}</h2>
      <p>{address}</p>
      <p>₹{price} / {priceType}</p>
    </div>
    </Link>
  );
}

export default PropertyCard;