import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users-view',
  templateUrl: './users-view.component.html',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './users-view.component.css'
})
export class UsersViewComponent {
  users: any[] = [];
  expandedUserId: number | null = null; // 🔹 Controla qué usuario está expandido

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAll().subscribe({
      next: (data: any[]) => {
        this.users = data;
      }
    }) 
  }

  toggleUser(userId: number): void {
    this.expandedUserId = this.expandedUserId === userId ? null : userId;
  }
}