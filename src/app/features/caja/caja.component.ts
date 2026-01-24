import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PedidoService, Producto } from '../../services/pedido.service';
//import { BnbService } from '../../../../../src/app/services/bnb.service';
import { TicketComponent } from '../ticket/ticket';


// Interface local para ItemPedido
export interface ItemPedido {
  producto: Producto;
  cantidad: number;
  subtotal: number;
  notas?: string;
  nombrePersonalizado?: string; // Para productos personalizados
  precioPersonalizado?: number; // Para productos personalizados
}

@Component({
  selector: 'app-caja',
  standalone: true,
  imports: [CommonModule, FormsModule, TicketComponent],
  template: `
    <div class="bg-gray-50 h-screen w-full flex font-sans text-gray-700 overflow-hidden relative">
      
      <!-- Modal de Apertura de Caja -->
      <div *ngIf="!cajaAbierta" class="absolute inset-0 z-50 bg-[#800020]/90 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white p-6 lg:p-8 rounded-3xl lg:rounded-[40px] shadow-2xl w-full max-w-md text-center animate-bounce-in">
          <div class="w-16 h-16 lg:w-20 lg:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
            <i class="fa-solid fa-shop-lock text-3xl lg:text-4xl text-[#800020]"></i>
          </div>
          <h2 class="text-xl lg:text-2xl font-black text-gray-800 mb-2">Caja Cerrada</h2>
          <p class="text-sm lg:text-base text-gray-500 mb-4 lg:mb-6">Ingresa el monto inicial para comenzar a vender.</p>

          <div class="text-left mb-4 lg:mb-6">
            <label class="text-xs font-bold text-gray-400 uppercase ml-2">Usuario</label>
            <input [(ngModel)]="usuarioActual" type="text" class="w-full bg-gray-100 rounded-xl px-4 py-2.5 lg:py-3 font-bold mb-3 border border-transparent focus:border-[#800020] outline-none text-sm lg:text-base">
            
            <label class="text-xs font-bold text-gray-400 uppercase ml-2">Monto Inicial (Base)</label>
            <div class="relative">
              <span class="absolute left-4 top-2.5 lg:top-3 text-gray-400 font-bold text-sm lg:text-base">Bs</span>
              <input [(ngModel)]="montoApertura" type="number" class="w-full bg-gray-100 rounded-xl pl-10 pr-4 py-2.5 lg:py-3 font-bold text-lg lg:text-xl text-[#800020] border border-transparent focus:border-[#800020] outline-none">
            </div>
          </div>

          <button (click)="abrirCaja()" 
                  [disabled]="cargandoApertura"
                  class="w-full bg-[#800020] text-white py-3 lg:py-4 rounded-xl font-bold text-base lg:text-lg shadow-lg hover:bg-[#600018] transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2">
            <span *ngIf="cargandoApertura" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
            <span *ngIf="!cargandoApertura">Abrir Turno</span>
            <span *ngIf="cargandoApertura">Abriendo...</span>
          </button>
        </div>
      </div>

      <!-- Modal de Cierre de Caja -->
      <div *ngIf="mostrarModalCierre" class="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white p-6 lg:p-8 rounded-3xl lg:rounded-[40px] shadow-2xl w-full max-w-md text-center animate-fade-in">
           <h2 class="text-xl lg:text-2xl font-black text-gray-800 mb-2">Cerrar Caja</h2>
           <p class="text-sm lg:text-base text-gray-500 mb-4 lg:mb-6">Cuenta el dinero físico antes de cerrar.</p>
           
           <div class="text-left mb-4 lg:mb-6">
            <label class="text-xs font-bold text-gray-400 uppercase ml-2">Dinero en Efectivo (Contado)</label>
            <div class="relative">
              <span class="absolute left-4 top-2.5 lg:top-3 text-gray-400 font-bold text-sm lg:text-base">Bs</span>
              <input [(ngModel)]="montoCierre" type="number" class="w-full bg-gray-100 rounded-xl pl-10 pr-4 py-2.5 lg:py-3 font-bold text-lg lg:text-xl text-[#800020] border border-transparent focus:border-[#800020] outline-none">
            </div>
           </div>

           <div class="flex gap-3">
             <button (click)="mostrarModalCierre = false" 
                     [disabled]="cargandoCierre"
                     class="flex-1 bg-gray-200 text-gray-600 py-2.5 lg:py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base">
               Cancelar
             </button>
             <button (click)="confirmarCierre()" 
                     [disabled]="cargandoCierre"
                     class="flex-1 bg-[#800020] text-white py-2.5 lg:py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm lg:text-base">
               <span *ngIf="cargandoCierre" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
               <span *ngIf="!cargandoCierre">Cerrar Turno</span>
               <span *ngIf="cargandoCierre">Cerrando...</span>
             </button>
           </div>
        </div>
      </div>

      <!-- Modal de Pago QR -->
      <div *ngIf="mostrarModalQR" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
        <div class="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden relative text-center">
            
            <div class="bg-[#800020] p-6 text-white">
              <h3 class="text-xl font-bold">Escanea para Pagar</h3>
              <p class="opacity-80 text-sm">QR Simple - BNB</p>
            </div>

            <div class="p-8 flex flex-col items-center justify-center min-h-[300px]">
               
               <div *ngIf="estadoPago === 'esperando'" class="space-y-4">
                  <div class="p-2 border-4 border-dashed border-[#800020]/20 rounded-2xl inline-block">
                     <img [src]="qrImageBase64" class="w-64 h-64 object-contain rounded-xl">
                  </div>
                  
                  <p class="font-bold text-2xl text-gray-800">{{ total }} Bs</p>
                  
                  <div class="flex items-center justify-center gap-2 text-gray-500 text-sm animate-pulse">
                     <i class="fa-solid fa-spinner fa-spin"></i> Esperando confirmación del banco...
                  </div>
               </div>

               <div *ngIf="estadoPago === 'pagado'" class="animate-bounce-in">
                  <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                     <i class="fa-solid fa-check text-5xl text-green-500"></i>
                  </div>
                  <h3 class="text-2xl font-black text-gray-800">¡Pago Exitoso!</h3>
                  <p class="text-gray-500">Procesando ticket...</p>
               </div>

            </div>

            <div *ngIf="estadoPago === 'esperando'" class="p-4 bg-gray-50">
               <button (click)="cancelarQR()" class="text-red-500 font-bold text-sm hover:underline">
                  Cancelar Operación
               </button>
            </div>

        </div>
      </div>

      <!-- Contenido Principal -->
      <div class="flex-1 flex flex-col h-full relative overflow-hidden transition-all duration-500" [class.blur-sm]="!cajaAbierta">
        
        <div class="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#800020]/5 to-transparent -z-10"></div>

        <div class="flex-1 overflow-y-auto px-4 lg:px-6 py-4 lg:py-6 scrollbar-hide">
          <header class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4 lg:mb-6">
            <div>
               <h1 class="text-xl lg:text-2xl font-bold text-gray-800">Menú <span class="text-[#800020]">Kjaras</span></h1>
               <div class="flex items-center gap-2">
                 <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                 <p class="text-green-600 text-xs font-bold uppercase tracking-wider">Caja Abierta: {{ usuarioActual }}</p>
               </div>
            </div>
            
            <div class="flex flex-wrap items-center gap-2 lg:gap-3 w-full lg:w-auto">
              <!-- Total de Ventas del Día -->
              <div class="bg-white px-3 lg:px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex-1 lg:flex-none">
                <p class="text-xs text-gray-400 font-bold uppercase">Ventas Hoy</p>
                <p class="text-lg lg:text-xl font-black text-green-600">{{ totalVentasHoy }} Bs</p>
                <p class="text-xs text-gray-500">{{ ventasHoy.length }} pedidos</p>
              </div>
              
              <div class="flex gap-2">
                <button (click)="irAHistorial()" 
                        class="bg-white text-gray-500 px-3 lg:px-4 py-2 rounded-xl border border-gray-200 shadow-sm hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition font-bold text-xs lg:text-sm flex items-center gap-2">
                   <i class="fa-solid fa-clock-rotate-left"></i> <span class="hidden sm:inline">Historial</span>
                </button>
                
                <button (click)="mostrarModalCierre = true" 
                        class="bg-white text-gray-500 px-3 lg:px-4 py-2 rounded-xl border border-gray-200 shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition font-bold text-xs lg:text-sm flex items-center gap-2">
                   <i class="fa-solid fa-store-slash"></i> <span class="hidden sm:inline">Cerrar Caja</span>
                </button>
              </div>
            </div>
          </header>

          <div class="flex gap-2 lg:gap-3 mb-4 lg:mb-6 overflow-x-auto pb-2 scrollbar-hide">
            <button (click)="filtroCategoria = 'todos'" 
                    [class]="filtroCategoria === 'todos' ? 'bg-[#800020] text-white' : 'bg-white text-gray-500'"
                    class="px-4 lg:px-5 py-2 lg:py-2.5 rounded-xl font-bold transition text-sm lg:text-base whitespace-nowrap">🔥 Todo</button>
            <button (click)="filtroCategoria = 'plato'" 
                    [class]="filtroCategoria === 'plato' ? 'bg-[#800020] text-white' : 'bg-white text-gray-500'"
                    class="px-4 lg:px-5 py-2 lg:py-2.5 rounded-xl font-bold transition text-sm lg:text-base whitespace-nowrap">🥘 Platos</button>
            <button (click)="filtroCategoria = 'bebida'" 
                    [class]="filtroCategoria === 'bebida' ? 'bg-[#800020] text-white' : 'bg-white text-gray-500'"
                    class="px-4 lg:px-5 py-2 lg:py-2.5 rounded-xl font-bold transition text-sm lg:text-base whitespace-nowrap">🥤 Bebidas</button>
            <button (click)="filtroCategoria = 'guarnicion'" 
                    [class]="filtroCategoria === 'guarnicion' ? 'bg-[#800020] text-white' : 'bg-white text-gray-500'"
                    class="px-4 lg:px-5 py-2 lg:py-2.5 rounded-xl font-bold transition text-sm lg:text-base whitespace-nowrap">🍟 Guarniciones</button>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-5 pb-20 lg:pb-6">
             <!-- Skeletons de carga -->
             <div *ngIf="cargandoProductos" class="contents">
               <div *ngFor="let item of [1,2,3,4,5,6,7,8,9,10]" class="bg-white p-2.5 lg:p-3 rounded-2xl lg:rounded-[30px] shadow-sm flex flex-col h-full">
                 <div class="animate-pulse">
                   <div class="h-32 lg:h-40 rounded-xl lg:rounded-[20px] bg-gray-200 mb-2 lg:mb-3"></div>
                   <div class="space-y-2">
                     <div class="h-3 bg-gray-200 rounded w-3/4"></div>
                     <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                   </div>
                 </div>
               </div>
             </div>

             <!-- Tarjeta de Producto Personalizado (siempre visible) -->
             <div *ngIf="!cargandoProductos" class="bg-gradient-to-br from-blue-50 to-blue-100 p-2.5 lg:p-3 rounded-2xl lg:rounded-[30px] shadow-sm border-2 border-blue-300 border-dashed flex flex-col h-full">
               <div class="flex-1 flex flex-col justify-center p-2">
                 <div class="text-center mb-2">
                   <i class="fa-solid fa-plus-circle text-3xl text-blue-500 mb-1"></i>
                   <p class="text-xs font-bold text-blue-700">Producto Personalizado</p>
                 </div>
                 
                 <input type="text" 
                        [(ngModel)]="productoPersonalizadoNombre"
                        placeholder="Nombre"
                        class="w-full px-2 py-1.5 text-xs border border-blue-300 rounded-lg mb-2 focus:border-blue-500 focus:outline-none">
                 
                 <input type="number" 
                        [(ngModel)]="productoPersonalizadoPrecio"
                        placeholder="Precio (Bs)"
                        class="w-full px-2 py-1.5 text-xs border border-blue-300 rounded-lg mb-2 focus:border-blue-500 focus:outline-none">
                 
                 <button (click)="agregarProductoPersonalizado()"
                         [disabled]="!productoPersonalizadoNombre || productoPersonalizadoPrecio <= 0"
                         class="w-full bg-blue-500 text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition">
                   Agregar
                 </button>
               </div>
             </div>

             <!-- Productos del menú -->
             <div *ngIf="!cargandoProductos" class="contents">
               <div *ngFor="let p of productosFiltrados; let i = index" 
                    (click)="agregarAlCarrito(p)" 
                    class="bg-white p-2.5 lg:p-3 rounded-2xl lg:rounded-[30px] shadow-sm hover:shadow-xl cursor-pointer group flex flex-col h-full transition animate-fade-in"
                    [style.animation-delay]="(i * 50) + 'ms'">
                   <div class="h-32 lg:h-40 rounded-xl lg:rounded-[20px] overflow-hidden relative mb-2 lg:mb-3">
                      <img [src]="p.imagen" class="w-full h-full object-cover">
                      <div class="absolute bottom-2 right-2 bg-white/95 px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg shadow-md">
                         <span class="text-[#800020] font-bold text-xs lg:text-sm">{{ p.precio }} Bs</span>
                      </div>
                   </div>
                   <h3 class="font-bold text-gray-800 text-xs lg:text-sm mb-1 leading-tight line-clamp-2">{{ p.nombre }}</h3>
               </div>
             </div>
          </div>

        </div>
      </div>

      <!-- Overlay para móvil -->
      <div *ngIf="carritoAbierto" 
           (click)="cerrarCarrito()" 
           class="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
           [class.opacity-100]="carritoAbierto"
           [class.opacity-0]="!carritoAbierto"></div>

      <!-- Sidebar del Carrito -->
      <aside [class.translate-x-full]="!carritoAbierto"
             class="fixed lg:relative translate-x-full lg:translate-x-0 transition-transform duration-300 ease-in-out right-0 top-0 w-full sm:w-96 lg:w-[400px] bg-white h-full shadow-2xl z-50 lg:z-40 flex flex-col border-l border-gray-100 flex-shrink-0" 
             [class.blur-sm]="!cajaAbierta">
         
         <!-- Overlay de Confirmación -->
         <div *ngIf="mostrarConfirmacion" class="absolute inset-0 z-50 bg-green-500/95 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in">
           <div class="text-center animate-scale-in">
             <div class="w-20 h-20 lg:w-24 lg:h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6 animate-bounce">
               <i class="fa-solid fa-check text-4xl lg:text-5xl text-green-500"></i>
             </div>
             <h3 class="text-2xl lg:text-3xl font-black text-white mb-2">¡Pedido Enviado!</h3>
             <p class="text-white/90 text-base lg:text-lg font-bold">ID: #{{ ultimoPedidoId }}</p>
             <p class="text-white/70 text-sm mt-2">Preparando nueva orden...</p>
           </div>
         </div>
         
         <!-- Header del carrito con contador -->
         <div class="p-4 lg:p-6 pb-2 bg-gradient-to-b from-[#800020]/5 to-transparent">
            <div class="flex items-center justify-between mb-3 lg:mb-4">
              <h2 class="text-lg lg:text-xl font-bold text-gray-800">Orden Actual</h2>
              <div class="flex items-center gap-2">
                <div class="bg-[#800020] text-white px-3 py-1 rounded-full text-xs font-bold">
                  {{ carrito.length }} items
                </div>
                <button (click)="cerrarCarrito()" 
                        class="lg:hidden w-8 h-8 bg-[#800020] text-white rounded-full flex items-center justify-center hover:bg-[#600018] transition">
                  <i class="fa-solid fa-times text-sm"></i>
                </button>
              </div>
            </div>
            
            <div class="bg-white p-3 rounded-xl border-2 border-gray-100 focus-within:border-[#800020] transition shadow-sm">
               <label class="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                  <i class="fa-solid fa-utensils"></i> Mesa / Cliente
               </label>
               <input [(ngModel)]="mesaSeleccionada" type="text" placeholder="Ej: Mesa 4" class="w-full bg-transparent outline-none text-base lg:text-lg font-bold text-[#800020]">
            </div>
         </div>

         <!-- Lista de items o mensaje vacío -->
         <div class="flex-1 overflow-y-auto px-4 lg:px-6 scrollbar-hide py-2">
           <!-- Mensaje cuando el carrito está vacío -->
           <div *ngIf="carrito.length === 0" class="flex flex-col items-center justify-center h-full text-center py-10">
             <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
               <i class="fa-solid fa-shopping-cart text-4xl text-gray-300"></i>
             </div>
             <h3 class="text-lg font-bold text-gray-800 mb-2">Carrito Vacío</h3>
             <p class="text-sm text-gray-500 mb-4">Agrega productos para comenzar</p>
             <button (click)="cerrarCarrito()" class="lg:hidden bg-[#800020] text-white px-6 py-2 rounded-lg font-bold text-sm">
               Ver Menú
             </button>
           </div>

           <!-- Items del carrito -->
           <div *ngIf="carrito.length > 0" class="space-y-3">
             <div *ngFor="let item of carrito; let i = index" class="group bg-gray-50 p-3 rounded-2xl border border-gray-100 hover:border-[#800020] hover:shadow-md transition">
                <div class="flex gap-3 items-start">
                  <img [src]="item.producto.imagen" class="w-16 h-16 lg:w-18 lg:h-18 rounded-xl object-cover border-2 border-white shadow-sm flex-shrink-0">
                  <div class="flex-1 min-w-0">
                     <div class="flex justify-between gap-2 mb-1">
                        <h4 class="font-bold text-gray-800 text-sm lg:text-base">{{ item.nombrePersonalizado || item.producto.nombre }}</h4>
                        <button (click)="eliminarDelCarrito(i)" class="w-6 h-6 rounded-full bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center flex-shrink-0 transition">
                          <i class="fa-solid fa-trash text-xs"></i>
                        </button>
                     </div>
                     <input [(ngModel)]="item.notas" placeholder="Agregar nota..." class="w-full text-xs bg-white rounded-lg px-2 py-1 border border-gray-200 focus:border-[#800020] outline-none text-gray-600 mb-2">
                     
                     <div class="flex justify-between items-center">
                         <div class="flex items-center bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <button (click)="disminuirCantidad(i)" class="w-8 h-8 font-bold text-gray-600 hover:bg-gray-50 transition">-</button>
                            <span class="w-10 text-center font-bold text-sm border-x border-gray-200">{{ item.cantidad }}</span>
                            <button (click)="agregarAlCarrito(item.producto)" class="w-8 h-8 font-bold text-gray-600 hover:bg-gray-50 transition">+</button>
                         </div>
                         <span class="text-[#800020] font-black text-base lg:text-lg">{{ item.subtotal }} Bs</span>
                     </div>
                  </div>
                </div>
             </div>
           </div>
         </div>

         <div class="p-4 lg:p-6 bg-gray-50 rounded-t-[30px] shadow-[0_-5px_30px_rgba(0,0,0,0.03)] border-t border-gray-100">
            <div class="flex justify-between items-center mb-3 lg:mb-4 pb-3 border-b border-gray-200">
                <span class="font-bold text-gray-800 text-sm lg:text-base">Total a Pagar</span>
                <span class="font-black text-2xl lg:text-3xl text-[#800020]">{{ total }} Bs</span>
            </div>

            <!-- Selector de Método de Pago -->
            <div class="grid grid-cols-2 gap-2 lg:gap-3 mb-3 lg:mb-4">
              <button (click)="metodoPagoSeleccionado = 'efectivo'" 
                      [class]="metodoPagoSeleccionado === 'efectivo' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-white border-gray-200'"
                      class="p-2.5 lg:p-3 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition text-xs lg:text-sm hover:scale-105">
                 <i class="fa-solid fa-money-bill"></i> Efectivo
              </button>
              <button (click)="metodoPagoSeleccionado = 'qr'" 
                      [class]="metodoPagoSeleccionado === 'qr' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-white border-gray-200'"
                      class="p-2.5 lg:p-3 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition text-xs lg:text-sm hover:scale-105">
                 <i class="fa-solid fa-qrcode"></i> QR
              </button>
            </div>

            <!-- Selector de Tipo de Orden -->
            <div class="grid grid-cols-2 gap-2 lg:gap-3 mb-3 lg:mb-4">
              <button (click)="tipoOrdenSeleccionado = 'para_llevar'" 
                      [class]="tipoOrdenSeleccionado === 'para_llevar' ? 'bg-orange-100 border-orange-500 text-orange-700' : 'bg-white border-gray-200'"
                      class="p-2.5 lg:p-3 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition text-xs lg:text-sm hover:scale-105">
                 <i class="fa-solid fa-bag-shopping"></i> Para Llevar
              </button>
              <button (click)="tipoOrdenSeleccionado = 'mesa'" 
                      [class]="tipoOrdenSeleccionado === 'mesa' ? 'bg-purple-100 border-purple-500 text-purple-700' : 'bg-white border-gray-200'"
                      class="p-2.5 lg:p-3 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition text-xs lg:text-sm hover:scale-105">
                 <i class="fa-solid fa-utensils"></i> Mesa
              </button>
            </div>

            <!-- Calculadora de Cambio (solo para efectivo) -->
            <div *ngIf="metodoPagoSeleccionado === 'efectivo'" class="mb-3 lg:mb-4 p-3 bg-white rounded-xl border-2 border-gray-200">
              <label class="block text-xs font-bold text-gray-600 mb-2">Monto Recibido</label>
              <input type="number" 
                     [(ngModel)]="montoRecibido"
                     placeholder="Ej: 100"
                     class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-lg font-bold text-center focus:border-green-500 focus:outline-none">
              
              <div *ngIf="montoRecibido > 0" class="mt-3 pt-3 border-t border-gray-200">
                <div class="flex justify-between items-center">
                  <span class="text-sm font-bold text-gray-600">Cambio:</span>
                  <span class="text-2xl font-black" 
                        [class.text-green-600]="cambio >= 0"
                        [class.text-red-600]="cambio < 0">
                    {{ cambio }} Bs
                  </span>
                </div>
                <p *ngIf="cambio < 0" class="text-xs text-red-500 mt-1 text-center">
                  ⚠️ Monto insuficiente
                </p>
              </div>
            </div>

            <button (click)="enviarPedido()" 
                    [disabled]="carrito.length === 0 || !mesaSeleccionada || cargando || !cajaAbierta"
                    class="w-full bg-[#800020] text-white py-3 lg:py-4 rounded-xl font-bold text-sm lg:text-base shadow-lg shadow-red-900/20 hover:bg-[#600018] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                
                <span *ngIf="cargando" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                
                <span *ngIf="!cargando">Cobrar & Enviar</span>
                <i *ngIf="!cargando" class="fa-solid fa-paper-plane"></i>
            </button>
         </div>
      </aside>

      <!-- Botón flotante del carrito (solo móvil) -->
      <button (click)="toggleCarrito()" 
              *ngIf="carrito.length > 0 && !carritoAbierto"
              class="lg:hidden fixed bottom-6 right-6 w-16 h-16 bg-[#800020] text-white rounded-full shadow-2xl flex items-center justify-center z-50 hover:scale-110 transition-all animate-pulse">
        <i class="fa-solid fa-shopping-cart text-xl"></i>
        <span class="absolute -top-2 -right-2 w-7 h-7 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg animate-bounce">{{ carrito.length }}</span>
      </button>

      <!-- Componente de Ticket para Impresión -->
      <app-ticket [ticketData]="ticketData"></app-ticket>

    </div>
  `,
  styles: [`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    @keyframes bounceIn {
      0% { transform: scale(0.8); opacity: 0; }
      60% { transform: scale(1.05); opacity: 1; }
      100% { transform: scale(1); }
    }
    .animate-bounce-in { animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55); }
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes scaleIn {
      0% { transform: scale(0.5); opacity: 0; }
      50% { transform: scale(1.1); opacity: 1; }
      100% { transform: scale(1); }
    }
    .animate-scale-in { animation: scaleIn 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55); }
  `]
})
export class CajaComponent implements OnInit {
  // Estado de Caja
  cajaAbierta: boolean = false;
  mostrarModalCierre: boolean = false;
  mostrarConfirmacion: boolean = false; // Estado para animación de confirmación
  ultimoPedidoId: number | null = null; // ID del último pedido enviado
  cargandoApertura: boolean = false; // Estado de carga para apertura de caja
  cargandoCierre: boolean = false; // Estado de carga para cierre de caja
  carritoAbierto: boolean = false; // Para controlar el carrito en móviles
  
