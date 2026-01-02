import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importante para directivas básicas
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Rol } from '../../models/types'; // Asegúrate que este path sea correcto

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-900 to-[#4a0012] flex items-center justify-center p-4 font-sans">
      
      <div class="bg-white rounded-[40px] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col relative animate-fade-in-up">
        
        <div class="h-40 bg-[#800020] flex flex-col items-center justify-center relative overflow-hidden">
           <div class="absolute top-[-50%] left-[-20%] w-60 h-60 bg-white opacity-5 rounded-full"></div>
           <div class="absolute bottom-[-20%] right-[-10%] w-40 h-40 bg-white opacity-5 rounded-full"></div>

           <div class="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-inner mb-2 border border-white/20">
              <i class="fa-solid fa-fire-burner text-4xl text-white"></i>
           </div>
           <h1 class="text-white font-bold text-2xl tracking-wide">Kjaras System</h1>
           <p class="text-red-200 text-xs uppercase tracking-widest opacity-80">Acceso Rápido</p>
        </div>

        <div class="p-8 pt-10">
          
          <div class="mb-8 text-center">
             <h2 class="text-gray-800 font-black text-xl mb-2">Selecciona tu Rol</h2>
             <p class="text-gray-400 text-sm">Ingresa al sistema simulando un perfil</p>
          </div>

          <div class="space-y-6">
            
            <div class="relative group">
               <label class="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Perfil de Usuario</label>
               <div class="relative">
                 <i class="fa-solid fa-user-tag absolute left-4 top-1/2 transform -translate-y-1/2 text-[#800020]"></i>
                 
                 <select [(ngModel)]="rolSeleccionado" 
                         class="w-full bg-gray-50 border border-gray-200 text-gray-700 font-bold py-4 pl-12 pr-8 rounded-2xl appearance-none focus:outline-none focus:bg-white focus:border-[#800020] focus:ring-4 focus:ring-[#800020]/10 transition cursor-pointer">
                    <option value="admin">Administrador</option>
                    <option value="caja">Cajero (Ventas)</option>
                    <option value="parrillero">Parrillero (Cocina)</option>
                 </select>
                 
                 <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <i class="fa-solid fa-chevron-down text-xs"></i>
                 </div>
               </div>
            </div>

            <button (click)="ingresar()" 
                    class="w-full bg-[#800020] text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-red-900/30 hover:bg-[#600018] hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 group">
               <span>Ingresar al Sistema</span>
               <i class="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
            </button>

          </div>
        </div>

        <div class="bg-gray-50 p-4 text-center">
           <p class="text-xs text-gray-400 font-medium">Modo Demo / Desarrollo</p>
        </div>

      </div>
    </div>
  `,
  styles: [`
    /* Animación suave de entrada */
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
      animation: fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
  `]
})
export class LoginComponent {
  rolSeleccionado: Rol = 'caja'; // Valor por defecto

  constructor(private authService: AuthService) {}

  ingresar() {
    // Simulamos login con usuario "Demo"
    // Nota: Asegúrate de que tu AuthService tenga un método compatible con esto
    // o adapta esta línea a tu lógica real.
    this.authService.login('Usuario Demo', this.rolSeleccionado);
  }
}