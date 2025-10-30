import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../user-service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.css']
})
export class UserProfile implements OnInit {
  userProfile = {
    userId:0,
    userName: '',
    userEmail: '',
    userPhoneNumber: ''
  };
  newUserProfile = {
    userId:0,
    userName: '',
    userEmail: '',
    userPhoneNumber: ''
  };

  isEditing = false;

  private platformId = inject(PLATFORM_ID);
  
  constructor(
    private userService: UserService,
    private location: Location,
    private router: Router
  ) {
      
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = localStorage.getItem('userProfileDetails');
      if (storedUser) {
        this.userProfile = JSON.parse(storedUser);
      }
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

updateProfile(newName: string, newEmail: string, newPhone: string) {
  this.newUserProfile.userId=this.userProfile.userId;
  this.newUserProfile.userName = newName;
  this.newUserProfile.userEmail = newEmail;
  this.newUserProfile.userPhoneNumber = newPhone;
  this.isEditing = false;

  // Save to local storage
  //localStorage.setItem('userProfileDetails', JSON.stringify(this.userProfile));

  // Call the service and handle the response
  this.userService.updateUserProfile(this.newUserProfile).subscribe({
  next: (response) => {
    if (response.body && response.body.message) {
      alert(response.body.message); // Show success message
      // Save to local storage
      localStorage.setItem('userProfileDetails', JSON.stringify(this.newUserProfile));
    } else {
      alert('Profile updated, but no message returned.');
    }
  },
  error: (error) => {
    console.error('Error updating profile:', error);

    // Check if error is a field-specific map
    if (error.error && typeof error.error === 'object') {
      const errorMessages = Object.values(error.error).join('\n');
      alert(errorMessages); // Show all error messages
    } else {
      alert('Failed to update profile. Please try again later.');
    }
  }
});
}
}