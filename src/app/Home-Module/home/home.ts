import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
   constructor(private router:Router){

  }
  onuserbtn(){ 
    this.router.navigate(['/main/userlogin']);
  }

}
