import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-user',
  imports: [CommonModule],
  templateUrl: './card-user.component.html',
  styleUrl: './card-user.component.css'
})
export class CardUserComponent {
  expandedUserId: string | null = null;
  @Input() user: any;

  toggleUser(userId: string): void {
    this.expandedUserId = this.expandedUserId === userId ? null : userId;
  }
}
