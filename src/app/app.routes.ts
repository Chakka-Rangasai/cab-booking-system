import { Routes } from '@angular/router';
import { UserRegister } from './User-Module/user-register/user-register';
import { DriverRegister } from './Driver-Module/driver-register/driver-register';
import { UserLogin } from './User-Module/user-login/user-login';
import { DriverLoginComponent } from './Driver-Module/driverlogin/driverlogin';
import { Userhome } from './RideBooking-Module/userhome/userhome';
import { UserResetPassword } from './User-Module/user-reset-password/user-reset-password';
import { UserEnterOtp } from './User-Module/user-enter-otp/user-enter-otp';
import { UserSetNewPassword } from './User-Module/user-set-new-password/user-set-new-password';
import { DriverResetPassword } from './Driver-Module/driver-reset-password/driver-reset-password';
import { DriverEnterOtp } from './Driver-Module/driver-enter-otp/driver-enter-otp';
import { DriverSetNewPassword } from './Driver-Module/driver-set-new-password/driver-set-new-password';
import { DriverDetails } from './Driver-Module/driver-details/driver-details';
import { UserhomeNav } from './User-Module/userhome-nav/userhome-nav';
import { Cnfbooking } from './RideBooking-Module/cnfbooking/cnfbooking';
import { BookingConfirmationCard } from './RideBooking-Module/booking-confirmation-card/booking-confirmation-card';
import { TermsConditions } from './Home-Module/terms-conditions/terms-conditions';
import { Contactus } from './Home-Module/contactus/contactus';
import path from 'node:path'; 
import { Component } from '@angular/core';
import { Main } from './Home-Module/main/main';
import { Home } from './Home-Module/home/home';
import { DrivermainNav } from './Driver-Module/drivermain-nav/drivermain-nav';
import { TripdetailsComponent } from './RideBooking-Module/tripdetails/tripdetails';
import { UserProfile } from './User-Module/user-profile/user-profile';
import { AuthGuard } from './auth-guard';
import { BookingWaiting } from './RideBooking-Module/booking-waiting/booking-waiting';
import { Payment } from './Payment-Module/payment/payment';
import { PaymentSuccessComponent } from './Payment-Module/payment-success/payment-success';
// import { UserProfile } from './user-profile/user-profile';
export const routes: Routes = [
    {
        path:'main',
        component:Main,
        children: [
             { 
        path: '', component: Home // default component 
    },
        {
        path:'userregister',component: UserRegister,
       
    },
    {
        path:'driverregister',component: DriverRegister
    },
    {
         path:'userlogin',component:UserLogin
    },
    {
        path:"userresetpassword",component: UserResetPassword
    },
    {
        path:'driverlogin',component:DriverLoginComponent
    },
    {
        path:'driverresetpassword',component:DriverResetPassword
    },
    {
        path:'userenterotp', component:UserEnterOtp
    },
    {
        path:'usersetnewpassword', component:UserSetNewPassword
    },
    {
        path:'driverenterotp', component:DriverEnterOtp
    },
    {
        path:'driversetnewpassword', component:DriverSetNewPassword
    },
    {
        path:'termsconditions',component:TermsConditions
    },
    {
        path:'contactus',component:Contactus
    }]

},
{
    path: 'drivernav',
    component: DrivermainNav,
    canActivate: [AuthGuard],
    children: [
        {
        path:"",component: DriverDetails     //default child route
    }
    ]
  },

     {
    path: 'userhomenav',
    component: UserhomeNav,
    canActivate:[AuthGuard],
    children: [
      { path: '', component: Userhome }, // default child route
      { path: 'cnf-booking', component: Cnfbooking },
      {path:'tripdetails',component:TripdetailsComponent},
      {path:'userprofile',component:UserProfile},
       { path:'payment',component:Payment},
      {path:'paymentsuccess',component:PaymentSuccessComponent},
      {path:'booking-waiting',component:BookingWaiting},
      { path:'booking-confirmation',component:BookingConfirmationCard}
    ]
  },
    { path: '', redirectTo: 'main', pathMatch: 'full' }
    

]
