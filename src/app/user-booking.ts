// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';

// export interface BookingData {
//   origin: string;
//   destination: string;
//   amount: number;
//   distance: string;
//   userId: number;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class UserBooking {
//   private apiUrl = 'http://localhost:8088/user/createride';

//   constructor(private http: HttpClient) {}

//   bookRide(data: BookingData): Observable<any> {
//     console.log('Sending booking data to backend:', data);
//     return this.http.post<any>(this.apiUrl, data);
//   }

  
// }






import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  private apiUrl = 'http://localhost:8080/user-api/user/createride';

  constructor(private http: HttpClient) {}

  
  getToken(): string | null {
  return localStorage.getItem('jwtToken');
  }

  bookRide(data: BookingData): Observable<any> {
    const token = this.getToken();
    console.log("service called");
    console.log('Token being sent:', token);
    console.log('Sending booking data to backend:', data);

  //if jwt is not there he cannot able to create the ride 
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<any>(this.apiUrl, data, { headers });
  }
}
