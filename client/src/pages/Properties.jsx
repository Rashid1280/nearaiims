import { useState, useEffect } from 'react';
import axios from 'axios';
import PropertyCard from '../PropertyCard.jsx';

function Properties() {

  const [properties, setProperties] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/properties')
      .then((response) => {
        setProperties(response.data);
      })
      .catch((error) => {
        console.error('Failed to fetch properties:', error);
      });
  }, []);

  return (
    <div>
      <h1>Available Properties</h1>
      {properties.map((property) => (
        <PropertyCard key={property._id} />
      ))}
    </div>
  );
}

export default Properties;