import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface MapComponentProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

export function CreateUpdatePostMapComponent({
  onLocationSelect,
  initialLat,
  initialLng,
}: MapComponentProps) {
  const [selectedPosition, setSelectedPosition] = useState<
    [number, number] | null
  >(
    initialLat !== undefined && initialLng !== undefined
      ? [initialLat, initialLng]
      : null,
  );

  // Update marker when initialLat and initialLng change
  useEffect(() => {
    if (initialLat !== undefined && initialLng !== undefined) {
      setSelectedPosition([initialLat, initialLng]);
    }
  }, [initialLat, initialLng]);

  // Custom component to handle map click event
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setSelectedPosition([lat, lng]);
        onLocationSelect(lat, lng); // Pass coordinates to parent
      },
    });

    return null;
  }

  return (
    <MapContainer
      center={selectedPosition || [31.7917, -7.0926]} // Default center (Morocco) or selected position
      zoom={6}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />
      <TileLayer
        attribution='&copy; <a href="https://www.google.com/maps">Google</a>'
        url="http://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}"
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
    </MapContainer>
  );
}
