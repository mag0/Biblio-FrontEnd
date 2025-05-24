import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { CardUserComponent } from '../ui/card-user/card-user.component';

@Component({
  selector: 'app-users-view',
  templateUrl: './users-view.component.html',
  standalone: true,
  imports: [CommonModule, CardUserComponent],
  styleUrl: './users-view.component.css'
})
export class UsersViewComponent {
  users: any[] = [];

  constructor(private userService: UserService
  ) {}

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
}