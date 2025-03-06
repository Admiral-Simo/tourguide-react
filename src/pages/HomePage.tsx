import { useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function HomePage() {
  const [selectedPosition, setSelectedPosition] = useState<
    [number, number] | null
  >(null);

  // Custom component to handle map click event
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setSelectedPosition([lat, lng]);
        alert("Selected Position:" + lat + lng); // You can save this data in a database or state management
      },
    });

    return null;
  }

  return (
    <MapContainer
      center={[31.7917, -7.0926]} // Default center (Morocco)
      zoom={6}
      scrollWheelZoom={false}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Component to handle click events */}
      <MapClickHandler />

      {/* Show a marker at the selected position */}
      {selectedPosition && (
        <Marker position={selectedPosition}>
          <Popup>
            Selected Location: <br /> Lat: {selectedPosition[0]}, Lng:{" "}
            {selectedPosition[1]}
          </Popup>
        </Marker>
      )}

      {/* Button to "save" the location (example) */}
      {selectedPosition && (
        <button
          onClick={() =>
            alert(
              `Location saved: ${selectedPosition[0]}, ${selectedPosition[1]}`,
            )
          }
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            zIndex: 1000,
            padding: "10px",
            backgroundColor: "blue",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Save Location
        </button>
      )}
    </MapContainer>
  );
}
