import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvService } from './env.service';

@Injectable({
  providedIn: 'root'
})
export class OrderManagmentService {
  private apiUrl:string;

  constructor(private http: HttpClient, private envService: EnvService) {
    this.apiUrl = this.envService.getApiUrl()+"/OrderManagment";
  }

  getOrdersByState(status: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/status?status=${status}`);
  }

  getAssignedOrders(UserId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/assigned?UserId=${UserId}`);
  }

  changeStatus(formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/changeStatus`, {id: formData.get('id'), status: formData.get('status')});
  }

}