import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function PropertyDetail(){

    const {id} = useParams();
    const [property, setProperty] = useState(null);

    useEffect(()=>{
        async function fetchProperty() {
            try {
                const response = await axios.get(`http://localhost:5000/api/properties/${id}`);
                setProperty(response.data);
            } catch (error) {
                console.error('Failed to fetch property:', error)
            }
        }

        fetchProperty();
    },[id]);

      if (!property) {
    return <p>Loading...</p>;
  }

  const { propertyType, location, address, price, priceType, description, images, owner } = property;

    return(
        <div>
      <h1>{propertyType} in {location}</h1>
      <p>{address}</p>
      <p>₹{price} / {priceType}</p>
      <p>{description}</p>
      <p>Listed by: {owner?.name}</p>

      <div>
        {images && images.map((img, index) => (
          <img
            key={index}
            src={`http://localhost:5000${img}`}
            alt={`${propertyType} photo ${index + 1}`}
            width="300"
          />
        ))}
      </div>
    </div>
    )
}

export default PropertyDetail;