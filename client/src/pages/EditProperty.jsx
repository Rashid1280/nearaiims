import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';

const AMENITIES = ['furnished', 'ac', 'kitchenAccess', 'parking'];

function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [propertyType, setPropertyType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [distanceFromAiimsKm, setDistanceFromAiimsKm] = useState('');
  const [priceType, setPriceType] = useState('weekly');
  const [price, setPrice] = useState('');
  const [amenities, setAmenities] = useState([]);
  const [ownerContactNumber, setOwnerContactNumber] = useState('');
  const [images, setImages] = useState([]); // newly selected replacement files, if any
  const [existingImages, setExistingImages] = useState([]); // paths already on the server
  const [ownerId, setOwnerId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // loads the existing listing once, and fills every field with its current values
  useEffect(() => {
    async function fetchProperty() {
      try {
        const response = await api.get(`/api/properties/${id}`);
        const property = response.data;

        setPropertyType(property.propertyType);
        setDescription(property.description);
        setLocation(property.location);
        setAddress(property.address);
        setDistanceFromAiimsKm(property.distanceFromAiimsKm ?? '');
        setPriceType(property.priceType);
        setPrice(property.price);
        setAmenities(property.amenities || []);
        setOwnerContactNumber(property.ownerContactNumber || '');
        setExistingImages(property.images || []);
        setOwnerId(property.owner?._id || property.owner);
      } catch {
        setLoadError('Could not load this listing.');
      } finally {
        setLoading(false);
      }
    }

    fetchProperty();
  }, [id]);

  function toggleAmenity(amenity) {
    setAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const formData = new FormData();
    formData.append('propertyType', propertyType);
    formData.append('description', description);
    formData.append('location', location);
    formData.append('address', address);
    if (distanceFromAiimsKm) formData.append('distanceFromAiimsKm', distanceFromAiimsKm);
    formData.append('priceType', priceType);
    formData.append('price', price);
    formData.append('ownerContactNumber', ownerContactNumber);

    amenities.forEach((amenity) => formData.append('amenities', amenity));

    // only attach new photos if the owner actually picked replacements -
    // the backend leaves the existing images untouched when none are sent
    images.forEach((file) => formData.append('images', file));

    setSubmitting(true);
    try {
      await api.put(`/api/properties/${id}`, formData);
      navigate(`/properties/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-center text-muted mt-12">Loading listing...</p>;
  }

  if (loadError) {
    return <p className="text-center text-danger mt-12">{loadError}</p>;
  }

  if (user && ownerId && user.id !== ownerId) {
    return <p className="text-center text-danger mt-12">You don't have permission to edit this listing.</p>;
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-ink">Edit property</h1>

      <form onSubmit={handleSubmit} className="mt-6 border border-line rounded-lg p-6 flex flex-col gap-4">

        <label className="block">
          <span className="text-sm text-muted">Property type</span>
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            required
            className="w-full border border-line rounded-md px-3 py-2 text-sm mt-1"
          >
            <option value="">Select type</option>
            <option value="Room">Room</option>
            <option value="1 RK">1 RK</option>
            <option value="1 BHK">1 BHK</option>
            <option value="2 BHK">2 BHK</option>
            <option value="3 BHK">3 BHK</option>
            <option value="Independent House">Independent House</option>
            <option value="PG">PG</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm text-muted">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows="3"
            className="w-full border border-line rounded-md px-3 py-2 text-sm mt-1"
          />
        </label>

        <label className="block">
          <span className="text-sm text-muted">Location</span>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            placeholder="e.g. Tatibandh, Raipur"
            className="w-full border border-line rounded-md px-3 py-2 text-sm mt-1"
          />
        </label>

        <label className="block">
          <span className="text-sm text-muted">Full address</span>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="w-full border border-line rounded-md px-3 py-2 text-sm mt-1"
          />
        </label>

        <label className="block">
          <span className="text-sm text-muted">Distance from AIIMS (km) — optional</span>
          <input
            type="number"
            value={distanceFromAiimsKm}
            onChange={(e) => setDistanceFromAiimsKm(e.target.value)}
            step="0.1"
            min="0"
            className="w-full border border-line rounded-md px-3 py-2 text-sm mt-1"
          />
        </label>

        <div className="flex gap-3">
          <label className="block flex-1">
            <span className="text-sm text-muted">Price type</span>
            <select
              value={priceType}
              onChange={(e) => setPriceType(e.target.value)}
              className="w-full border border-line rounded-md px-3 py-2 text-sm mt-1"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>

          <label className="block flex-1">
            <span className="text-sm text-muted">Price (₹)</span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min="0"
              className="w-full border border-line rounded-md px-3 py-2 text-sm mt-1"
            />
          </label>
        </div>

        <div>
          <span className="text-sm text-muted">Amenities</span>
          <div className="flex flex-wrap gap-4 mt-2">
            {AMENITIES.map((amenity) => (
              <label key={amenity} className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={amenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                />
                {amenity}
              </label>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="text-sm text-muted">Owner contact number</span>
          <input
            value={ownerContactNumber}
            onChange={(e) => setOwnerContactNumber(e.target.value)}
            required
            className="w-full border border-line rounded-md px-3 py-2 text-sm mt-1"
          />
        </label>

        {existingImages.length > 0 && (
          <div>
            <span className="text-sm text-muted">Current photos</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {existingImages.map((path) => (
                <img
                  key={path}
                  src={path}
                  alt=""
                  className="w-20 h-20 object-cover rounded-md border border-line"
                />
              ))}
            </div>
          </div>
        )}

        <label className="block">
          <span className="text-sm text-muted">Replace photos — optional, leave blank to keep the current ones</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImages(Array.from(e.target.files))}
            className="w-full text-sm mt-1"
          />
        </label>

        {error && <p className="text-danger text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full px-5 py-2 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-dark disabled:opacity-50"
        >
          {submitting ? 'Saving changes...' : 'Save changes'}
        </button>

      </form>
    </div>
  );
}

export default EditProperty;