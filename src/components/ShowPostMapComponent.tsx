import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface MapComponentProps {
  lat: number;
  lng: number;
  title: string;
}

export function ShowPostMapComponent({ lat, lng, title }: MapComponentProps) {
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

      <Marker position={[lat, lng]}>
        <Popup>{title}</Popup>
      </Marker>
    </MapContainer>
  );
}
