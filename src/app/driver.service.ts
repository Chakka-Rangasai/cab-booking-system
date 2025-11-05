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

  constructor(private httpClient: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {}

  // Get JWT token from localStorage
  private getAuthToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      // Try to get the driver token first, then fallback to authToken
      const driverToken = localStorage.getItem('driverToken');
      const authToken = localStorage.getItem('authToken');
      return driverToken || authToken;
    }
    return null;
  }

  // Create headers with JWT token for authenticated requests
  private getAuthHeaders(): HttpHeaders {
    const token = this.getAuthToken();
    let headers = new HttpHeaders();
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  // Log API request details
  private logApiRequest(method: string, url: string, data?: any) {
    console.log(`🚀 ${method} ${url}`, data ? '(with data)' : '(no data)');
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
    return this.httpClient.post<DriverInfo>(url, payload, { headers, observe: 'response' });
  }

  // Toggle driver availability
  toggleAvailability(driverId: number, isAvailable: boolean): Observable<HttpResponse<string>> {
    const url = `${this.baseUrl}/${driverId}/${isAvailable}`;
    const headers = this.getAuthHeaders();
    
    this.logApiRequest('PATCH', url);
    
    return this.httpClient.patch(url, {}, {
      headers: headers,
      observe: 'response',
      responseType: 'text'
    });
  }

  // Driver login with JWT
  loginDriver(email: string, password: string): Observable<HttpResponse<{token: string, driver: DriverInfo}>> {
    const url = `${this.baseUrl}/auth/login`;
    const loginData = { email, password };
    
    this.logApiRequest('POST', url, { email: email, password: '***masked***' });
    
    return this.httpClient.post<{token: string, driver: DriverInfo}>(url, loginData, {
      observe: 'response'
    });
  }

  // Get driver average rating (public by default, pass true to use auth)
  getDriverAverage(driverId: number, useAuth: boolean = false) {
    const url = `http://localhost:8077/reviews/driver/${driverId}/average`;
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
      return this.httpClient.get<number>('about:blank'); 
    }
    return this.getDriverAverage(stored.driverId);
  }

  getPendingRides() {
    return this.httpClient.get<any[]>("http://localhost:8087/driver/pending");
  }

  acceptRideRequest(rideId: number, userId: number) {
    const url = `http://localhost:8087/driver/acceptride/${rideId}/${userId}`;
    return this.httpClient.get(url); // No body needed for this PATCH
  }

  getConfirmedRidesByDriver(driverId: number): Observable<any[]> {
  const url = `${this.baseUrl}/${driverId}/confirmed`;
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${this.getAuthToken() || ''}`
  });
  return this.httpClient.get<any[]>(url, { headers });
}

  // Forgot password - verify email and phone number
  verifyForgotPasswordCredentials(email: string, phoneNumber: string): Observable<HttpResponse<{message: string, driver_id: string}>> {
    const url = `${this.baseUrl}/forgotpassword`;
    const forgotPasswordData = { email, phoneNumber };
    
    this.logApiRequest('POST', url, forgotPasswordData);
    
    return this.httpClient.post<{message: string, driver_id: string}>(url, forgotPasswordData, { 
      observe: 'response' 
    });
  }

  // Change password after OTP verification
  changePassword(driverData: { driverId: string , passwordHash: string }): Observable<HttpResponse<{message: string}>> {
    const url = `${this.baseUrl}/changepassword`;
    
    this.logApiRequest('PUT', url, driverData);
    
    return this.httpClient.put<{message: string}>(url, driverData, { 
      observe: 'response' 
    });
  }

}