  // Datos Formulario Caja
  usuarioActual: string = '';
  montoApertura: number = 0;
  montoCierre: number = 0;

  // Datos TPV
  busqueda: string = '';
  filtroCategoria: string = 'todos';
  mesaSeleccionada: string = '';
  cargando: boolean = false;
  cargandoProductos: boolean = true; // Estado de carga para productos
  metodoPagoSeleccionado: 'efectivo' | 'qr' = 'efectivo';
  tipoOrdenSeleccionado: 'para_llevar' | 'mesa' = 'mesa'; // Tipo de orden
  montoRecibido: number = 0; // Monto que da el cliente en efectivo
  
  // Variables para QR BNB
  mostrarModalQR = false;
  qrImageBase64: string | null = null;
  qrIdActual: number | null = null;
  estadoPago: 'esperando' | 'pagado' | 'error' = 'esperando';
  pollingInterval: any;
  
  // Producto personalizado
  productoPersonalizadoNombre: string = '';
  productoPersonalizadoPrecio: number = 0;
  productoPlantillaId: number | null = null; // ID dinámico recuperado de la BD
  
  productos: Producto[] = [];
  carrito: ItemPedido[] = [];
  ventasHoy: any[] = []; // Ventas del día actual
  totalVentasHoy: number = 0; // Total de ventas del día
  
