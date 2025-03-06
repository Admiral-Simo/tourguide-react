import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "leaflet/dist/leaflet.css";

interface PostInfo {
  id?: number; // ID is now optional
  lat: number;
  lng: number;
  title: string;
}

interface MapComponentProps {
  posts: PostInfo[];
  pixelHeight: number;
}

export function ShowPostMapComponent({
  posts,
  pixelHeight,
}: MapComponentProps) {
  const navigate = useNavigate(); // Initialize navigation function

  return (
    <MapContainer
      center={[31.7917, -7.0926]} // Default center (Morocco)
      zoom={6}
      scrollWheelZoom={false}
      style={{ height: `${pixelHeight}px`, width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {posts.map(({ id, lat, lng, title }) => (
        <Marker
          key={`${lat}-${lng}`} // Use lat-lng as a fallback key
          position={[lat, lng]}
          eventHandlers={{
            click: () => {
              if (id) {
                navigate(`/posts/${id}`); // Navigate if ID exists
              }
            },
          }}
        >
          <Popup>{title}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
