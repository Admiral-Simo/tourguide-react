import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const position: [number, number] = [31.7917, -7.0926]; // Coordinates for Morocco

export function MapPage() {
  return (
    <MapContainer
      center={position}
      zoom={6} // Adjust zoom level for a better view of Morocco
      scrollWheelZoom={false}
      style={{ height: "500px", width: "100%" }} // Ensures proper display
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>
          Welcome to Morocco! 🇲🇦 <br /> Explore the beauty of this country.
        </Popup>
      </Marker>
    </MapContainer>
  );
}
