import { Component, signal } from '@angular/core';
import { RouterOutlet,RouterLink,RouterLinkActive, RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { Home } from './Home-Module/home/home';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  
}
