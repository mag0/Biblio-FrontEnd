import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OrderManagmentService } from '../../services/orderManagment.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface OcrPage {
  number: number;
  text: string;
  confidence: number;
  characters: number;
  words: number;
}

interface OcrResponse {
  status: string;
  message: string;
  metadata: {
    fileName: string;
    fileSize: string;
    totalPages: number;
    processingTime: string;
    statistics: {
      totalCharacters: number;
      totalWords: number;
      averageCharactersPerPage: number;
      averageWordsPerPage: number;
      averageConfidence?: number;
    }
  };
  pages: OcrPage[];
}

@Component({
  selector: 'app-ocr-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './ocr-viewer.component.html',
  styleUrl: './ocr-viewer.component.css'
})
export class OcrViewerComponent implements OnInit {
  @Input() ocrData: OcrResponse | null = null;
  currentPage: number = 1;
  isEditing: boolean = false;
  editingText: string = '';
  user: any;
  errorMessage: string = '';
  
  constructor(private router: Router, 
    private orderManagmentService:OrderManagmentService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    // Si no hay datos OCR y se accede directamente a la ruta, podríamos
    // recuperar los datos de un servicio o localStorage
    if (!this.ocrData) {
      const storedData = localStorage.getItem('ocrData');
      if (storedData) {
        this.ocrData = JSON.parse(storedData);
      } else {
        // Si no hay datos, redirigir a la página de carga
        this.router.navigate(['/upload']);
      }
    }

    this.authService.getCurrentUser().subscribe({
      next: (userData) => {
        this.user = userData;
        console.log(this.user);
      },
      error: (error) => {
        console.error('Error al cargar el perfil:', error);
        this.errorMessage = 'No se pudo cargar la información del perfil.';
      },
    })
  }

  finalizarOcr(): void {
    this.orderManagmentService.changeStatusToReview(Number(this.route.snapshot.paramMap.get('id')),1);
    this.router.navigate(['/tasks']);
  }
  
  /**
   * Cambia a la página especificada
   * @param pageNumber Número de página a mostrar
   */
  goToPage(pageNumber: number): void {
    if (this.ocrData && pageNumber >= 1 && pageNumber <= this.ocrData.metadata.totalPages) {
      this.currentPage = pageNumber;
      this.isEditing = false;
    }
  }
  
  /**
   * Obtiene la página actual
   */
  getCurrentPage(): OcrPage | null {
    if (!this.ocrData || !this.ocrData.pages) return null;
    return this.ocrData.pages.find(page => page.number === this.currentPage) || null;
  }
  
  /**
   * Inicia la edición del texto de la página actual
   */
  startEditing(): void {
    const currentPage = this.getCurrentPage();
    if (currentPage) {
      this.editingText = currentPage.text;
      this.isEditing = true;
    }
  }
  
  /**
   * Guarda los cambios realizados en el texto
   */
  saveChanges(): void {
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
      
      // Guardar en localStorage para persistencia
      localStorage.setItem('ocrData', JSON.stringify(this.ocrData));
      
      this.isEditing = false;
    }
  }
  
  /**
   * Cancela la edición sin guardar cambios
   */
  cancelEditing(): void {
    this.isEditing = false;
  }
  
  /**
   * Cuenta las palabras en un texto
   * @param text Texto a analizar
   * @returns Número de palabras
   */
  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }
  
  /**
   * Recalcula las estadísticas globales del documento
   */
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
}