import { Component } from '@angular/core';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
// import { AvatarModule } from 'primeng/avatar';
// import { AvatarGroupModule } from 'primeng/avatar-group';

@Component({
  selector: 'app-userhome-nav',
  imports: [RouterOutlet,RouterLink],
  templateUrl: './userhome-nav.html',
  styleUrl: './userhome-nav.css'
})
export class UserhomeNav {

  constructor(private router: Router){
  }

  logout() {

  console.log('Logging out...');
  this.router.navigate(['/main/']);
}

}