  // Datos para el ticket de impresión
  ticketData: any = {
    fecha: '',
    hora: '',
    mesa: '',
    pedidoId: 0,
    usuario: '',
    items: [],
    total: 0,
    metodoPago: 'efectivo'
  };


  constructor(
    private pedidoService: PedidoService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    //private bnbService: BnbService
  ) {}

  toggleCarrito() {
    this.carritoAbierto = !this.carritoAbierto;
  }

  cerrarCarrito() {
    this.carritoAbierto = false;
  }

  ngOnInit() {
    // Recuperar nombre de usuario guardado
    const usuarioGuardado = localStorage.getItem('usuarioCaja');
    if (usuarioGuardado) {
      this.usuarioActual = usuarioGuardado;
    }
    
    // 1. Cargar productos
    this.pedidoService.productos$.subscribe(data => {
      this.productos = data;
      this.cargandoProductos = false; // Desactivar loading cuando los productos se cargan

      // Buscar PRODUCTO PERSONALIZADO automáticamente
      const productoCustom = this.productos.find(p => 
        p.nombre.toLowerCase().includes('personalizado') || 
        p.nombre.toLowerCase().includes('custom') ||
        p.categoria.toLowerCase() === 'personalizado'
      );

      if (productoCustom) {
        this.productoPlantillaId = productoCustom.id;
        console.log('✅ Producto plantilla encontrado:', productoCustom.nombre, 'ID:', productoCustom.id);
      } else {
        console.warn('⚠️ NO SE ENCONTRÓ UN PRODUCTO PLANTILLA "PERSONALIZADO"');
      }
    });

    // 2. Suscribirse al estado de la caja
    this.pedidoService.cajaAbierta$.subscribe(estado => {
      console.log('🔔 Cambio en cajaAbierta$:', estado);
      this.cajaAbierta = estado;
      
      // 3. Cargar ventas del día cuando la caja está abierta
      if (estado) {
        this.cargarVentasHoy();
      }
    });
  }

