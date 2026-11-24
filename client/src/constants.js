import { Sofa, Snowflake, UtensilsCrossed, ParkingCircle } from "lucide-react";

export const PROPERTY_TYPES = [
  "Room",
  "1 RK",
  "1 BHK",
  "2 BHK",
  "3 BHK",
  "Independent House",
  "PG",
];

export const AMENITIES = {
  furnished: { label: "Furnished", Icon: Sofa },
  ac: { label: "AC", Icon: Snowflake },
  kitchenAccess: { label: "Kitchen access", Icon: UtensilsCrossed },
  parking: { label: "Parking", Icon: ParkingCircle },
};
