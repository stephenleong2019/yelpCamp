mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
  center: campground.geometry.coordinates, // starting position [lng, lat]
  zoom: 12, // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker()
  .setLngLat(campground.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 10})
      .setHTML(
        `
    <h5>${campground.title}</h5>
    <h6 class="mb-2 text-muted">${campground.location}</h6>
    <a href="https://www.google.com.hk/maps/place/${campground.location}/@${campground.geometry.coordinates[1]},${campground.geometry.coordinates[0]}" target="_blank" class="btn-sm btn-primary">Direct to location</a>`,
      ),
  )
  .addTo(map);
