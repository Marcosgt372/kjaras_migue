import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="w-64 bg-primary h-screen fixed left-0 top-0 flex flex-col text-white py-6 px-4 shadow-xl z-50">
      <div class="flex flex-col items-center mb-10">
        <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-3 text-primary font-bold text-2xl shadow-sm">
          KJ
        </div>
        <h2 class="text-xl font-bold">Kjaras App</h2>
        <p class="text-sm opacity-80">Bienvenido</p>
      </div>

      <nav class="flex-1 space-y-2">
        <a routerLink="/caja" routerLinkActive="bg-white/20 font-bold" 
           class="flex items-center gap-3 p-3 rounded-xl transition hover:bg-white/10 cursor-pointer">
          <span class="material-icons">grid_view</span> 
          <span>Hacer Pedido</span>
        </a>

        <a routerLink="/cocina" routerLinkActive="bg-white/20 font-bold" 
           class="flex items-center gap-3 p-3 rounded-xl transition hover:bg-white/10 cursor-pointer">
          <span class="material-icons">soup_kitchen</span> 
          <span>Cocina</span>
        </a>

        <a *ngIf="esAdmin()" routerLink="/admin" routerLinkActive="bg-white/20 font-bold" 
           class="flex items-center gap-3 p-3 rounded-xl transition hover:bg-white/10 cursor-pointer">
          <span class="material-icons">admin_panel_settings</span> 
          <span>Administración</span>
        </a>
      </nav>

      <button (click)="logout()" class="flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/20 text-red-100 mt-auto transition">
        <span class="material-icons">logout</span> 
        <span>Salir</span>
      </button>
    </aside>
  `
})
export class SidebarComponent {
  constructor(public auth: AuthService) {} // Asumiendo que inyectas auth
  esAdmin() { return this.auth.currentUser()?.rol === 'admin'; }
  logout() { this.auth.logout(); }
}