import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
 
@Injectable({
  providedIn: 'root'
})
export class RideHistoryService {
  private baseUrl = 'http://localhost:8089/ride/user'; // Update if needed
 
  constructor(private http: HttpClient) {}
 
 getRideHistory(userId: number): Observable<any[]> {
  const token = localStorage.getItem('jwtToken'); // Adjust key name if different

  const headers = {
    Authorization: `Bearer ${token}`
  };

  return this.http.get<any[]>(`${this.baseUrl}/${userId}/confirmed`, { headers });
}
}