import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import heroImage from '../assets/hero.png';

function Home() {
  const navigate = useNavigate();

  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // builds a query string from whatever filters were filled in, then sends
  // the user to the results page with those filters attached to the URL
  function handleSearch(e) {
    e.preventDefault();

    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (propertyType) params.set('propertyType', propertyType);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);

    navigate(`/properties?${params.toString()}`);
  }

  return (
    <section className="w-full">
      <div className="flex flex-col md:flex-row md:items-center">

        {/* text half - keeps normal page padding, same left inset as the nav bar */}
        <div className="md:w-1/2 px-6 py-12 md:py-0 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-semibold text-ink leading-tight">
            Find your stay near AIIMS Raipur
          </h1>
          <p className="text-muted text-lg mt-4">
            Short-term rentals for patients and families, close to the hospital.
          </p>

          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 mt-6 bg-white border border-line rounded-lg p-4 text-left"
          >
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="border border-line rounded-md px-3 py-2 text-sm"
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

            <div className="flex gap-3">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min Price"
                className="w-1/2 border border-line rounded-md px-3 py-2 text-sm"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max Price"
                className="w-1/2 border border-line rounded-md px-3 py-2 text-sm"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-dark"
            >
              Search
            </button>
          </form>
        </div>

        {/* image half - no padding, stretches to the true edge of the viewport */}
        <div className="md:w-1/2">
          <img
            src={heroImage}
            alt=""
            className="w-full h-64 md:h-[520px] object-cover"
          />
        </div>

      </div>
    </section>
  );
}

export default Home;