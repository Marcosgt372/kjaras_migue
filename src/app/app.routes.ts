import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './features/login/login.component';
import { CajaComponent } from './features/caja/caja.component';
import { CocinaComponent } from './features/cocina/cocina.component';
import { AdminComponent } from './features/admin/admin.component';
import { HistorialComponent } from './features/historial/historial.component';

export const routes: Routes = [
  // Ruta por defecto: Redirigir al Login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Ruta Pública
  { path: 'login', component: LoginComponent },

  // Rutas Protegidas (Usamos el Guard y 'data' para especificar el rol)
  { 
    path: 'caja', 
    component: CajaComponent, 
    canActivate: [authGuard],
    data: { rol: 'caja' } 
  },
  { 
    path: 'cocina', 
    component: CocinaComponent, 
    canActivate: [authGuard],
    data: { rol: 'parrillero' } 
  },
  { 
    path: 'admin', 
    component: AdminComponent, 
    canActivate: [authGuard],
    data: { rol: 'admin' } 
  },
  { 
    path: 'historial', 
    component: HistorialComponent, 
    canActivate: [authGuard],
    data: { rol: 'caja' } 
  },

  // Comodín (Wildcard): Si escriben cualquier cosa rara, mandar a login
  { path: '**', redirectTo: 'login' }
];