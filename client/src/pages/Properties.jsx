import { useState, useEffect } from 'react';
import axios from 'axios';
import PropertyCard from '../PropertyCard.jsx';

function Properties() {
  const [properties, setProperties] = useState([]);

  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // builds the filter object and asks the backend for matching properties
  async function fetchProperties() {
    const params = {};
    if (location) params.location = location;
    if (propertyType) params.propertyType = propertyType;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;

    try {
      const response = await axios.get('http://localhost:5000/api/properties', { params });
      setProperties(response.data);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    }
  }

  // runs once on page load only - no filter dependencies, so no per-keystroke fetching
  useEffect(() => {
    fetchProperties();
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    fetchProperties();
  }

  return (
    <div>
      <h1>Available Properties</h1>

      <form onSubmit={handleSearch}>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
        />

        <select
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
        >
          <option value="">Any type</option>
          <option value="Room">Room</option>
          <option value="1 RK">1 RK</option>
          <option value="1 BHK">1 BHK</option>
          <option value="2 BHK">2 BHK</option>
          <option value="3 BHK">3 BHK</option>
          <option value="Independent House">Independent House</option>
          <option value="PG">PG</option>
        </select>

        <input
          type="number"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          placeholder="Min Price"
        />
        <input
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="Max Price"
        />

        <button type="submit">Search</button>
      </form>

      {properties.map((property) => (
        <PropertyCard key={property._id} property={property} />
      ))}
    </div>
  );
}

export default Properties;