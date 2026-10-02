document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
  console.log("Bus Tracker App initialized");

  // Initialize the map
  initMap();
  
  // Initialize UI interactions
  initUIInteractions();
  
  // Simulate real-time bus updates
  simulateBusUpdates();
}

function initMap() {
  // Initialize Leaflet map
  const map = L.map('map').setView([40.7128, -74.0060], 13); // NYC coordinates as example
  
  // Add OpenStreetMap tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map);
  
  // Add bus markers
  addBusMarkers(map);
  
  // Add bus stops
  addBusStops(map);
  
  // Add route lines
  addRouteLines(map);
  
  // Store map reference for later use
  window.busTrackerMap = map;
  
  // Add map controls functionality
  document.getElementById('locate-me').addEventListener('click', () => {
    map.locate({setView: true, maxZoom: 16});
  });
  
  document.getElementById('zoom-in').addEventListener('click', () => {
    map.zoomIn();
  });
  
  document.getElementById('zoom-out').addEventListener('click', () => {
    map.zoomOut();
  });
  
  // Handle location found event
  map.on('locationfound', (e) => {
    const radius = e.accuracy / 2;
    
    // Add user location marker
    const userMarker = L.marker(e.latlng).addTo(map)
      .bindPopup("You are within " + radius + " meters from this point").openPopup();
      
    L.circle(e.latlng, radius).addTo(map);
  });
  
  // Handle location error
  map.on('locationerror', (e) => {
    alert("Could not find your location: " + e.message);
  });
}

function addBusMarkers(map) {
  // Sample bus data - in a real app, this would come from an API
  const buses = [
    { id: 1, number: "101", route: "Downtown - Airport", lat: 40.7128, lng: -74.0060, status: "on-time", eta: "3 min" },
    { id: 2, number: "202", route: "Central Station - University", lat: 40.7200, lng: -74.0100, status: "on-time", eta: "7 min" },
    { id: 3, number: "305", route: "Shopping Mall - Beach", lat: 40.7300, lng: -73.9950, status: "delayed", eta: "12 min" }
  ];
  
  // Create a custom bus icon
  const busIcon = L.divIcon({
    className: 'bus-marker',
    html: '<i class="fas fa-bus" style="color: #1a73e8; font-size: 24px;"></i>',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
  
  // Add markers for each bus
  buses.forEach(bus => {
    const marker = L.marker([bus.lat, bus.lng], {icon: busIcon}).addTo(map);
    
    // Add popup with bus info
    marker.bindPopup(`
      <div class="bus-popup">
        <div class="bus-popup-number">${bus.number}</div>
        <div class="bus-popup-route">${bus.route}</div>
        <div class="bus-popup-status ${bus.status === 'delayed' ? 'delayed' : ''}">
          <i class="fas fa-circle"></i> ${bus.status === 'delayed' ? 'Delayed' : 'On time'}
        </div>
        <div class="bus-popup-eta">ETA: ${bus.eta}</div>
      </div>
    `);
    
    // Store marker reference
    marker.busId = bus.id;
    
    // Add click event to show bus details
    marker.on('click', () => {
      showBusDetails(bus.id);
      
      // Highlight the corresponding bus in the sidebar
      document.querySelectorAll('.bus-item').forEach(item => {
        item.classList.remove('active');
      });
      document.querySelector(`.bus-item[data-bus-id="${bus.id}"]`).classList.add('active');
    });
  });
}

function addBusStops(map) {
  // Sample bus stop data
  const busStops = [
    { name: "Central Station", lat: 40.7128, lng: -74.0060 },
    { name: "City Hall", lat: 40.7160, lng: -74.0090 },
    { name: "Convention Center", lat: 40.7210, lng: -74.0030 },
    { name: "Airport Terminal", lat: 40.7300, lng: -73.9900 },
    { name: "University", lat: 40.7250, lng: -74.0150 },
    { name: "Shopping Mall", lat: 40.7350, lng: -74.0000 },
    { name: "Beach", lat: 40.7400, lng: -73.9850 }
  ];
  
  // Create a custom bus stop icon
  const stopIcon = L.divIcon({
    className: 'stop-marker',
    html: '<i class="fas fa-map-marker-alt" style="color: #e53935; font-size: 20px;"></i>',
    iconSize: [20, 20],
    iconAnchor: [10, 20]
  });
  
  // Add markers for each bus stop
  busStops.forEach(stop => {
    const marker = L.marker([stop.lat, stop.lng], {icon: stopIcon}).addTo(map);
    
    // Add popup with stop info
    marker.bindPopup(`
      <div class="stop-popup">
        <div class="stop-popup-name">${stop.name}</div>
        <div class="stop-popup-next">Next buses:</div>
        <div class="stop-popup-bus">101: 3 min</div>
        <div class="stop-popup-bus">202: 15 min</div>
        <div class="stop-popup-bus">305: 22 min</div>
      </div>
    `);
  });
}

function addRouteLines(map) {
  // Sample route data
  const routes = [
    {
      id: 101,
      color: "#1a73e8",
      path: [
        [40.7128, -74.0060], // Central Station
        [40.7160, -74.0090], // City Hall
        [40.7210, -74.0030], // Convention Center
        [40.7300, -73.9900]  // Airport Terminal
      ]
    },
    {
      id: 202,
      color: "#4caf50",
      path: [
        [40.7128, -74.0060], // Central Station
        [40.7250, -74.0150]  // University
      ]
    },
    {
      id: 305,
      color: "#ff9800",
      path: [
        [40.7350, -74.0000], // Shopping Mall
        [40.7400, -73.9850]  // Beach
      ]
    }
  ];
  
  // Add polylines for each route
  routes.forEach(route => {
    const polyline = L.polyline(route.path, {
      color: route.color,
      weight: 5,
      opacity: 0.7,
      dashArray: route.id === 305 ? '10, 10' : null // Dashed line for delayed route
    }).addTo(map);
    
    polyline.bindPopup(`Route ${route.id}`);
  });
}

function initUIInteractions() {
  // Bus item click in sidebar
  document.querySelectorAll('.bus-item').forEach(item => {
    item.addEventListener('click', () => {
      const busId = parseInt(item.getAttribute('data-bus-id'));
      
      // Remove active class from all items
      document.querySelectorAll('.bus-item').forEach(i => {
        i.classList.remove('active');
      });
      
      // Add active class to clicked item
      item.classList.add('active');
      
      // Show bus details
      showBusDetails(busId);
      
      // Center map on bus
      const buses = [
        { id: 1, lat: 40.7128, lng: -74.0060 },
        { id: 2, lat: 40.7200, lng: -74.0100 },
        { id: 3, lat: 40.7300, lng: -73.9950 }
      ];
      
      const bus = buses.find(b => b.id === busId);
      if (bus && window.busTrackerMap) {
        window.busTrackerMap.setView([bus.lat, bus.lng], 15);
      }
    });
  });
  
  // Close button for bus details panel
  document.querySelector('.close-btn').addEventListener('click', () => {
    document.querySelector('.bus-details-panel').classList.remove('active');
  });
  
  // Navigation buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all nav buttons
      document.querySelectorAll('.nav-btn').forEach(b => {
        b.classList.remove('active');
      });
      
      // Add active class to clicked button
      btn.classList.add('active');
      
      // In a real app, this would switch between different views
      alert(`Switching to ${btn.textContent.trim()} view`);
    });
  });
  
  // Search functionality
  const searchBox = document.querySelector('.search-box input');
  const searchBtn = document.querySelector('.search-box button');
  
  searchBtn.addEventListener('click', () => {
    performSearch(searchBox.value);
  });
  
  searchBox.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch(searchBox.value);
    }
  });
  
  // Favorite items click
  document.querySelectorAll('.favorite-item').forEach(item => {
    item.addEventListener('click', () => {
      const routeName = item.textContent.trim();
      alert(`Showing details for ${routeName}`);
    });
  });
}

