import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

interface OcrPage {
  numero: number;
  texto: string;
  confianza: number;
  caracteres: number;
  palabras: number;
}

interface OcrResponse {
  estado: string;
  mensaje: string;
  metadatos: {
    nombreArchivo: string;
    tamaño: string;
    totalPáginas: number;
    tiempoProcesamiento: string;
    estadísticas: {
      totalCaracteres: number;
      totalPalabras: number;
      promedioCaracteresPorPágina: number;
      promedioPalabrasPorPágina: number;
    }
  };
  páginas: OcrPage[];
}

@Component({
  selector: 'app-ocr-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ocr-viewer.component.html',
  styleUrl: './ocr-viewer.component.css'
})
export class OcrViewerComponent implements OnInit {
  @Input() ocrData: OcrResponse | null = null;
  currentPage: number = 1;
  isEditing: boolean = false;
  editingText: string = '';
  
  constructor(private route: ActivatedRoute, private router: Router) {}
  
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
  }
  
  /**
   * Cambia a la página especificada
   * @param pageNumber Número de página a mostrar
   */
  goToPage(pageNumber: number): void {
    if (this.ocrData && pageNumber >= 1 && pageNumber <= this.ocrData.metadatos.totalPáginas) {
      this.currentPage = pageNumber;
      this.isEditing = false;
    }
  }
  
  /**
   * Obtiene la página actual
   */
  getCurrentPage(): OcrPage | null {
    if (!this.ocrData || !this.ocrData.páginas) return null;
    return this.ocrData.páginas.find(page => page.numero === this.currentPage) || null;
  }
  
  /**
   * Inicia la edición del texto de la página actual
   */
  startEditing(): void {
    const currentPage = this.getCurrentPage();
    if (currentPage) {
      this.editingText = currentPage.texto;
      this.isEditing = true;
    }
  }
  
  /**
   * Guarda los cambios realizados en el texto
   */
  saveChanges(): void {
    if (!this.ocrData || !this.isEditing) return;
    
    const pageIndex = this.ocrData.páginas.findIndex(page => page.numero === this.currentPage);
    if (pageIndex !== -1) {
      // Actualizar el texto
      this.ocrData.páginas[pageIndex].texto = this.editingText;
      
      // Recalcular caracteres y palabras
      this.ocrData.páginas[pageIndex].caracteres = this.editingText.length;
      this.ocrData.páginas[pageIndex].palabras = this.countWords(this.editingText);
      
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
    
    let totalCaracteres = 0;
    let totalPalabras = 0;
    
    this.ocrData.páginas.forEach(page => {
      totalCaracteres += page.caracteres;
      totalPalabras += page.palabras;
    });
    
    this.ocrData.metadatos.estadísticas.totalCaracteres = totalCaracteres;
    this.ocrData.metadatos.estadísticas.totalPalabras = totalPalabras;
    this.ocrData.metadatos.estadísticas.promedioCaracteresPorPágina = 
      totalCaracteres / this.ocrData.metadatos.totalPáginas;
    this.ocrData.metadatos.estadísticas.promedioPalabrasPorPágina = 
      totalPalabras / this.ocrData.metadatos.totalPáginas;
  }
}