function initMap(listing) {
  // Create the address from listing data (e.g., "Aspen, United States")
  let coords = [28.6139, 77.2088];
  let hasCoords =
    listing.geometry &&
    listing.geometry.coordinates &&
    listing.geometry.coordinates.length === 2;

  if (hasCoords) {
    coords = [listing.geometry.coordinates[1], listing.geometry.coordinates[0]];
    console.log("Using stored Coordinates: ", coords);
  }

  // Create the map and set a default center (new Delhi, as a backup)
  const map = L.map("map").setView(coords, 13);

  // Add the OpenStreetMap background (tiles)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // add marker (use stored coords or default)
  L.marker(coords)
    .addTo(map)
    .bindPopup(
      `<b>${
        listing.title
      }</b><br/><b>₹</b>${listing.price.toLocaleString()}/night<br/>${
        listing.description
      } ${hasCoords ? "" : "<br/>Location approximate"}`
    )
    .openPopup();

  // Use Nominatim to geocode the address
  if (!hasCoords) {
    let address = `${listing.location}, ${listing.country}`;
    console.log("Geocoding address: ", address);

    fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        address
      )}&format=json&limit=1`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.length > 0) {
          const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)]; // Get lat, lng
          // console.log("Geocoded coordinates:", coords);

          // Move the map to the listing's location
          map.setView(coords, 13);

          // Add a marker at the location
          L.marker(coords)
            .addTo(map)
            .bindPopup(
              `<b>${
                listing.title
              }</b><br/><b>₹</b>${listing.price.toLocaleString()}/night<br/>${
                listing.description
              } ${hasCoords ? "" : "<br/>Location approximate"}`
            )
            .openPopup();
        } else {
          console.error("No geocoding results for:", address);
        }
      })
      .catch((error) => console.error("Geocoding failed:", error));
  }
}
