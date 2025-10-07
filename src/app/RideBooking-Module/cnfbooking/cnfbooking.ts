import { Component, OnInit, Inject, PLATFORM_ID, NgZone, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import mapboxgl from 'mapbox-gl';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cnf-booking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cnfbooking.html',
  styleUrls: ['./cnfbooking.css']
})
export class Cnfbooking implements OnInit {
  map!: mapboxgl.Map;
  originCoords: [number, number] = [0, 0];
  destinationCoords: [number, number] = [0, 0];
  distance = '';
  duration = '';
  rawDistance = 0;
  isBrowser = false;
  selectedVehicle: string | null = null;

  fareEconomy: number = 0;
  fareXL: number = 0;
  isLoading: boolean = true;

  originPlaceName: string = '';
  destinationPlaceName: string = '';

  amount: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  selectVehicle(type: string) {
  this.selectedVehicle = type;

  if (type === 'CabEconomy') {
    this.amount = this.fareEconomy;
  } else if (type === 'CabXl') {
    this.amount = this.fareXL;
  } else {
    this.amount = 0; // fallback for unknown types
  }
}

  ngOnInit(): void {
    if (!this.isBrowser) return;

    mapboxgl.accessToken = environment.mapbox.accessToken;

    this.route.queryParams.subscribe(async params => {
      const origin = params['origin']?.split(',').map(Number) as [number, number];
      const destination = params['destination']?.split(',').map(Number) as [number, number];
      const originPlaceName = params['originName'];
      const destinationPlaceName = params['destinationName'];

      if (origin && destination) {
        this.originCoords = origin;
        this.destinationCoords = destination;

        this.originPlaceName = originPlaceName || '';
        this.destinationPlaceName = destinationPlaceName || '';

        this.map = new mapboxgl.Map({
          container: 'map',
          style: 'mapbox://styles/mapbox/streets-v11',
          center: origin,
          zoom: 12
        });

        this.map.on('load', async () => {
          this.setMarker(origin, 'Origin');
          this.setMarker(destination, 'Destination');
          await this.drawRoute(); 
        });
      }
    });
  }

  setMarker(coords: [number, number], label: string) {
    const popup = new mapboxgl.Popup({ offset: 25 }).setText(label);
    new mapboxgl.Marker().setLngLat(coords).setPopup(popup).addTo(this.map);
  }

  async drawRoute() {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${this.originCoords.join(',')};${this.destinationCoords.join(',')}?geometries=geojson&access_token=${environment.mapbox.accessToken}`;

    let data;
    try {
      const res = await fetch(url);
      data = await res.json();
    } catch (error) {
      console.error('Error fetching route:', error);
      return;
    }

    if (!data || !data.routes.length) {
      console.warn('No route data available');
      return;
    }

    const route = data.routes[0].geometry;

    this.ngZone.run(() => {
      this.rawDistance = data.routes[0].distance / 1000;
      this.distance = this.rawDistance.toFixed(2) + ' km';

      const totalMinutes = Math.floor(data.routes[0].duration / 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      this.duration = `${hours} hrs ${minutes} mins`;

      this.fareEconomy = Math.ceil(this.rawDistance * 8);
      this.fareXL = Math.ceil(this.rawDistance * 10);
      this.isLoading = false;
      this.cdr.detectChanges();
    });

    this.map.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: route,
        properties: {}
      }
    });

    this.map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3887be',
        'line-width': 5,
        'line-opacity': 0.75
      }
    });

    this.map.fitBounds([this.originCoords, this.destinationCoords], {
      padding: 50,
      maxZoom: 15,
      duration: 1000
    });
  }

  async getPlaceName(coords: [number, number]): Promise<string> {
    const [lng, lat] = coords;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${environment.mapbox.accessToken}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        return data.features[0].place_name;
      }
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
    }

    return 'Unknown Location';
  }

  bookRide() {
    this.router.navigate(['/userhomenav/booking-confirmation'], {
      queryParams: {
        vehicle: this.selectedVehicle,
        distance: this.distance,
        origin: this.originPlaceName,
        destination: this.destinationPlaceName,
        amount: this.amount
      }
    });
  }
}