import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
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

  isEditing = false;

  private platformId = inject(PLATFORM_ID);
  constructor(private userService:UserService){
      
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
  this.userProfile.userName = newName;
  this.userProfile.userEmail = newEmail;
  this.userProfile.userPhoneNumber = newPhone;
  this.isEditing = false;

  // Save to local storage
  localStorage.setItem('userProfileDetails', JSON.stringify(this.userProfile));

  // Call the service and handle the response
  this.userService.updateUserProfile(this.userProfile).subscribe({
    next: (response) => {
      if (response.body && response.body.message) {
        alert(response.body.message); // Show success message
      } else {
        alert('Profile updated, but no message returned.');
      }
    },
    error: (error) => {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again later.');
    }
  });
}
}