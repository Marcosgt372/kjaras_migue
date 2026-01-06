import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService, Pedido } from '../../services/pedido.service';
import { Observable, map } from 'rxjs';

// Extendemos la interfaz localmente para manejar el estado visual del Swipe
interface PedidoUI extends Pedido {
  swipeX: number;      // Posición actual X
  isDragging: boolean; // Si se está arrastrando
  showOptions: boolean; // Si mostró opciones (swipe derecha)
  animating: boolean;  // Para transición suave al resetear
}

@Component({
  selector: 'app-cocina',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-gray-100 min-h-screen font-sans text-gray-700 overflow-hidden flex flex-col">
      
      <header class="bg-[#800020] text-white p-6 shadow-lg z-20 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <i class="fa-solid fa-fire-burner text-2xl"></i>
          </div>
          <div>
            <h1 class="text-2xl font-bold tracking-wide">Cocina <span class="text-red-200">KDS</span></h1>
            <p class="text-xs text-red-200 opacity-80">Sistema de Comandas</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <button 
            (click)="actualizarPedidos()" 
            [disabled]="isRefreshing"
            class="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-bold transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm">
            <i class="fa-solid fa-rotate-right" [class.animate-spin]="isRefreshing"></i>
            <span class="hidden sm:inline">{{ isRefreshing ? 'Actualizando...' : 'Actualizar' }}</span>
          </button>
          <div class="text-right">
             <p class="text-sm font-bold opacity-80">{{ fechaActual | date:'mediumDate' }}</p>
             <p class="text-xl font-bold">{{ fechaActual | date:'HH:mm' }}</p>
          </div>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto p-6 scrollbar-hide">
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          
          <div *ngIf="(pedidosUI$ | async)?.length === 0" class="col-span-full flex flex-col items-center justify-center py-20 text-gray-400 opacity-60">
             <i class="fa-solid fa-utensils text-6xl mb-4"></i>
             <h2 class="text-2xl font-bold">Todo tranquilo en la cocina</h2>
             <p>Esperando nuevas comandas...</p>
          </div>

          <div *ngFor="let pedido of pedidosUI$ | async" 
               class="relative h-[400px] w-full select-none"> <div class="absolute inset-0 rounded-[30px] overflow-hidden flex shadow-inner bg-gray-200 border-2 border-gray-200">
                
                <div class="w-1/2 h-full flex flex-col justify-center items-center gap-4 p-4 transition-opacity duration-200"
                     [style.opacity]="pedido.swipeX > 50 ? 1 : 0">
                    <button (click)="accionRapida(pedido, 'espera')" class="w-full py-3 bg-orange-400 text-white rounded-xl font-bold shadow hover:scale-105 transition flex flex-col items-center">
                        <i class="fa-solid fa-clock mb-1"></i> EN ESPERA
                    </button>
                    <button (click)="accionRapida(pedido, 'rechazar')" class="w-full py-3 bg-red-600 text-white rounded-xl font-bold shadow hover:scale-105 transition flex flex-col items-center">
                        <i class="fa-solid fa-ban mb-1"></i> RECHAZAR
                    </button>
                    <p class="text-xs font-bold text-gray-500 mt-2 text-center">Soltar para cancelar</p>
                </div>

                <div class="w-1/2 h-full bg-green-500 ml-auto flex flex-col justify-center items-center text-white p-4 transition-opacity duration-200"
                     [style.opacity]="pedido.swipeX < -50 ? 1 : 0">
                    <i class="fa-solid fa-circle-check text-5xl mb-2 scale-125"></i>
                    <h3 class="text-xl font-bold uppercase tracking-widest">Listo</h3>
                    <p class="text-sm opacity-90">Soltar para confirmar</p>
                </div>
            </div>

            <div class="absolute inset-0 bg-white rounded-[30px] shadow-xl flex flex-col overflow-hidden cursor-grab active:cursor-grabbing border border-gray-100"
                 [class.transition-transform]="pedido.animating"
                 [class.duration-300]="pedido.animating"
                 [style.transform]="'translateX(' + pedido.swipeX + 'px)'"
                 [class.rotate-1]="pedido.isDragging"
                 (mousedown)="startDrag($event, pedido)"
                 (touchstart)="startDrag($event, pedido)"
                 (mousemove)="onDrag($event, pedido)"
                 (touchmove)="onDrag($event, pedido)"
                 (mouseup)="endDrag(pedido)"
                 (mouseleave)="endDrag(pedido)"
                 (touchend)="endDrag(pedido)">
              
              <div class="p-5 border-b border-gray-100 flex justify-between items-start"
                   [ngClass]="{'bg-yellow-50': pedido.estado === 'cocinando', 'bg-white': pedido.estado === 'pendiente'}">
                 <div>
                   <h2 class="text-2xl font-black text-gray-800">Mesa {{ pedido.mesa }}</h2>
                   <span class="inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold uppercase"
                         [ngClass]="{'bg-yellow-100 text-yellow-700': pedido.estado === 'cocinando', 'bg-gray-100 text-gray-500': pedido.estado === 'pendiente'}">
                     {{ pedido.estado === 'cocinando' ? '🔥 Cocinando' : '⏳ Pendiente' }}
                   </span>
                 </div>
                 <div class="text-right">
                   <p class="text-xs font-bold text-gray-400 uppercase">Tiempo</p>
                   <p class="text-xl font-bold text-[#800020] font-mono">12:45</p>
                   <div class="mt-2">
                     <p class="text-2xl font-black text-[#800020] font-mono">#{{ pedido.id }}</p>
                   </div>
                 </div>
              </div>

              <div class="flex-1 overflow-y-auto p-5 space-y-3">
                 <ng-container *ngFor="let item of pedido.items">
                   <!-- Solo mostrar si es un plato -->
                   <div *ngIf="item.producto.categoria === 'plato'" class="flex items-center justify-between bg-gray-50 rounded-xl p-3 border border-gray-100">
                     <div class="flex items-center gap-3">
                       <div class="w-10 h-10 bg-[#800020] text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0">
                         {{ item.cantidad }}
                       </div>
                       <p class="font-bold text-gray-800 text-lg">{{ item.producto.nombre }}</p>
                     </div>
                     <p class="font-black text-[#800020] text-xl">{{ item.producto.precio }} Bs</p>
                   </div>
                 </ng-container>
              </div>

              <div class="p-3 bg-gray-50 text-center text-[10px] text-gray-400 font-bold uppercase tracking-wider flex justify-between items-center px-6">
                 <span class="flex items-center gap-1"><i class="fa-solid fa-arrow-left"></i> Confirmar</span>
                 <span class="flex items-center gap-1">Opciones <i class="fa-solid fa-arrow-right"></i></span>
              </div>
            </div>

          </div> </div>
      </div>
    </div>
  `,
  styles: [`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    /* Cursor personalizado al agarrar */
    .cursor-grab { cursor: grab; }
    .cursor-grabbing { cursor: grabbing; }
  `]
})
export class CocinaComponent {
  fechaActual = new Date();
  pedidosUI$: Observable<PedidoUI[]>;
  isRefreshing = false;

  // Variables para la lógica del drag
  private startX = 0;
  private currentX = 0;

  constructor(private pedidoService: PedidoService) {
    // Mapeamos los pedidos del servicio a nuestra interfaz UI local con propiedades de swipe
    this.pedidosUI$ = this.pedidoService.pedidosCocina$.pipe(
      map(pedidos => pedidos.map(p => ({
        ...p,
        swipeX: 0,
        isDragging: false,
        showOptions: false,
        animating: false
      })))
    );

    // Actualizar reloj
    setInterval(() => this.fechaActual = new Date(), 60000);
  }

  // --- LÓGICA DE GESTOS (SWIPE) ---

  startDrag(event: MouseEvent | TouchEvent, pedido: PedidoUI) {
    pedido.isDragging = true;
    pedido.animating = false; // Desactivar transición durante el arrastre para que sea inmediato
    
    if (event instanceof MouseEvent) {
      this.startX = event.clientX;
    } else if(event.touches && event.touches.length > 0) {
      this.startX = event.touches[0].clientX;
    }
  }

  onDrag(event: MouseEvent | TouchEvent, pedido: PedidoUI) {
    if (!pedido.isDragging) return;

    let clientX = 0;
    if (event instanceof MouseEvent) {
      clientX = event.clientX;
    } else if(event.touches && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
    }

    // Calcular desplazamiento
    const diff = clientX - this.startX;
    
    // Limitar el movimiento visual (para que no se salga de la pantalla)
    // Máximo 150px a la derecha, -200px a la izquierda
    if (diff > -250 && diff < 200) {
      pedido.swipeX = diff;
    }
  }

  endDrag(pedido: PedidoUI) {
    if (!pedido.isDragging) return;
    pedido.isDragging = false;
    pedido.animating = true; // Reactivar transición suave para el rebote o salida

    const threshold = 100; // Píxeles necesarios para activar acción

    // 1. DESLIZÓ A LA IZQUIERDA (CONFIRMAR / LISTO)
    if (pedido.swipeX < -threshold) {
      // Animación de salida completa a la izquierda
      pedido.swipeX = -500; 
      setTimeout(() => {
        this.confirmarPedido(pedido);
      }, 300); // Esperar que termine la animación visual
    } 
    
    // 2. DESLIZÓ A LA DERECHA (MOSTRAR OPCIONES)
    else if (pedido.swipeX > threshold) {
      // Se queda abierto mostrando opciones
      pedido.swipeX = 180; // Posición fija para mostrar botones
      pedido.showOptions = true;
    } 
    
    // 3. NO LLEGÓ AL UMBRAL (RESET)
    else {
      pedido.swipeX = 0;
      pedido.showOptions = false;
    }
  }

  // --- ACCIONES DE NEGOCIO ---

  confirmarPedido(pedido: PedidoUI) {
    // Sonido de confirmación (opcional)
    // const audio = new Audio('assets/ding.mp3'); audio.play();
    
    // Llamar al servicio
    this.pedidoService.cambiarEstadoPedido(pedido.id, 'listo');
  }

  accionRapida(pedido: PedidoUI, accion: 'espera' | 'rechazar') {
    if (accion === 'espera') {
        // Lógica de espera (cambiar estado visual, mover al final, etc.)
        alert(`Pedido mesa ${pedido.mesa} puesto en ESPERA`);
        pedido.swipeX = 0; // Resetear tarjeta
    } else {
        // Lógica rechazar
        if(confirm('¿Rechazar comanda?')) {
            this.pedidoService.cambiarEstadoPedido(pedido.id, 'rechazado');
        } else {
            pedido.swipeX = 0; // Cancelar acción
        }
    }
  }

  actualizarPedidos() {
    if (this.isRefreshing) return;
    
    this.isRefreshing = true;
    
    // Llamar al servicio sin esperar
    this.pedidoService.cargarPedidosCocina().catch(err => {
      console.error('Error al actualizar pedidos:', err);
    });
    
    // Resetear después de 300ms
    setTimeout(() => {
      this.isRefreshing = false;
    }, 300);
  }
}