  async abrirCaja() {
    if (!this.usuarioActual || this.montoApertura <= 0) {
      alert('⚠️ Completa todos los campos.');
      return;
    }
    
    // Prevenir múltiples clics
    if (this.cargandoApertura) {
      return;
    }
    
    this.cargandoApertura = true;
    
    // Guardar nombre de usuario en localStorage
    localStorage.setItem('usuarioCaja', this.usuarioActual);

    try {
      const resultado = await this.pedidoService.abrirCaja(this.montoApertura, this.usuarioActual);
      
      if (resultado) {
        console.log('✅ Caja abierta exitosamente:', resultado);
        
        // FORZAR la actualización del estado para cerrar el modal inmediatamente
        this.cajaAbierta = true;
        
        // Forzar detección de cambios en Angular
        this.cdr.detectChanges();
        console.log('🔄 Detección de cambios forzada. cajaAbierta:', this.cajaAbierta);
        
        // Cargar ventas del día
        this.cargarVentasHoy();
      } else {
        alert('❌ No se pudo abrir la caja. Intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error al abrir caja:', error);
      alert('❌ Error al abrir la caja. Intenta de nuevo.');
    } finally {
      // Siempre resetear el estado de carga
      this.cargandoApertura = false;
    }
  }

  async cargarVentasHoy() {
    const ventas = await this.pedidoService.obtenerVentasPorFecha(new Date());
    this.ventasHoy = ventas;
    
    // Calcular total de ventas del día
    this.totalVentasHoy = ventas
      .filter(v => v.estado !== 'rechazado')
      .reduce((acc, v) => acc + (v.total || 0), 0);
  }

  irAHistorial() {
    this.router.navigate(['/historial']);
  }

  async confirmarCierre() {
    if (this.montoCierre < 0) {
      alert('⚠️ Por favor ingresa un monto válido.');
      return;
    }

    if(confirm('¿Estás seguro de cerrar el turno? Se generará el reporte.')) {
      this.cargandoCierre = true;
      
      try {
        const cierre = await this.pedidoService.cerrarCaja(this.montoCierre);
        
        if(cierre) {
          // Forzar actualización del estado
          this.cajaAbierta = false;
          this.mostrarModalCierre = false;
          this.montoCierre = 0;
          
          // Forzar detección de cambios
          this.cdr.detectChanges();
          
          alert(`🔒 CAJA CERRADA
------------------
Inicio: ${cierre.monto_inicial} Bs
Ventas Sistema: ${cierre.total_ventas} Bs
Final en Caja: ${cierre.monto_final} Bs
Diferencia: ${cierre.monto_final - cierre.monto_inicial - cierre.total_ventas} Bs`);
        } else {
          alert('❌ No se pudo cerrar la caja. Intenta de nuevo.');
        }
      } catch (error) {
        console.error('Error al cerrar caja:', error);
        alert('❌ Error al cerrar la caja.');
      } finally {
        this.cargandoCierre = false;
      }
    }
  }

  get productosFiltrados() {
    return this.productos.filter(p => {
      const matchCategoria = this.filtroCategoria === 'todos' || p.categoria === this.filtroCategoria;
      const matchBusqueda = p.nombre.toLowerCase().includes(this.busqueda.toLowerCase());
      return matchCategoria && matchBusqueda;
    });
  }

  get total() { 
    return this.carrito.reduce((acc, i) => acc + i.subtotal, 0); 
  }

  get cambio() {
    return this.montoRecibido - this.total;
  }

  async agregarProductoPersonalizado() {
    if (!this.productoPersonalizadoNombre || this.productoPersonalizadoPrecio <= 0) {
      alert('⚠️ Por favor completa el nombre y precio del producto.');
      return;
    }
    

    
    if (!this.productoPlantillaId) {
      alert('❌ Error Compuesto: No se encontró un producto "Personalizado" en la base de datos. Por favor crea uno en el menú para usar esta función.');
      return;
    }
    
    // Buscar el producto plantilla usando el ID dinámico
    const productoPlantilla = this.productos.find(p => p.id === this.productoPlantillaId);
    
    if (!productoPlantilla) {
      alert('❌ Error: El producto plantilla no está disponible en la lista actual.');
      return;
    }
    
    console.log('✅ Usando producto plantilla:', productoPlantilla);
    console.log('📝 Nombre personalizado:', this.productoPersonalizadoNombre);
    console.log('💰 Precio personalizado:', this.productoPersonalizadoPrecio);
    
    // Guardar valores antes de limpiar
    const nombrePersonalizado = this.productoPersonalizadoNombre;
    const precioPersonalizado = this.productoPersonalizadoPrecio;
    
    // Limpiar campos inmediatamente para mejor UX
    this.productoPersonalizadoNombre = '';
    this.productoPersonalizadoPrecio = 0;
    
    // Buscar si ya existe este producto personalizado en el carrito
    const itemExistente = this.carrito.find(
      i => i.producto.id === this.productoPlantillaId && 
           i.nombrePersonalizado === nombrePersonalizado &&
           i.precioPersonalizado === precioPersonalizado
    );
    
    if (itemExistente) {
      // Si ya existe, solo aumentar cantidad
      itemExistente.cantidad++;
      itemExistente.subtotal = itemExistente.cantidad * precioPersonalizado;
      console.log('✅ Cantidad aumentada para producto existente');
    } else {
      // Agregar nuevo item con valores personalizados
      this.carrito.push({
        producto: productoPlantilla,
        cantidad: 1,
        subtotal: precioPersonalizado,
        notas: '',
        nombrePersonalizado: nombrePersonalizado,
        precioPersonalizado: precioPersonalizado
      });
      console.log('✅ Producto personalizado agregado al carrito');
    }
  }

  agregarAlCarrito(p: Producto) {
    // No incrementar productos personalizados desde el botón + del carrito
    // porque cada uno tiene nombre/precio único
    const item = this.carrito.find(i => i.producto.id === p.id && !i.nombrePersonalizado);
    if(item) { 
        item.cantidad++; 
        const precioUnitario = item.precioPersonalizado || p.precio;
        item.subtotal = item.cantidad * precioUnitario; 
    } else { 
        this.carrito.push({producto: p, cantidad: 1, subtotal: p.precio, notas: ''}); 
    }
  }

  disminuirCantidad(i: number) {
    if(this.carrito[i].cantidad > 1) {
        this.carrito[i].cantidad--;
        const precioUnitario = this.carrito[i].precioPersonalizado || this.carrito[i].producto.precio;
        this.carrito[i].subtotal = this.carrito[i].cantidad * precioUnitario;
    } else {
        this.eliminarDelCarrito(i);
    }
  }

  eliminarDelCarrito(i: number) { 
    this.carrito.splice(i, 1); 
  }

  async enviarPedido() {
    if (!this.mesaSeleccionada || this.carrito.length === 0) return;

    // Si es EFECTIVO, validar monto recibido
    if (this.metodoPagoSeleccionado === 'efectivo') {
      if (this.montoRecibido < this.total) {
        alert('⚠️ El monto recibido es insuficiente. Por favor ingresa un monto mayor o igual al total.');
        return;
      }
    }
    
    // Procesar guardado directamente (tanto para efectivo como QR)
    // El método de pago se guardará automáticamente en la BD
    this.procesarGuardado();
    
    /* DESACTIVADO: Flujo completo de QR con BNB
    // Si es QR, iniciar flujo BNB
    else {
      this.iniciarPagoQR();
    }
    */
  }

  /* DESACTIVADO: Toda la integración con BNB QR
  async iniciarPagoQR() { ... }
  comenzarVerificacion() { ... }
  pagoConfirmado() { ... }
  pagoExpirado() { ... }
  */



  async procesarGuardado() {
    this.cargando = true;

    try {
      const resultado = await this.pedidoService.crearPedido(
        this.mesaSeleccionada, 
        this.total, 
        this.carrito,
        this.metodoPagoSeleccionado,
        this.tipoOrdenSeleccionado
      );

      if (resultado) {
        // Guardar ID del pedido
        this.ultimoPedidoId = resultado.id;
        
        // Preparar datos del ticket
        const ahora = new Date();
        this.ticketData = {
          fecha: ahora.toLocaleDateString('es-BO'),
          hora: ahora.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }),
          mesa: this.mesaSeleccionada,
          pedidoId: resultado.id,
          usuario: this.usuarioActual,
          items: this.carrito.map(item => ({
            cantidad: item.cantidad,
            nombre: item.nombrePersonalizado || item.producto.nombre,
            precioUnitario: item.precioPersonalizado || item.producto.precio,
            subtotal: item.subtotal,
            notas: item.notas || ''
          })),
          total: this.total,
          metodoPago: this.metodoPagoSeleccionado,
          tipoOrden: this.tipoOrdenSeleccionado
        };
        
        // IMPORTANTE: Resetear el estado de carga ANTES de mostrar la animación
        this.cargando = false;
        
        // Mostrar animación de confirmación
        this.mostrarConfirmacion = true;
        
        // Forzar detección de cambios para que la animación se muestre
        this.cdr.detectChanges();
        
        // Imprimir ticket después de un breve delay para que se renderice
        setTimeout(() => {
          this.imprimirTicket();
        }, 500);
        
        // Esperar 2.5 segundos y luego resetear para nueva orden
        setTimeout(() => {
          this.mostrarConfirmacion = false;
          this.carrito = [];
          this.mesaSeleccionada = '';
          this.ultimoPedidoId = null;
          this.montoRecibido = 0; // Resetear monto recibido
          this.limpiarQR(); // Limpiar datos QR
          
          // Forzar detección de cambios después de resetear
          this.cdr.detectChanges();
        }, 2500);
        
        // Recargar ventas del día para actualizar el total
        await this.cargarVentasHoy();
      } else {
        this.cargando = false;
        alert('❌ Hubo un error al guardar el pedido.');
      }
    } catch (error) {
      console.error(error);
      this.cargando = false;
      alert('❌ Error de conexión.');
    }
  }


  cancelarQR() {
    clearInterval(this.pollingInterval);
    this.mostrarModalQR = false;
    this.limpiarQR();
  }

  limpiarQR() {
    this.qrImageBase64 = null;
    this.qrIdActual = null;
    this.estadoPago = 'esperando';
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }
  
  imprimirTicket() {
    // Usar la API de impresión del navegador
    window.print();
  }
}