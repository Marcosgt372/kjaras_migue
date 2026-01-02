import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Rol } from '../models/types';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const usuarioActual = authService.currentUser();
  const rolEsperado = route.data['rol'] as Rol;

  // 1. Si no hay usuario logueado, mandar al Login
  if (!usuarioActual) {
    return router.parseUrl('/login');
  }

  // 2. Si es Admin, entra a todo
  if (usuarioActual.rol === 'admin') {
    return true;
  }

  // 3. Si el rol coincide con el esperado, pasa
  if (usuarioActual.rol === rolEsperado) {
    return true;
  }

  // 4. Si intenta entrar donde no debe, lo mandamos a su lugar correcto
  if (usuarioActual.rol === 'caja') return router.parseUrl('/caja');
  if (usuarioActual.rol === 'parrillero') return router.parseUrl('/cocina');

  return router.parseUrl('/login');
};