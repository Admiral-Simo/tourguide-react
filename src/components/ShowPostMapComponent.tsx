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

export function ShowPostMapComponent({ posts }: MapComponentProps) {
  const navigate = useNavigate(); // Initialize navigation function

  return (
    <MapContainer
      center={[31.7917, -7.0926]} // Default center (Morocco)
      zoom={6}
      style={{ height: "92vh", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />
      <TileLayer
        attribution='&copy; <a href="https://www.google.com/maps">Google</a>'
        url="http://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}"
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
