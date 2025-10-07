import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-drivermain-nav',
  imports: [RouterOutlet],
  templateUrl: './drivermain-nav.html',
  styleUrl: './drivermain-nav.css'
})
export class DrivermainNav {

  constructor(private router: Router){
  }

  logout() {
alert("Are you sure want to Logout")
  console.log('Logging out...');
  this.router.navigate(['/main/']);
}
}
