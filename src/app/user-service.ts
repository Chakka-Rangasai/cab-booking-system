 
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
 
@Injectable({
  providedIn: 'root'
})
export class UserService {
 
  responseMessage: string = '';
  userUpdatePassword:any={
     userId:null,
     userPassword:null
  }
 
 
  constructor(private httpClient :HttpClient){}
 
  getUserDetailsObj(userObj1: any) {
  this.httpClient.post("http://localhost:8080/postuserregisterdetails", userObj1, { responseType: 'text' })
    .subscribe((res: string) => {
      this.responseMessage = res; // Store the response for later use
    });
}
 
 
loginValidation(userLoginObj: any): Observable<HttpResponse<{ message: string }>> {
  return this.httpClient.post<{ message: string }>(
    "http://localhost:8080/validatelogindetails",
    userLoginObj,
    {
      observe: 'response'
    }
  );
 
}
 forgetPasswordCredentials(userForgotPasswordObj: any): Observable<HttpResponse<{ message: string, user_id?: string }>> {
    return this.httpClient.post<{ message: string, user_id?: string }>(
      'http://localhost:8080/validateuserforgotpassworddetails',
      userForgotPasswordObj,
      {
        observe: 'response'
      }
    ).pipe(
      tap(response => {
        const body = response.body;
        if (body?.user_id) {
          this.userUpdatePassword.userId = body.user_id; // Store user_id in the service
          console.log(this.userUpdatePassword.userId);
        }
      })
    );
  }
  updateUserPassword(newPassword: string): Observable<HttpResponse<{ message: string }>> {
  this.userUpdatePassword.userPassword = newPassword;
 
  return this.httpClient.put<{ message: string }>(
    'http://localhost:8080/changepassword',
    this.userUpdatePassword,
    {
      observe: 'response'
    }
  );
}
}
 
 