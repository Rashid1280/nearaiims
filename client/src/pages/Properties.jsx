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

  // runs once on page load only - no filter yet so all properties shows at once
  useEffect(() => {
    fetchProperties();
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    fetchProperties();
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold text-ink">Available Properties</h1>

      <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mt-6">
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          className="flex-1 min-w-[140px] border border-line rounded-md px-3 py-2 text-sm"
        />

        <select
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          className="border border-line rounded-md px-3 py-2 text-sm"
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
          className="w-28 border border-line rounded-md px-3 py-2 text-sm"
        />
        <input
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="Max Price"
          className="w-28 border border-line rounded-md px-3 py-2 text-sm"
        />

        <button
          type="submit"
          className="px-5 py-2 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-dark"
        >
          Search
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {properties.map((property) => (
          <PropertyCard key={property._id} property={property} />
        ))}
      </div>
    </div>
  );
}

export default Properties;