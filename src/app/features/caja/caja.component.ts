import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PedidoService, Producto } from '../../services/pedido.service';
import { TicketComponent } from '../ticket/ticket';


// Interface local para ItemPedido
export interface ItemPedido {
  producto: Producto;
  cantidad: number;
  subtotal: number;
  notas?: string;
}

@Component({
  selector: 'app-caja',
  standalone: true,
  imports: [CommonModule, FormsModule, TicketComponent],
  template: `
    <div class="bg-gray-50 h-screen w-full flex font-sans text-gray-700 overflow-hidden relative">
      
      <!-- Modal de Apertura de Caja -->
      <div *ngIf="!cajaAbierta" class="absolute inset-0 z-50 bg-[#800020]/90 backdrop-blur-sm flex items-center justify-center">
        <div class="bg-white p-8 rounded-[40px] shadow-2xl w-96 text-center animate-bounce-in">
          <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i class="fa-solid fa-shop-lock text-4xl text-[#800020]"></i>
          </div>
          <h2 class="text-2xl font-black text-gray-800 mb-2">Caja Cerrada</h2>
          <p class="text-gray-500 mb-6">Ingresa el monto inicial para comenzar a vender.</p>

          <div class="text-left mb-6">
            <label class="text-xs font-bold text-gray-400 uppercase ml-2">Usuario</label>
            <input [(ngModel)]="usuarioActual" type="text" class="w-full bg-gray-100 rounded-xl px-4 py-3 font-bold mb-3 border border-transparent focus:border-[#800020] outline-none">
            
            <label class="text-xs font-bold text-gray-400 uppercase ml-2">Monto Inicial (Base)</label>
            <div class="relative">
              <span class="absolute left-4 top-3 text-gray-400 font-bold">Bs</span>
              <input [(ngModel)]="montoApertura" type="number" class="w-full bg-gray-100 rounded-xl pl-10 pr-4 py-3 font-bold text-xl text-[#800020] border border-transparent focus:border-[#800020] outline-none">
            </div>
          </div>

          <button (click)="abrirCaja()" 
                  [disabled]="cargandoApertura"
                  class="w-full bg-[#800020] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-[#600018] transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2">
            <span *ngIf="cargandoApertura" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
            <span *ngIf="!cargandoApertura">Abrir Turno</span>
            <span *ngIf="cargandoApertura">Abriendo...</span>
          </button>
        </div>
      </div>

      <!-- Modal de Cierre de Caja -->
      <div *ngIf="mostrarModalCierre" class="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
        <div class="bg-white p-8 rounded-[40px] shadow-2xl w-96 text-center animate-fade-in">
           <h2 class="text-2xl font-black text-gray-800 mb-2">Cerrar Caja</h2>
           <p class="text-gray-500 mb-6">Cuenta el dinero físico antes de cerrar.</p>
           
           <div class="text-left mb-6">
            <label class="text-xs font-bold text-gray-400 uppercase ml-2">Dinero en Efectivo (Contado)</label>
            <div class="relative">
              <span class="absolute left-4 top-3 text-gray-400 font-bold">Bs</span>
              <input [(ngModel)]="montoCierre" type="number" class="w-full bg-gray-100 rounded-xl pl-10 pr-4 py-3 font-bold text-xl text-[#800020] border border-transparent focus:border-[#800020] outline-none">
            </div>
           </div>

           <div class="flex gap-3">
             <button (click)="mostrarModalCierre = false" 
                     [disabled]="cargandoCierre"
                     class="flex-1 bg-gray-200 text-gray-600 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed">
               Cancelar
             </button>
             <button (click)="confirmarCierre()" 
                     [disabled]="cargandoCierre"
                     class="flex-1 bg-[#800020] text-white py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
               <span *ngIf="cargandoCierre" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
               <span *ngIf="!cargandoCierre">Cerrar Turno</span>
               <span *ngIf="cargandoCierre">Cerrando...</span>
             </button>
           </div>
        </div>
      </div>

      <!-- Contenido Principal -->
      <div class="flex-1 flex flex-col h-full relative overflow-hidden transition-all duration-500" [class.blur-sm]="!cajaAbierta">
        
        <div class="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#800020]/5 to-transparent -z-10"></div>

        <div class="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
          <header class="flex justify-between items-center mb-6">
            <div>
               <h1 class="text-2xl font-bold text-gray-800">Menú <span class="text-[#800020]">Kjaras</span></h1>
               <div class="flex items-center gap-2">
                 <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                 <p class="text-green-600 text-xs font-bold uppercase tracking-wider">Caja Abierta: {{ usuarioActual }}</p>
               </div>
            </div>
            
            <!-- Total de Ventas del Día -->
            <div class="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
              <p class="text-xs text-gray-400 font-bold uppercase">Ventas Hoy</p>
              <p class="text-xl font-black text-green-600">{{ totalVentasHoy }} Bs</p>
              <p class="text-xs text-gray-500">{{ ventasHoy.length }} pedidos</p>
            </div>
            
            <div class="flex gap-2">
              <button (click)="irAHistorial()" 
                      class="bg-white text-gray-500 px-4 py-2 rounded-xl border border-gray-200 shadow-sm hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition font-bold text-sm flex items-center gap-2">
                 <i class="fa-solid fa-clock-rotate-left"></i> Historial
              </button>
              
              <button (click)="mostrarModalCierre = true" 
                      class="bg-white text-gray-500 px-4 py-2 rounded-xl border border-gray-200 shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition font-bold text-sm flex items-center gap-2">
                 <i class="fa-solid fa-store-slash"></i> Cerrar Caja
              </button>
            </div>
          </header>

          <div class="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            <button (click)="filtroCategoria = 'todos'" 
                    [class]="filtroCategoria === 'todos' ? 'bg-[#800020] text-white' : 'bg-white text-gray-500'"
                    class="px-5 py-2.5 rounded-xl font-bold transition">🔥 Todo</button>
            <button (click)="filtroCategoria = 'plato'" 
                    [class]="filtroCategoria === 'plato' ? 'bg-[#800020] text-white' : 'bg-white text-gray-500'"
                    class="px-5 py-2.5 rounded-xl font-bold transition">🥘 Platos</button>
            <button (click)="filtroCategoria = 'bebida'" 
                    [class]="filtroCategoria === 'bebida' ? 'bg-[#800020] text-white' : 'bg-white text-gray-500'"
                    class="px-5 py-2.5 rounded-xl font-bold transition">🥤 Bebidas</button>
            <button (click)="filtroCategoria = 'guarnicion'" 
                    [class]="filtroCategoria === 'guarnicion' ? 'bg-[#800020] text-white' : 'bg-white text-gray-500'"
                    class="px-5 py-2.5 rounded-xl font-bold transition">🍟 Guarniciones</button>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pb-20">
             <div *ngFor="let p of productosFiltrados" (click)="agregarAlCarrito(p)" class="bg-white p-3 rounded-[30px] shadow-sm hover:shadow-xl cursor-pointer group flex flex-col h-full transition">
                 <div class="h-40 rounded-[20px] overflow-hidden relative mb-3">
                    <img [src]="p.imagen" class="w-full h-full object-cover">
                    <div class="absolute bottom-2 right-2 bg-white/95 px-3 py-1.5 rounded-lg shadow-md">
                       <span class="text-[#800020] font-bold">{{ p.precio }} Bs</span>
                    </div>
                 </div>
                 <h3 class="font-bold text-gray-800 mb-1 leading-tight">{{ p.nombre }}</h3>
             </div>
          </div>

        </div>
      </div>

      <!-- Sidebar del Carrito -->
      <aside class="w-[400px] bg-white h-full shadow-2xl z-20 flex flex-col border-l border-gray-100 relative flex-shrink-0" [class.blur-sm]="!cajaAbierta">
         
         <!-- Overlay de Confirmación -->
         <div *ngIf="mostrarConfirmacion" class="absolute inset-0 z-50 bg-green-500/95 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in">
           <div class="text-center animate-scale-in">
             <div class="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
               <i class="fa-solid fa-check text-5xl text-green-500"></i>
             </div>
             <h3 class="text-3xl font-black text-white mb-2">¡Pedido Enviado!</h3>
             <p class="text-white/90 text-lg font-bold">ID: #{{ ultimoPedidoId }}</p>
             <p class="text-white/70 text-sm mt-2">Preparando nueva orden...</p>
           </div>
         </div>
         
         <div class="p-6 pb-2">
            <h2 class="text-xl font-bold text-gray-800 mb-4">Orden Actual</h2>
            
            <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 focus-within:border-[#800020] transition">
               <label class="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                  <i class="fa-solid fa-utensils"></i> Mesa / Cliente
               </label>
               <input [(ngModel)]="mesaSeleccionada" type="text" placeholder="Ej: Mesa 4" class="w-full bg-transparent outline-none text-lg font-bold text-[#800020]">
            </div>
         </div>

         <div class="flex-1 overflow-y-auto px-6 space-y-3 scrollbar-hide py-2">
           <div *ngFor="let item of carrito; let i = index" class="group flex gap-3 items-start bg-white rounded-xl">
              <img [src]="item.producto.imagen" class="w-14 h-14 rounded-xl object-cover border border-gray-100">
              <div class="flex-1">
                 <div class="flex justify-between">
                    <h4 class="font-bold text-gray-800 text-sm">{{ item.producto.nombre }}</h4>
                    <button (click)="eliminarDelCarrito(i)" class="text-gray-300 hover:text-red-500">x</button>
                 </div>
                 <input [(ngModel)]="item.notas" placeholder="Nota cocina (ej: sin picante)" class="w-full text-xs border-b border-gray-100 focus:border-[#800020] outline-none mt-1 text-gray-500 italic">
                 
                 <div class="flex justify-between items-center mt-2">
                     <div class="flex items-center bg-gray-50 rounded-lg p-0.5">
                        <button (click)="disminuirCantidad(i)" class="w-6 h-6 font-bold">-</button>
                        <span class="w-6 text-center font-bold text-xs">{{ item.cantidad }}</span>
                        <button (click)="agregarAlCarrito(item.producto)" class="w-6 h-6 font-bold">+</button>
                     </div>
                     <span class="text-[#800020] font-bold text-sm">{{ item.subtotal }} Bs</span>
                 </div>
              </div>
           </div>
         </div>

         <div class="p-6 bg-gray-50 rounded-t-[30px] shadow-[0_-5px_30px_rgba(0,0,0,0.03)]">
            <div class="flex justify-between items-center mb-4">
                <span class="font-bold text-gray-800 text-base">Total a Pagar</span>
                <span class="font-black text-2xl text-[#800020]">{{ total }} Bs</span>
            </div>

            <!-- Selector de Método de Pago -->
            <div class="grid grid-cols-2 gap-3 mb-4">
              <button (click)="metodoPagoSeleccionado = 'efectivo'" 
                      [class]="metodoPagoSeleccionado === 'efectivo' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-gray-50 border-transparent'"
                      class="p-3 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition">
                 <i class="fa-solid fa-money-bill"></i> Efectivo
              </button>
              <button (click)="metodoPagoSeleccionado = 'qr'" 
                      [class]="metodoPagoSeleccionado === 'qr' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-gray-50 border-transparent'"
                      class="p-3 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition">
                 <i class="fa-solid fa-qrcode"></i> QR
              </button>
            </div>

            <button (click)="enviarPedido()" 
                    [disabled]="carrito.length === 0 || !mesaSeleccionada || cargando || !cajaAbierta"
                    class="w-full bg-[#800020] text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-red-900/20 hover:bg-[#600018] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                
                <span *ngIf="cargando" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                
                <span *ngIf="!cargando">Cobrar & Enviar a Cocina</span>
                <i *ngIf="!cargando" class="fa-solid fa-paper-plane"></i>
            </button>
         </div>
      </aside>

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
  
  // Datos Formulario Caja
  usuarioActual: string = 'Juan Perez';
  montoApertura: number = 200;
  montoCierre: number = 0;

  // Datos TPV
  busqueda: string = '';
  filtroCategoria: string = 'todos';
  mesaSeleccionada: string = '';
  cargando: boolean = false;
  metodoPagoSeleccionado: 'efectivo' | 'qr' = 'efectivo';
  
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
    private router: Router
  ) {}

  ngOnInit() {
    // 1. Cargar productos
    this.pedidoService.productos$.subscribe(data => {
      this.productos = data;
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
    if (this.montoApertura < 0 || !this.usuarioActual) {
      alert('⚠️ Por favor ingresa un monto válido y tu nombre.');
      return;
    }
    
    // Prevenir múltiples clics
    if (this.cargandoApertura) {
      return;
    }
    
    this.cargandoApertura = true;
    
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

  agregarAlCarrito(p: Producto) {
    const item = this.carrito.find(i => i.producto.id === p.id);
    if(item) { 
        item.cantidad++; 
        item.subtotal = item.cantidad * p.precio; 
    } else { 
        this.carrito.push({producto: p, cantidad: 1, subtotal: p.precio, notas: ''}); 
    }
  }

  disminuirCantidad(i: number) {
    if(this.carrito[i].cantidad > 1) {
        this.carrito[i].cantidad--;
        this.carrito[i].subtotal = this.carrito[i].cantidad * this.carrito[i].producto.precio;
    } else {
        this.eliminarDelCarrito(i);
    }
  }

  eliminarDelCarrito(i: number) { 
    this.carrito.splice(i, 1); 
  }

  async enviarPedido() {
    if (!this.mesaSeleccionada || this.carrito.length === 0) return;

    this.cargando = true;

    try {
      const resultado = await this.pedidoService.crearPedido(
        this.mesaSeleccionada, 
        this.total, 
        this.carrito,
        this.metodoPagoSeleccionado
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
            nombre: item.producto.nombre,
            subtotal: item.subtotal,
            notas: item.notas || ''
          })),
          total: this.total,
          metodoPago: this.metodoPagoSeleccionado
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
  
  imprimirTicket() {
    // Usar la API de impresión del navegador
    window.print();
  }
}