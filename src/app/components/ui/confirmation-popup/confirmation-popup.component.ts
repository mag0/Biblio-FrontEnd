import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importado correctamente

@Component({
  selector: 'app-confirmation-popup',
  standalone: true,
  imports: [CommonModule], // Incluido correctamente aquí
  templateUrl: './confirmation-popup.component.html',
  styleUrls: ['./confirmation-popup.component.css']
})
export class ConfirmationPopupComponent {
  @Input() title: string = 'Confirmar Acción';
  @Input() question: string = '¿Estás seguro de que deseas realizar esta acción?';
  @Input() isVisible: boolean = false;
  @Input() primaryActionText: string = 'Confirmar'; // Renombrado desde confirmButtonText
  @Input() secondaryActionText: string = 'Cancelar'; // Renombrado desde cancelButtonText

  @Output() primaryAction = new EventEmitter<void>(); // Renombrado desde confirm
  @Output() secondaryAction = new EventEmitter<void>(); // Renombrado desde cancel

  constructor() { }

  onPrimaryAction(): void { // Renombrado desde onConfirm
    this.primaryAction.emit();
    this.closePopup();
  }

  onSecondaryAction(): void { // Renombrado desde onCancel
    this.secondaryAction.emit();
    this.closePopup();
  }

  closePopup(): void {
    this.isVisible = false;
    // Emitir la acción secundaria al cerrar el popup
    this.secondaryAction.emit();
  }

  // Close popup if clicking outside the modal content
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (this.isVisible && !target.closest('.popup-content')) {
      this.closePopup();
    }
  }
}