import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';

export interface DriverInfo {
  driverId?: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  passwordHash: string;
  licenseNumber: string;
  vehicleModel: string;
  vehicleRegNo: string;
  vehicleColor: string;
  capacity: number;
  isAvailable?: boolean;
  isVerified?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private baseUrl = 'http://localhost:8087/driver';

  constructor(private httpClient: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {
    console.log('DriverService initialized with baseUrl:', this.baseUrl);
  }

  // Get JWT token from localStorage with logging
  private getAuthToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      // Try to get the driver token first, then fallback to authToken
      const driverToken = localStorage.getItem('driverToken');
      const authToken = localStorage.getItem('authToken');
      const token = driverToken || authToken;
      
      console.log(' JWT Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'null');
      return token;
    }
    console.log('Running on server side - no localStorage access');
    return null;
  }

  // Create headers with JWT token for authenticated requests
  private getAuthHeaders(): HttpHeaders {
    const token = this.getAuthToken();
    let headers = new HttpHeaders();
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
      console.log(' Authorization header added:', `Bearer ${token.substring(0, 20)}...`);
    } else {
      console.log(' No token available - proceeding without Authorization header');
    }
    
    return headers;
  }

  // Log API request details
  private logApiRequest(method: string, url: string, data?: any) {
    console.log(` API ${method} Request:`, {
      url: url,
      timestamp: new Date().toISOString(),
      data: data ? 'Data provided' : 'No data',
      hasAuth: this.getAuthToken() ? 'Yes' : 'No'
    });
  }

  // Log API response details
  private logApiResponse(method: string, url: string, response: any, error?: any) {
    if (error) {
      console.error(` API ${method} Error Response:`, {
        url: url,
        timestamp: new Date().toISOString(),
        status: error.status,
        statusText: error.statusText,
        error: error.error,
        message: error.message
      });
    } else {
      console.log(` API ${method} Success Response:`, {
        url: url,
        timestamp: new Date().toISOString(),
        status: response.status,
        statusText: response.statusText,
        hasBody: response.body ? 'Yes' : 'No'
      });
    }
  }

  // Build payload matching backend Driver entity (capitalized field names)
  private buildDriverPayload(driver: DriverInfo): any {
    return {
      driverId: driver.driverId,
      fullName: driver.fullName,
      email: driver.email,
      phoneNumber: driver.phoneNumber,
      passwordHash: driver.passwordHash,
      licenseNumber: driver.licenseNumber,
      vehicleModel: driver.vehicleModel,
      vehicleRegNo: driver.vehicleRegNo,
      vehicleColor: driver.vehicleColor,
      capacity: driver.capacity,
      isAvailable: driver.isAvailable,
      isVerified: driver.isVerified
    };
  }

  // Normalize driver response from backend to handle field name variations
  private normalizeDriverResponse(d: any): DriverInfo {
    return {
      driverId: d.driverId,
      fullName: d.fullName,
      email: d.email,
      phoneNumber: d.phoneNumber,
      passwordHash: d.passwordHash || '',
      licenseNumber: d.licenseNumber,
      vehicleModel: d.vehicleModel,
      vehicleRegNo: d.vehicleRegNo,
      vehicleColor: d.vehicleColor,
      capacity: d.capacity,
      isAvailable: d.isAvailable !== undefined ? d.isAvailable : true,
      isVerified: d.isVerified !== undefined ? d.isVerified : true
    };
  }

  // Register new driver
  registerDriver(driverData: DriverInfo): Observable<HttpResponse<DriverInfo>> {
    const url = `${this.baseUrl}/register`;
    // Build backend-compliant payload
    const payload = this.buildDriverPayload(driverData);
    this.logApiRequest('POST', url, payload);
    return this.httpClient.post<DriverInfo>(url, payload, { observe: 'response' });
  }

  // Get driver profile details
  getDriverProfile(driverId: number): Observable<HttpResponse<DriverInfo>> {
    const url = `${this.baseUrl}/getProfileDetails/${driverId}`;
    this.logApiRequest('GET', url);
    
    return this.httpClient.get<DriverInfo>(url, {
      headers: this.getAuthHeaders(),
      observe: 'response'
    });
  }

  // Update driver profile
  updateDriverProfile(driverData: DriverInfo): Observable<HttpResponse<DriverInfo>> {
    const url = `${this.baseUrl}/update`;
    const headers = this.getAuthHeaders();
    const payload = this.buildDriverPayload(driverData);
    this.logApiRequest('POST', url, payload);
    console.log('🔧 POST Update Profile Request Details:', {
      url,
      method: 'POST',
      headers: {
        Authorization: headers.get('Authorization') ? 'Bearer ***token***' : 'None',
        'Content-Type': headers.get('Content-Type') || 'Default'
      },
      hasDriverData: !!driverData,
      driverId: driverData.driverId
    });
    return this.httpClient.post<DriverInfo>(url, payload, { headers, observe: 'response' });
  }

  // Toggle driver availability
  toggleAvailability(driverId: number, isAvailable: boolean): Observable<HttpResponse<string>> {
    const url = `${this.baseUrl}/${driverId}/${isAvailable}`;
    const headers = this.getAuthHeaders();
    
    this.logApiRequest('PATCH', url);
    console.log(' PATCH Request Details:', {
      url: url,
      method: 'PATCH',
      headers: {
        'Authorization': headers.get('Authorization') ? 'Bearer ***token***' : 'None',
        'Content-Type': headers.get('Content-Type') || 'Default'
      },
      body: 'Empty object {}',
      responseType: 'text'
    });
    
    return this.httpClient.patch(url, {}, {
      headers: headers,
      observe: 'response',
      responseType: 'text'
    });
  }

  // Driver login with JWT
  loginDriver(email: string, password: string): Observable<HttpResponse<{token: string, driver: DriverInfo}>> {
    const url = `${this.baseUrl}/auth/hello/login`;
    const loginData = { email, password };
    
    console.log(' Login Request:', {
      url: url,
      email: email,
      timestamp: new Date().toISOString(),
      hasPassword: !!password
    });
    
    this.logApiRequest('POST', url, { email: email, password: '***masked***' });
    
    return this.httpClient.post<{token: string, driver: DriverInfo}>(url, loginData, {
      observe: 'response'
    });
  }

  // Get driver average rating (public by default, pass true to use auth)
  getDriverAverage(driverId: number, useAuth: boolean = false) {
    const url = `${this.baseUrl}/reviews/driver/${driverId}/average`;
    this.logApiRequest('GET', url);
    if (useAuth) {
      return this.httpClient.get<number>(url, { headers: this.getAuthHeaders() });
    }
    return this.httpClient.get<number>(url);
  }

  private getStoredDriver(): DriverInfo | null {
    if (isPlatformBrowser(this.platformId)) {
      const raw = localStorage.getItem('driverInfo');
      if (raw) {
        try { return JSON.parse(raw); } catch { return null; }
      }
    }
    return null;
  }

  getCurrentDriverAverage() {
    const stored = this.getStoredDriver();
    if (!stored?.driverId) {
      console.warn('getCurrentDriverAverage: No driverId in stored driver');
      return this.httpClient.get<number>('about:blank'); // will error quickly if misused
    }
    return this.getDriverAverage(stored.driverId);
  }

  getPendingRides() {
     const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${this.getAuthToken() || ''}`
  });
    return this.httpClient.get<any[]>("http://localhost:8087/driver/pending",{ headers });
  }

  acceptRideRequest(rideId: number, userId: number) {
    const url = `http://localhost:8087/driver/acceptride/${rideId}/${userId}`;
     const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${this.getAuthToken() || ''}`
  });
    return this.httpClient.get(url,{ headers }); // No body needed for this PATCH
  }

  getConfirmedRidesByDriver(driverId: number): Observable<any[]> {
  const url = `${this.baseUrl}/${driverId}/confirmed`;
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${this.getAuthToken() || ''}`
  });
  return this.httpClient.get<any[]>(url, { headers });
}



}