function performSearch(query) {
  if (!query.trim()) {
    alert('Please enter a search term');
    return;
  }
  
  alert(`Searching for: ${query}`);
  // In a real app, this would filter the bus list or search for routes/stops
}

function showBusDetails(busId) {
  // Get bus details panel
  const detailsPanel = document.querySelector('.bus-details-panel');
  
  // Update panel title
  detailsPanel.querySelector('.panel-header h3').textContent = `Bus #${busId === 1 ? '101' : busId === 2 ? '202' : '305'}`;
  
  // Update route name
  const routeName = busId === 1 ? 'Downtown - Airport' : 
                    busId === 2 ? 'Central Station - University' : 
                    'Shopping Mall - Beach';
  detailsPanel.querySelector('.route-name').textContent = routeName;
  
  // Update status
  const statusEl = detailsPanel.querySelector('.bus-status');
  if (busId === 3) {
    statusEl.innerHTML = '<i class="fas fa-circle"></i> Delayed';
    statusEl.classList.add('delayed');
  } else {
    statusEl.innerHTML = '<i class="fas fa-circle"></i> On time';
    statusEl.classList.remove('delayed');
  }
  
  // Show the panel
  detailsPanel.classList.add('active');
}

function simulateBusUpdates() {
  // In a real app, this would be replaced with real-time data from an API
  // This function simulates bus movement by updating positions every few seconds
  
  // Sample movement patterns (small lat/lng changes)
  const movements = [
    { lat: 0.0005, lng: 0.0003 },
    { lat: -0.0003, lng: 0.0005 },
    { lat: 0.0002, lng: -0.0004 },
    { lat: -0.0004, lng: -0.0002 }
  ];
  
  // Update bus positions every 3 seconds
  setInterval(() => {
    if (!window.busTrackerMap) return;
    
    // Get all bus markers
    window.busTrackerMap.eachLayer(layer => {
      if (layer instanceof L.Marker && layer.busId) {
        // Get random movement
        const movement = movements[Math.floor(Math.random() * movements.length)];
        
        // Get current position
        const currentPos = layer.getLatLng();
        
        // Calculate new position
        const newPos = L.latLng(
          currentPos.lat + movement.lat,
          currentPos.lng + movement.lng
        );
        
        // Update marker position with animation
        layer.setLatLng(newPos);
        
        // Update corresponding bus item in sidebar
        const busItem = document.querySelector(`.bus-item[data-bus-id="${layer.busId}"]`);
        if (busItem) {
          // Update ETA randomly sometimes
          if (Math.random() > 0.7) {
            const etaEl = busItem.querySelector('.bus-eta');
            const currentEta = parseInt(etaEl.textContent);
            const newEta = Math.max(1, currentEta + (Math.random() > 0.5 ? 1 : -1));
            etaEl.textContent = `${newEta} min`;
          }
        }
      }
    });
  }, 3000);
}
