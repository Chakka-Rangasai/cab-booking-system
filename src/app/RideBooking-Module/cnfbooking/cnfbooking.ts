import {
  Component,
  OnInit,
  Inject,
  PLATFORM_ID,
  NgZone,
  ChangeDetectorRef
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import mapboxgl from 'mapbox-gl';
import { environment } from '../../../environments/environment';
import { UserBooking ,BookingData} from '../../user-booking';


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

  fareEconomy = 0;
  fareXL = 0;
  isLoading = true;

  originPlaceName = '';
  destinationPlaceName = '';
  amount = 0;

  userid: number | undefined = (JSON.parse(localStorage.getItem("userProfileDetails")!) as { userId: number }).userId;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private userbooking: UserBooking
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
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

  selectVehicle(type: string) {
    this.selectedVehicle = type;
    this.amount = type === 'CabEconomy' ? this.fareEconomy : type === 'CabXl' ? this.fareXL : 0;
  }

  setMarker(coords: [number, number], label: string) {
    const popup = new mapboxgl.Popup({ offset: 25 }).setText(label);
    new mapboxgl.Marker().setLngLat(coords).setPopup(popup).addTo(this.map);
  }
  // async is used to tell angular that this methods needs a promise means an asynchronous data to go further .
  async drawRoute() {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${this.originCoords.join(',')};${this.destinationCoords.join(',')}?geometries=geojson&access_token=${environment.mapbox.accessToken}`;

    try {
      // await is used to make the excecution stop only at this line only in this method until i get the full response as promise.
      const res = await fetch(url);
      const data = await res.json();

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
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  }
bookRide() {
  const bookingData = {
    origin: this.originPlaceName,
    destination: this.destinationPlaceName,
    amount: this.amount,
    distance: this.distance,
    userId: this.userid!
  };

  console.log('Prepared booking data:', bookingData);

  this.userbooking.bookRide(bookingData).subscribe({
    next: (response) => {
      console.log('Booking successful:', response);

      
      //alert('Booking successfully.');
      this.router.navigate(['/userhomenav/booking-waiting'],
        {
              queryParams: { id: response.requestId }
    });
      // this.router.navigate(['/userhomenav']);
    },
    error: (err) => {
      console.error('Error storing booking:', err.error || err.message || err);
      alert('Failed to book ride. Please try again later.');
    }
  });
}

}
