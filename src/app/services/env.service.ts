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
   * Obtiene el valor de una variable de entorno específica.
   * Busca la clave en el objeto `environment` importado.
   * @param key - El nombre (clave) de la variable de entorno.
   * @param defaultValue - El valor a devolver si la clave no se encuentra. Por defecto es una cadena vacía.
   * @returns El valor de la variable de entorno o el valor por defecto proporcionado.
   */
  get(key: string, defaultValue: any = ''): any {
    return this.env[key] || defaultValue;
  }

  /**
   * Comprueba si la aplicación se está ejecutando en modo de producción.
   * Se basa en el valor de la propiedad `production` en el archivo `environment`.
   * @returns `true` si la propiedad `production` es `true`, `false` en caso contrario.
   */
  isProduction(): boolean {
    // Devuelve directamente el valor de production del environment
    return this.env['production'] === true;
  }

  /**
   * Obtiene la URL base de la API desde la configuración del entorno.
   * Se basa en el valor de la propiedad `apiUrl` en el archivo `environment`.
   * @returns La URL de la API como cadena, o una cadena vacía si no está definida.
   */
  getApiUrl(): string {
    // Devuelve directamente el valor de apiUrl del environment
    return this.env['apiUrl'] || '';
  }
}