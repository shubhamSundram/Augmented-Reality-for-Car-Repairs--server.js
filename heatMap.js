// HeatmapComponent.js
import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript, HeatmapLayer } from "@react-google-maps/api";

const HeatmapComponent = () => {
  const [heatmapData, setHeatmapData] = useState([]);

  // Fetch heatmap data from the backend (you should have an API endpoint for it)
  useEffect(() => {
    fetch("/api/safety/heatmap")
      .then((response) => response.json())
      .then((data) => {
        const locations = data.map((entry) => ({
          location: new window.google.maps.LatLng(entry.latitude, entry.longitude),
          weight: 100 - entry.safetyScore, // Lower safety score means higher weight
        }));
        setHeatmapData(locations);
      })
      .catch((error) => console.error("Error fetching heatmap data:", error));
  }, []);

  // Map configuration
  const mapContainerStyle = {
    width: "100%",
    height: "400px",
  };

  const center = { lat: 28.7041, lng: 77.1025 }; // Example: Centered on New Delhi, India

  return (
    <div>
      <h2>Interactive Heatmap of Unsafe Zones</h2>
      <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
        <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={12}>
          <HeatmapLayer data={heatmapData} />
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default HeatmapComponent;
