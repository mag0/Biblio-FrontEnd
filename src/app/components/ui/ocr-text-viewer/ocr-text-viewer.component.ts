import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OcrPage, OcrResponse } from '../../../interfaces/ocr.interface';

@Component({
  selector: 'app-ocr-text-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ocr-text-viewer.component.html',
  styleUrl: './ocr-text-viewer.component.css'
})
export class OcrTextViewerComponent {
  @Input() ocrData: OcrResponse | null = null;
  @Input() isEditing: boolean = false;
  @Input() editingText: string = '';
  @Output() editClicked = new EventEmitter<void>();
  @Output() saveChanges = new EventEmitter<void>();
  @Output() cancelEditing = new EventEmitter<void>();
  @Output() textChanged = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<number>();
  @Input() currentPage: number = 1;
  pagesPerView: number = 5;
  totalPages: number = 0;

  ngOnInit() {
    if (this.ocrData) {
      this.totalPages = this.ocrData.metadata.totalPages;
    }
  }

  getCurrentPage(): OcrPage | undefined {
    if (!this.ocrData) return undefined;
    return this.ocrData.pages.find(page => page.number === this.currentPage);
  }

  onStartEditing(): void {
    const currentPage = this.getCurrentPage();
    if (currentPage) {
      this.editingText = currentPage.text;
      this.editClicked.emit();
    }
  }

  onSaveChanges(): void {
    if (!this.ocrData || !this.isEditing) return;
    
    const pageIndex = this.ocrData.pages.findIndex(page => page.number === this.currentPage);
    if (pageIndex !== -1) {
      // Actualizar el texto
      this.ocrData.pages[pageIndex].text = this.editingText;
      
      // Recalcular caracteres y palabras
      this.ocrData.pages[pageIndex].characters = this.editingText.length;
      this.ocrData.pages[pageIndex].words = this.countWords(this.editingText);
      
      // Recalcular estadísticas globales
      this.recalculateStats();
      
      this.saveChanges.emit();
    }
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  private recalculateStats(): void {
    if (!this.ocrData) return;
    
    let totalCharacters = 0;
    let totalWords = 0;
    
    this.ocrData.pages.forEach(page => {
      totalCharacters += page.characters;
      totalWords += page.words;
    });
    
    this.ocrData.metadata.statistics.totalCharacters = totalCharacters;
    this.ocrData.metadata.statistics.totalWords = totalWords;
    this.ocrData.metadata.statistics.averageCharactersPerPage = 
      totalCharacters / this.ocrData.metadata.totalPages;
    this.ocrData.metadata.statistics.averageWordsPerPage = 
      totalWords / this.ocrData.metadata.totalPages;
  }

  goToPage(pageNumber: number): void {
    this.pageChange.emit(pageNumber);
  }
  
}