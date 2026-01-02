import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes'; // Importamos el archivo que acabamos de crear

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes) 
    // Aquí puedes añadir más providers como provideHttpClient(), etc.
  ]
};