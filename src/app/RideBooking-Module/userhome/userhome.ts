import {Component, OnInit, AfterViewInit, Inject, PLATFORM_ID, ElementRef, ViewChild } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

declare global {
  interface Window { mapboxgl: any; }
}
@Component({
  selector: 'app-userhome',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './userhome.html',
  styleUrls: ['./userhome.css']
})
export class Userhome implements OnInit, AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

  private map: any;
  isBrowser = false;

  originQuery = '';
  destinationQuery = '';
  originSuggestions: any[] = [];
  destinationSuggestions: any[] = [];
  originCoords: [number, number] | null = null;
  destinationCoords: [number, number] | null = null;

  //The place name that is are storing in that and passing through the query params 
originPlaceName = '';
destinationPlaceName = '';
// This only to tell that user used current location or not 
usedCurrentLocation = false;

  error = '';
  mapReady = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private router: Router) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {}

  async ngAfterViewInit(): Promise<void> {
    if (!this.isBrowser) return;

    // Sanity checks
    if (!this.mapContainer?.nativeElement) {
      console.error('[Mapbox] container not found');
      return;
    }
    const token = environment?.mapbox?.accessToken;
    if (!token || !token.startsWith('pk.')) {
      console.error('[Mapbox] invalid/missing public access token');
      return;
    }

    const gl = (window as any).mapboxgl;
    if (!gl) {
      console.error('[Mapbox] CDN script not loaded (check index.html and network)');
      return;
    }

    try {
      gl.accessToken = token;
      this.map = new gl.Map({
        container: this.mapContainer.nativeElement,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [73.8567, 18.5204],
        zoom: 12,
      });

      this.map.on('load', () => {
        this.mapReady = true;
        console.log('[Mapbox] loaded');
      });

      this.map.on('error', (e: any) => console.error('[Mapbox] runtime error:', e?.error ?? e));
    } catch (err) {
      console.error('[Mapbox] failed to initialize:', err);
      // Do NOT set this.error here; keep your UI clean. Log only.
    }
  }
  private async geocodeQuery(query: string): Promise<any[]> {
    if (!query?.trim()) return [];
    const url =
      `https://api.mapbox.com/geocoding/v5/mapbox.places/` +
      `${encodeURIComponent(query)}.json?` +
      `access_token=${environment.mapbox.accessToken}&autocomplete=true&limit=5`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error('[Geocoding] HTTP error:', res.status, res.statusText);
        return [];
      }
      const data = await res.json();
      return data.features || [];
    } catch (e) {
      console.error('[Geocoding] fetch failed:', e);
      return [];
    }
  }

  async searchOrigin() {
    this.originSuggestions = await this.geocodeQuery(this.originQuery);
  }

  async searchDestination() {
    this.destinationSuggestions = await this.geocodeQuery(this.destinationQuery);
  }

  onSelectOrigin(event: MouseEvent, suggestion: any) {
    event.preventDefault();
    event.stopPropagation();
    this.selectOrigin(suggestion);
  }

  onSelectDestination(event: MouseEvent, suggestion: any) {
    event.preventDefault();
    event.stopPropagation();
    this.selectDestination(suggestion);
  }

  private selectOrigin(suggestion: any) {
    this.originQuery = suggestion.place_name;
     //This is storing value of origin in variable and using to pass through the query params 
    this.originPlaceName = suggestion.place_name;
    this.originCoords = suggestion.center;
    this.originSuggestions = []; 
    if (this.mapReady && this.map) {
      this.map.flyTo({ center: suggestion.center, zoom: 14 });
    }
  }

  private selectDestination(suggestion: any) {
    this.destinationQuery = suggestion.place_name;
    //This is storing value of destination in variable and using to pass through the query params 
    this.destinationPlaceName = suggestion.place_name; 
    this.destinationCoords = suggestion.center;
    this.destinationSuggestions = [];
    if (this.mapReady && this.map) {
      this.map.flyTo({ center: suggestion.center, zoom: 14 });
    }
  }

  useCurrentLocation() {
    if (!this.isBrowser || typeof navigator === 'undefined' || !navigator.geolocation) {
      this.error = 'Geolocation is not supported by your browser.';
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        this.originCoords = [longitude, latitude];
             this.usedCurrentLocation = true; 

        const url =
          `https://api.mapbox.com/geocoding/v5/mapbox.places/` +
          `${longitude},${latitude}.json?access_token=${environment.mapbox.accessToken}`;

        try {
          const res = await fetch(url);
          const data = await res.json();
          const placeName = data.features?.[0]?.place_name || 'Current Location';
          // Override origin with current location
        this.originQuery = placeName;
        this.originPlaceName = placeName;

          if (this.mapReady && this.map) {
            this.map.flyTo({ center: [longitude, latitude], zoom: 14 });
          }
        } catch (err) {
          console.error('Reverse geocoding failed:', err);
          this.originQuery = 'Current Location';
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        this.error = 'Unable to retrieve your location.';
      }
    );
  }

  bookRide() {
    if (!this.originCoords || !this.destinationCoords) {
      this.error = 'Please select both origin and destination.';
      return;
    }
    const originNameToUse = this.usedCurrentLocation
    ? this.originPlaceName
    : this.originQuery;

    this.router.navigate(['/userhomenav/cnf-booking'], {
      queryParams: {
        origin: this.originCoords.join(','),
        destination: this.destinationCoords.join(','),
        originName: this.originPlaceName,
        destinationName: this.destinationPlaceName
      }
    });
  }

  trackById(_index: number, item: any) {
    return item.id || item.place_name;
  }
}
