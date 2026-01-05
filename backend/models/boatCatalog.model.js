// backend/models/boat.model.js
import mongoose from "mongoose";

const boatSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    model: { type: String },
    category: {
      type: String,
      enum: [
        "Speed Boats", 
        "Yachts", 
        "Fishing Boats", 
        "Sailboats", 
        "Pontoon Boats", 
        "Jet Skis & Water Sports", 
        "Cruisers", 
        "Catamarans", 
        "Commercial Boats", 
        "Other Boats"
      ],
    },
    length: Number,
    lengthUnit: { type: String, enum: ["ft", "meters"], default: "ft" },
    engineType: { type: String, enum: ["Diesel", "Petrol", "Electric", "Hybrid", "Other"] },
    enginePower: Number,
    powerUnit: { type: String, enum: ["HP", "kW"], default: "HP" },
    fuelCapacity: Number,
    fuelUnit: { type: String, enum: ["liters", "gallons"], default: "liters" },
    passengerCapacity: Number,
    crewCapacity: Number,
    yearOfManufacture: Number,
    hullMaterial: { type: String, enum: ["Fiberglass", "Aluminum", "Steel", "Wood", "Carbon Fiber", "Other"] },
    features: [String],
    description: String,
    specifications: String,
  },
  { timestamps: true }
);

const Boat = mongoose.model("Boat", boatSchema);
export default Boat;