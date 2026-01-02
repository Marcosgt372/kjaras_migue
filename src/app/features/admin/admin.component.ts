import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService, Producto } from '../../services/pedido.service';
import { HistorialComponent } from '../historial/historial.component';

// Interfaces
interface ProductoAdmin {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  stock?: number;
  imagen?: string;
  rating?: number; // Agregado para estética
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, HistorialComponent],
  template: `
    <div class="bg-gray-50 min-h-screen flex font-sans text-gray-700 overflow-hidden">
      
      <aside class="w-72 bg-[#800020] text-white flex flex-col justify-between p-8 rounded-r-[40px] shadow-2xl z-20 relative">
        <div>
          <div class="flex items-center gap-3 mb-12">
            <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <i class="fa-solid fa-crown text-white"></i>
            </div>
            <h1 class="text-2xl font-bold tracking-wide">RestoAdmin</h1>
          </div>

          <div class="text-center mb-10 bg-[#901e38] p-6 rounded-3xl shadow-inner border border-[#a3324d]">
            <div class="w-20 h-20 bg-white rounded-full mx-auto mb-3 p-1">
              <img src="https://i.pravatar.cc/150?img=68" class="w-full h-full rounded-full object-cover">
            </div>
            <h3 class="font-bold text-lg">Admin User</h3>
            <p class="text-xs text-red-200 opacity-80">Gerente General</p>
          </div>

          <nav class="space-y-4">
            <button (click)="activeTab = 'menu'" 
                    [class]="activeTab === 'menu' ? 'bg-white text-[#800020] shadow-lg' : 'text-red-100 hover:bg-[#901e38]'"
                    class="w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-semibold group">
              <i class="fa-solid fa-utensils transition-transform group-hover:scale-110"></i> 
              Gestión Menú
            </button>
            
            <button (click)="activeTab = 'inventario'"
                    [class]="activeTab === 'inventario' ? 'bg-white text-[#800020] shadow-lg' : 'text-red-100 hover:bg-[#901e38]'"
                    class="w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-semibold group">
              <i class="fa-solid fa-boxes-stacked transition-transform group-hover:scale-110"></i> 
              Inventario
            </button>
            
            <button (click)="activeTab = 'historial'"
                    [class]="activeTab === 'historial' ? 'bg-white text-[#800020] shadow-lg' : 'text-red-100 hover:bg-[#901e38]'"
                    class="w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-semibold group">
              <i class="fa-solid fa-clock-rotate-left transition-transform group-hover:scale-110"></i> 
              Historial
            </button>
          </nav>
        </div>

        <button class="bg-[#5a0016] text-white py-4 rounded-2xl font-semibold shadow-lg hover:bg-[#4a0012] transition flex items-center justify-center gap-2 mt-auto">
          <i class="fa-solid fa-arrow-right-from-bracket"></i> Cerrar Sesión
        </button>
      </aside>

      <main class="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div class="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-red-50 to-transparent -z-10"></div>

        <header class="px-10 py-8 flex justify-between items-center">
          <div class="w-1/3 relative">
            <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input type="text" placeholder="Buscar productos..." class="w-full bg-white pl-12 pr-4 py-4 rounded-2xl shadow-sm border-none focus:ring-2 focus:ring-[#800020] outline-none transition">
          </div>

          <div class="flex items-center gap-4">
            <button class="w-12 h-12 bg-white rounded-full shadow-sm text-gray-400 hover:text-[#800020] hover:shadow-md transition flex items-center justify-center">
              <i class="fa-solid fa-bell"></i>
            </button>
            <button class="bg-[#800020] text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition font-medium flex items-center gap-2">
              <i class="fa-solid fa-plus"></i> Nuevo Item
            </button>
          </div>
        </header>

        <div class="flex-1 overflow-y-auto px-10 pb-10 scrollbar-hide">
          
          <section class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div class="bg-white p-6 rounded-[30px] shadow-sm flex items-center gap-5 hover:shadow-md transition cursor-pointer">
              <div class="w-20 h-20 rounded-2xl overflow-hidden shadow-inner">
                <img src="https://images.unsplash.com/photo-1554306274-fbf387259569?auto=format&fit=crop&w=200&q=80" class="w-full h-full object-cover">
              </div>
              <div>
                <h4 class="font-bold text-gray-800 text-lg">Ingresos Hoy</h4>
                <p class="text-[#800020] font-bold text-2xl">Bs 1,250</p>
                <p class="text-xs text-gray-400 mt-1">15 órdenes nuevas</p>
              </div>
            </div>

            <div class="bg-white p-6 rounded-[30px] shadow-sm flex items-center gap-5 hover:shadow-md transition cursor-pointer border-l-4 border-[#800020]">
              <div class="w-20 h-20 rounded-2xl overflow-hidden shadow-inner relative">
                <img src="https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=200&q=80" class="w-full h-full object-cover opacity-80">
                <div class="absolute inset-0 bg-red-900/20 flex items-center justify-center">
                   <i class="fa-solid fa-triangle-exclamation text-white text-2xl drop-shadow-md"></i>
                </div>
              </div>
              <div>
                <h4 class="font-bold text-gray-800 text-lg">Alerta Stock</h4>
                <p class="text-red-500 font-bold text-2xl">3 Items</p>
                <p class="text-xs text-gray-400 mt-1">Reponer urgente</p>
              </div>
            </div>

            <div class="bg-white p-6 rounded-[30px] shadow-sm flex items-center gap-5 hover:shadow-md transition cursor-pointer">
              <div class="w-20 h-20 rounded-2xl overflow-hidden shadow-inner">
                <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=200&q=80" class="w-full h-full object-cover">
              </div>
              <div>
                <h4 class="font-bold text-gray-800 text-lg">Platos Activos</h4>
                <p class="text-[#800020] font-bold text-2xl">24 Platos</p>
                <p class="text-xs text-gray-400 mt-1">En el menú digital</p>
              </div>
            </div>
          </section>

          <div class="flex justify-between items-end mb-6">
            <div>
               <h2 class="text-2xl font-bold text-gray-800">
                 {{ activeTab === 'menu' ? 'Gestión del Menú' : activeTab === 'inventario' ? 'Control de Inventario' : 'Historial de Pedidos' }}
               </h2>
               <p class="text-gray-400 text-sm mt-1">
                 {{ activeTab === 'historial' ? 'Revisa todos los pedidos registrados' : 'Administra tus productos de forma visual' }}
               </p>
            </div>
          </div>

          <div class="bg-white rounded-[40px] shadow-sm p-8 min-h-[500px]">
            
            <div *ngIf="activeTab === 'menu'" class="animate-fadeIn">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="text-gray-400 text-sm border-b border-gray-100">
                    <th class="pb-4 pl-4 font-medium">Plato / Producto</th>
                    <th class="pb-4 font-medium">Categoría</th>
                    <th class="pb-4 font-medium">Rating</th>
                    <th class="pb-4 font-medium">Precio</th>
                    <th class="pb-4 pr-4 text-right font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr *ngFor="let p of productos" class="group hover:bg-red-50/30 transition duration-300">
                    <td class="py-4 pl-4">
                      <div class="flex items-center gap-4">
                        <img [src]="p.imagen" class="w-16 h-16 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition">
                        <div>
                          <p class="font-bold text-gray-800 text-lg">{{ p.nombre }}</p>
                          <p class="text-xs text-gray-400">ID: #{{ p.id }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="py-4">
                       <span class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
                             [ngClass]="{'bg-orange-100 text-orange-600': p.categoria === 'plato', 'bg-blue-100 text-blue-600': p.categoria === 'bebida'}">
                         {{ p.categoria }}
                       </span>
                    </td>
                    <td class="py-4">
                       <div class="flex text-yellow-400 text-xs">
                          <i class="fa-solid fa-star" *ngFor="let s of [1,2,3,4,5]"></i>
                       </div>
                    </td>
                    <td class="py-4">
                      <div class="flex items-center bg-gray-50 w-fit rounded-xl px-3 py-2 border border-transparent group-hover:border-gray-200 group-hover:bg-white transition">
                        <span class="text-[#800020] font-bold mr-1">Bs</span>
                        <input type="number" [(ngModel)]="p.precio" class="bg-transparent w-16 font-bold text-gray-700 outline-none">
                      </div>
                    </td>
                    <td class="py-4 pr-4 text-right">
                      <div class="flex justify-end gap-2">
                         <button class="w-10 h-10 rounded-xl bg-gray-50 hover:bg-[#800020] hover:text-white transition flex items-center justify-center text-gray-400">
                           <i class="fa-solid fa-pen"></i>
                         </button>
                         <button class="w-10 h-10 rounded-xl bg-gray-50 hover:bg-red-500 hover:text-white transition flex items-center justify-center text-gray-400">
                           <i class="fa-solid fa-trash"></i>
                         </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div *ngIf="activeTab === 'inventario'" class="animate-fadeIn grid grid-cols-1 md:grid-cols-2 gap-6">
               <div *ngFor="let bebida of inventario" class="bg-gray-50 rounded-3xl p-5 flex items-center gap-4 relative overflow-hidden group hover:bg-white hover:shadow-lg hover:border hover:border-gray-100 transition duration-300">
                  <div class="absolute left-0 top-0 bottom-0 w-2" 
                       [ngClass]="(bebida.stock || 0) < 10 ? 'bg-red-500' : 'bg-green-500'"></div>

                  <img [src]="bebida.imagen" class="w-24 h-24 rounded-2xl object-cover shadow-md z-10">
                  
                  <div class="flex-1 z-10">
                    <div class="flex justify-between items-start mb-2">
                        <h4 class="font-bold text-lg text-gray-800">{{ bebida.nombre }}</h4>
                        <span class="text-xs font-bold px-2 py-1 rounded-lg"
                              [ngClass]="(bebida.stock || 0) < 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'">
                             {{ (bebida.stock || 0) < 10 ? 'BAJO' : 'OK' }}
                        </span>
                    </div>
                    
                    <div class="flex items-center justify-between mt-4 bg-white p-2 rounded-xl shadow-sm">
                       <button (click)="guardarStock(bebida, -1)" class="w-8 h-8 rounded-lg bg-gray-100 hover:bg-red-100 hover:text-red-600 transition flex items-center justify-center font-bold">-</button>
                       <span class="font-bold text-xl text-gray-700">{{ bebida.stock }}</span>
                       <button (click)="guardarStock(bebida, 1)" class="w-8 h-8 rounded-lg bg-gray-100 hover:bg-green-100 hover:text-green-600 transition flex items-center justify-center font-bold">+</button>
                    </div>
                  </div>
               </div>
            </div>

            <!-- Tab de Historial -->
            <div *ngIf="activeTab === 'historial'" class="animate-fadeIn">
              <app-historial></app-historial>
            </div>

          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    /* Animación de entrada simple */
    .animate-fadeIn {
      animation: fadeIn 0.4s ease-out forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    /* Ocultar barra de scroll pero permitir funcionalidad */
    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }
    .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
  `]
})
export class AdminComponent {
  activeTab: 'menu' | 'inventario' | 'historial' = 'menu';
  productos: Producto[] = [];
  inventario: Producto[] = [];

  constructor(private pedidoService: PedidoService) {
    // Suscribirse a los datos reales
    this.pedidoService.productos$.subscribe(data => {
      this.productos = data; // Para la pestaña Menú
      this.inventario = [...data]; // Para la pestaña Inventario (puedes filtrar si quieres)
    });
  }

  // Actualizar Stock Real
  guardarStock(item: Producto, delta: number) {
    const nuevoStock = (item.stock || 0) + delta;
    if (nuevoStock >= 0) {
      this.pedidoService.actualizarStock(item.id, nuevoStock);
    }
  }

  // Actualizar Precio Real (puedes llamarlo con (change) en el input)
  guardarPrecio(item: Producto) {
    this.pedidoService.actualizarPrecio(item.id, item.precio);
  }
}