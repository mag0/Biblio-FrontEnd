import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnvService {
  // Variables de entorno cargadas desde el archivo environment
  private env: { [key: string]: any } = environment;

  constructor() {
    // No es necesario inicializar nada, ya que environment se importa directamente
    if (!this.env['apiUrl']) {
      console.warn('Variable de entorno apiUrl no encontrada en el archivo environment.');
    }
  }


  /**
   * Obtiene el valor de una variable de entorno
   * @param key Nombre de la variable
   * @param defaultValue Valor por defecto si la variable no existe
   * @returns El valor de la variable o el valor por defecto
   */
  get(key: string, defaultValue: any = ''): any {
    return this.env[key] || defaultValue;
  }

  /**
   * Verifica si estamos en modo producción
   * @returns true si estamos en producción, false en caso contrario
   */
  isProduction(): boolean {
    // Devuelve directamente el valor de production del environment
    return this.env['production'] === true;
  }

  /**
   * Obtiene la URL base de la API
   * @returns URL de la API
   */
  getApiUrl(): string {
    // Devuelve directamente el valor de apiUrl del environment
    return this.env['apiUrl'] || 'https://localhost:44342/api';
  }
}