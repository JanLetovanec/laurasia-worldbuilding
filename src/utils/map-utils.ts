import L from 'leaflet';

export const toBounds = (coords: [[number, number], [number, number]]): L.LatLngBounds =>
  L.latLngBounds(
    L.latLng(coords[0][0], coords[0][1]),
    L.latLng(coords[1][0], coords[1][1])
  );