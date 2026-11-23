import { useState, useEffect } from "react";
import api from "../api/axios";
import PropertyCard from "../components/PropertyCard.jsx";
import { useSearchParams } from "react-router-dom";
import { PROPERTY_TYPES } from "../constants/propertyTypes";

function Properties() {
  const [searchParams] = useSearchParams();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [propertyType, setPropertyType] = useState(
    searchParams.get("propertyType") || "",
  );
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  // builds the filter object and asks the backend for matching properties
  async function fetchProperties() {
    setLoading(true);
    setError("");
    const params = {};
    if (location) params.location = location;
    if (propertyType) params.propertyType = propertyType;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;

    try {
      const response = await api.get("/api/properties", { params });
      setProperties(response.data);
    } catch (error) {
      console.error("Failed to fetch properties:", error);
      setError("Could not load properties. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // runs once on page load only - no filter yet so all properties shows at once
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
          {PROPERTY_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
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

      {loading ? (
        <p className="text-center text-muted mt-12">Loading properties...</p>
      ) : error ? (
        <p className="text-center text-danger mt-12">{error}</p>
      ) : properties.length === 0 ? (
        <p className="text-center text-muted mt-12">
          No properties found. Try changing your filters.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {properties.map((property) => (
            <PropertyCard key={property._id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Properties;
