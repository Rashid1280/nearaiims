function PropertyCard({ property }) {
 if (!property) return null;
  const { propertyType, location, address, price, priceType, images } = property;

  return (
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
  );
}

export default PropertyCard;