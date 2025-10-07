import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
 
@Component({
  selector: 'app-driver-details',
  imports: [FormsModule],
  templateUrl: './driver-details.html',
  styleUrl: './driver-details.css'
})
export class DriverDetails{
     constructor(private router: Router) {}
  driver = {
    name: 'Rajesh Kumar',
    mobile: '9876543210',
    vehicleId: 'MH12AB1234',
    licenseId: 'LIC123456789',
    licensePic: 'assets/license.jpg',
    aadhaarId: 'AAD123456789',
    aadhaarPic: 'assets/aadhaar.jpg',
    isAvailable: false
  };
 
  rideRequests = [
    { pickup: 'Baner', drop: 'Kothrud' ,fare: 220},
    { pickup: 'Hinjewadi', drop: 'Shivajinagar', fare: 300 }
  ];
 
  rideHistory = [
    { date: 'Sep 1', pickup: 'Wakad', drop: 'FC Road', fare: 220 },
    { date: 'Aug 31', pickup: 'Aundh', drop: 'Viman Nagar', fare: 340 }
  ];
 
 
  toggleAvailability() {
    this.driver.isAvailable=true;
  }
 
  acceptRide(ride: any) {
    alert('Ride Accepted');
  }
 
  rejectRide(ride: any) {
 alert('Ride Rejected');
  }
 
 
logout(){
   localStorage.clear();
    this.router.navigate(['driverlogin']);
    //alert('Logged out successfully');
}
 
 
 
}