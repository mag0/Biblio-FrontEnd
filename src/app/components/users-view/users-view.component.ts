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
  expandedUserId: string | null = null;

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

  toggleUser(userId: string): void {
    this.expandedUserId = this.expandedUserId === userId ? null : userId;
  }
}