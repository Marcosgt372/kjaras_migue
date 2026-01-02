import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Rol } from '../models/types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Usamos Signals (nueva tecnología de Angular) para gestionar el usuario
  currentUser = signal<{ username: string; rol: Rol } | null>(null);

  constructor(private router: Router) {}

  login(username: string, rol: Rol) {
    // Aquí iría la conexión real a Supabase/Backend
    this.currentUser.set({ username, rol });
    
    // Redirección inteligente
    if (rol === 'admin') this.router.navigate(['/admin']);
    else if (rol === 'caja') this.router.navigate(['/caja']);
    else if (rol === 'parrillero') this.router.navigate(['/cocina']);
  }

  logout() {
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  tienePermiso(rolRequerido: Rol): boolean {
    const user = this.currentUser();
    if (!user) return false;
    if (user.rol === 'admin') return true; // Admin puede todo
    return user.rol === rolRequerido;
  }
}