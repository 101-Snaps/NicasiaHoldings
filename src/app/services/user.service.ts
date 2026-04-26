import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private api = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  // SIGNUP
  register(data: any): Observable<any> {
    return this.http.post(`${this.api}/auth/register`, data);
  }

  // LOGIN
  login(data: any): Observable<any> {
    return this.http.post(`${this.api}/auth/login`, data);
  }
}
