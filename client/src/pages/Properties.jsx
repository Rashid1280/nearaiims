import { useState, useEffect } from 'react';
import axios from 'axios';
import PropertyCard from '../PropertyCard.jsx';

function Properties() {
  const [properties, setProperties] = useState([]);

  // filter fields - controlled inputs, same pattern as Login.jsx
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    // build query params only from filters that actually have a value
    const params = {};
    if (location) params.location = location;
    if (propertyType) params.propertyType = propertyType;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;

    axios.get('http://localhost:5000/api/properties', { params })
      .then((response) => setProperties(response.data))
      .catch((error) => console.error('Failed to fetch properties:', error));
  }, [location, propertyType, minPrice, maxPrice]);

  return (
    <div>
      <h1>Available Properties</h1>

      <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" />
      <input value={propertyType} onChange={(e) => setPropertyType(e.target.value)} placeholder="Property Type" />
      <input value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Min Price" />
      <input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max Price" />

      {properties.map((property) => (
        <PropertyCard key={property._id} property={property} />
      ))}
    </div>
  );
}

export default Properties;