import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-action-button',
  imports: [CommonModule],
  templateUrl: './action-button.component.html',
  styleUrl: './action-button.component.css'
})

export class ActionButtonComponent {
  @Input() label: string = '';
  @Input() type: string = '';
  @Input() styleEdit: string = '';
  @Input() onActionClick: () => any = () => '';
}
