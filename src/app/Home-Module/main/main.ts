import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { UserService } from '../../user-service';

@Component({
  selector: 'app-main',
  imports: [RouterLink,RouterOutlet],
  templateUrl: './main.html',
  styleUrl: './main.css'
})
export class Main {
  constructor(private router: Router, private userService: UserService) {

  }
  navigateToUserLogin() {
    // Example: check if user is logged in, replace 'isLoggedIn' with actual property/method
    if (this.userService.getToken()) {
      this.router.navigate(['/userhomenav']);
    }
    else{
      this.router.navigate(['/main/userlogin']);
    }
  }
}
