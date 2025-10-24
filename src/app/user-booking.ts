import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BookingData {
  origin: string;
  destination: string;
  amount: number;
  distance: string;
  userId: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserBooking {
  private apiUrl = 'http://localhost:8088/user/createride';

  constructor(private http: HttpClient) {}

 bookRide(data: BookingData): Observable<any> {
  const token = localStorage.getItem('jwtToken'); // Or wherever you're storing the JWT
  const headers = {
    'Authorization': `Bearer ${token}`
  };

  console.log('Sending booking data to backend:', data);
  return this.http.post<any>(this.apiUrl, data, { headers });
}



  
}
