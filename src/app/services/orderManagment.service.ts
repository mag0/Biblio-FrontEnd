import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderManagmentService {
  private apiUrl = 'https://localhost:44342/api/OrderManagment';

  constructor(private http: HttpClient) {}

  getOrdersByState(status: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/status?status=${status}`);
  }

  getAssignedOrders(UserId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/assigned?UserId=${UserId}`);
  }

  changeStatus(orderId: number, newStatus: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/changeStatus?orderId=${orderId}&newStatus=${newStatus}`, {});
  }

}