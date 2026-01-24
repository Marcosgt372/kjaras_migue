import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PedidoService } from '../../services/pedido.service';
import { TicketComponent } from '../ticket/ticket';


@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, FormsModule, TicketComponent],
  template: `
    <div class="p-8 bg-gray-50 min-h-screen">
      
      <!-- Header con Estadísticas -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">Historial de Pedidos</h1>
            <p class="text-gray-500">Todos los pedidos registrados</p>
          </div>
          
          <div class="flex gap-3">
            <button (click)="actualizarDatos()" 
                    [disabled]="cargando"
                    class="bg-blue-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              <i class="fa-solid fa-rotate" [class.animate-spin]="cargando"></i>
              {{ cargando ? 'Actualizando...' : 'Actualizar' }}
            </button>
            
            <button (click)="volverACaja()" 
                    class="bg-white text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition border border-gray-200">
              <i class="fa-solid fa-arrow-left mr-2"></i>
              Volver a Caja
            </button>
            
            <button (click)="realizarCierre()" 
                    class="bg-gray-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-black transition">
              <i class="fa-solid fa-store-slash mr-2"></i>
              Cerrar Caja
            </button>
          </div>
        </div>

        <!-- Tarjetas de Estadísticas -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <p class="text-xs uppercase text-gray-400 font-bold mb-1">Total Pedidos</p>
            <p class="text-3xl font-black text-gray-800">{{ pedidosFiltrados.length }}</p>
          </div>
          
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <p class="text-xs uppercase text-gray-400 font-bold mb-1">Total Ventas</p>
            <p class="text-3xl font-black text-green-600">{{ totalVentas }} Bs</p>
          </div>
          
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <p class="text-xs uppercase text-gray-400 font-bold mb-1">Promedio</p>
            <p class="text-3xl font-black text-blue-600">{{ promedioPorPedido }} Bs</p>
          </div>
          
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <p class="text-xs uppercase text-gray-400 font-bold mb-1">Efectivo / QR</p>
            <p class="text-3xl font-black text-purple-600">{{ totalEfectivo }} / {{ totalQR }} Bs</p>
          </div>
        </div>

        <!-- Filtros -->
        <div class="bg-white p-4 rounded-xl shadow-sm">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Filtro por Período -->
            <div>
              <label class="text-xs font-bold text-gray-400 uppercase mb-2 block">Período</label>
              <select [(ngModel)]="filtroPeriodo" (change)="aplicarFiltros()" 
                      class="w-full bg-gray-50 rounded-lg px-4 py-2 font-bold border border-gray-200 focus:border-[#800020] outline-none">
                <option value="todo">Todo</option>
                <option value="hoy">Hoy</option>
                <option value="semana">Última Semana</option>
                <option value="mes">Último Mes</option>
              </select>
            </div>

            <!-- Filtro por Estado -->
            <div>
              <label class="text-xs font-bold text-gray-400 uppercase mb-2 block">Estado</label>
              <select [(ngModel)]="filtroEstado" (change)="aplicarFiltros()" 
                      class="w-full bg-gray-50 rounded-lg px-4 py-2 font-bold border border-gray-200 focus:border-[#800020] outline-none">
                <option value="todos">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="cocinando">Cocinando</option>
                <option value="listo">Listo</option>
                <option value="entregado">Entregado</option>
                <option value="rechazado">Rechazado</option>
              </select>
            </div>

            <!-- Filtro por Método de Pago -->
            <div>
              <label class="text-xs font-bold text-gray-400 uppercase mb-2 block">Método de Pago</label>
              <select [(ngModel)]="filtroMetodoPago" (change)="aplicarFiltros()" 
                      class="w-full bg-gray-50 rounded-lg px-4 py-2 font-bold border border-gray-200 focus:border-[#800020] outline-none">
                <option value="todos">Todos</option>
                <option value="efectivo">Efectivo</option>
                <option value="qr">QR</option>
              </select>
            </div>

            <!-- Búsqueda por Mesa -->
            <div>
              <label class="text-xs font-bold text-gray-400 uppercase mb-2 block">Buscar Mesa</label>
              <input [(ngModel)]="busquedaMesa" (input)="aplicarFiltros()" 
                     type="text" 
                     placeholder="Ej: Mesa 5"
                     class="w-full bg-gray-50 rounded-lg px-4 py-2 font-bold border border-gray-200 focus:border-[#800020] outline-none">
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de Pedidos -->
      <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table class="w-full text-left">
          <thead class="bg-gray-100 text-gray-500 uppercase text-xs">
            <tr>
              <th class="p-4">ID</th>
              <th class="p-4">Fecha y Hora</th>
              <th class="p-4">Mesa / Cliente</th>
              <th class="p-4">Detalle</th>
              <th class="p-4">Método</th>
              <th class="p-4">Estado</th>
              <th class="p-4 text-right">Monto</th>
              <th class="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr *ngFor="let pedido of pedidosFiltrados" class="hover:bg-gray-50 transition">
              <td class="p-4 font-mono text-sm text-gray-500">#{{ pedido.id }}</td>
              <td class="p-4 text-sm">
                <div class="font-bold text-gray-800">{{ pedido.created_at | date:'dd/MM/yyyy' }}</div>
                <div class="text-gray-500 text-xs">{{ pedido.created_at | date:'HH:mm' }}</div>
              </td>
              <td class="p-4 font-bold text-gray-800">{{ pedido.mesa }}</td>
              <td class="p-4 text-sm text-gray-600">
                <div *ngFor="let detalle of pedido.detalle_pedidos" class="mb-1">
                  <span class="font-bold">{{ detalle.cantidad }}x</span> {{ detalle.productos?.nombre }}
                  <span *ngIf="detalle.notas" class="text-xs italic text-gray-400">({{ detalle.notas }})</span>
                </div>
              </td>
              <td class="p-4">
                <span class="px-3 py-1 rounded-full text-xs font-bold uppercase"
                      [ngClass]="{
                        'bg-green-100 text-green-700': pedido.metodo_pago === 'efectivo',
                        'bg-blue-100 text-blue-700': pedido.metodo_pago === 'qr'
                      }">
                  <i class="fa-solid" [ngClass]="{
                    'fa-money-bill': pedido.metodo_pago === 'efectivo',
                    'fa-qrcode': pedido.metodo_pago === 'qr'
                  }"></i>
                  {{ pedido.metodo_pago }}
                </span>
              </td>
              <td class="p-4">
                <span class="px-3 py-1 rounded-full text-xs font-bold uppercase"
                      [ngClass]="{
                        'bg-yellow-100 text-yellow-700': pedido.estado === 'pendiente',
                        'bg-orange-100 text-orange-700': pedido.estado === 'cocinando',
                        'bg-green-100 text-green-700': pedido.estado === 'listo',
                        'bg-blue-100 text-blue-700': pedido.estado === 'entregado',
                        'bg-red-100 text-red-700': pedido.estado === 'rechazado'
                      }">
                  {{ pedido.estado }}
                </span>
              </td>
              <td class="p-4 text-right font-bold text-lg text-gray-800">{{ pedido.total }} Bs</td>
              <td class="p-4 text-center">
                <button (click)="abrirModalEdicion(pedido)" 
                        class="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600 transition text-sm">
                  <i class="fa-solid fa-edit mr-1"></i> Detalle
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div *ngIf="pedidosFiltrados.length === 0" class="p-10 text-center text-gray-400">
          <i class="fa-solid fa-inbox text-4xl mb-4"></i>
          <p class="font-bold">No hay pedidos que coincidan con los filtros.</p>
        </div>
      </div>

      <!-- Modal de Edición de Pedido -->
      <div *ngIf="mostrarModalEdicion" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
        <div class="bg-white rounded-[40px] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
          
          <!-- Header -->
          <div class="bg-[#800020] p-6 text-white relative">
            <button (click)="cerrarModalEdicion()" 
                    class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center">
              <i class="fa-solid fa-times text-xl"></i>
            </button>
            <h3 class="text-2xl font-bold">Editar Pedido #{{ pedidoEditando?.id }}</h3>
            <p class="opacity-80 text-sm">Modifica los detalles del pedido</p>
          </div>

          <!-- Content -->
          <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            
            <!-- Información del Pedido -->
            <div class="grid grid-cols-3 gap-4 mb-6">
              <div>
                <label class="text-xs font-bold text-gray-400 uppercase mb-2 block">Mesa / Cliente</label>
                <input [(ngModel)]="pedidoEditando.mesa" 
                       type="text" 
                       class="w-full bg-gray-50 rounded-lg px-4 py-2 font-bold border border-gray-200 focus:border-[#800020] outline-none">
              </div>
              
              <div>
                <label class="text-xs font-bold text-gray-400 uppercase mb-2 block">Estado</label>
                <select [(ngModel)]="pedidoEditando.estado" 
                        class="w-full bg-gray-50 rounded-lg px-4 py-2 font-bold border border-gray-200 focus:border-[#800020] outline-none">
                  <option value="pendiente">Pendiente</option>
                  <option value="cocinando">Cocinando</option>
                  <option value="listo">Listo</option>
                  <option value="entregado">Entregado</option>
                  <option value="rechazado">Rechazado</option>
                </select>
              </div>
              
              <div>
                <label class="text-xs font-bold text-gray-400 uppercase mb-2 block">Método de Pago</label>
                <select [(ngModel)]="pedidoEditando.metodo_pago" 
                        class="w-full bg-gray-50 rounded-lg px-4 py-2 font-bold border border-gray-200 focus:border-[#800020] outline-none">
                  <option value="efectivo">Efectivo</option>
                  <option value="qr">QR</option>
                </select>
              </div>
            </div>

            <!-- Items del Pedido -->
            <div class="mb-6">
              <div class="flex justify-between items-center mb-3">
                <h4 class="text-lg font-bold text-gray-800">Items del Pedido</h4>
                <button (click)="agregarItem()" 
                        class="bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600 transition text-sm">
                  <i class="fa-solid fa-plus mr-1"></i> Agregar Item
                </button>
              </div>

              <div class="space-y-3">
                <div *ngFor="let item of itemsEditados; let i = index" 
                     class="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div class="grid grid-cols-12 gap-3 items-center">
                    
                    <!-- Nombre -->
                    <div class="col-span-4">
                      <label class="text-xs font-bold text-gray-400 uppercase mb-1 block">Nombre</label>
                      <input [(ngModel)]="item.nombre" 
                             type="text" 
                             class="w-full bg-white rounded-lg px-3 py-2 text-sm border border-gray-200 focus:border-[#800020] outline-none">
                    </div>
                    
                    <!-- Cantidad -->
                    <div class="col-span-2">
                      <label class="text-xs font-bold text-gray-400 uppercase mb-1 block">Cant.</label>
                      <input [(ngModel)]="item.cantidad" 
                             (input)="actualizarSubtotal(i)"
                             type="number" 
                             min="1"
                             class="w-full bg-white rounded-lg px-3 py-2 text-sm border border-gray-200 focus:border-[#800020] outline-none">
                    </div>
                    
                    <!-- Precio Unitario -->
                    <div class="col-span-2">
                      <label class="text-xs font-bold text-gray-400 uppercase mb-1 block">Precio</label>
                      <input [(ngModel)]="item.precio_unitario" 
                             (input)="actualizarSubtotal(i)"
                             type="number" 
                             min="0"
                             step="0.01"
                             class="w-full bg-white rounded-lg px-3 py-2 text-sm border border-gray-200 focus:border-[#800020] outline-none">
                    </div>
                    
                    <!-- Subtotal -->
                    <div class="col-span-2">
                      <label class="text-xs font-bold text-gray-400 uppercase mb-1 block">Subtotal</label>
                      <div class="bg-gray-100 rounded-lg px-3 py-2 text-sm font-bold text-gray-800">
                        {{ item.subtotal }} Bs
                      </div>
                    </div>
                    
                    <!-- Notas -->
                    <div class="col-span-1">
                      <label class="text-xs font-bold text-gray-400 uppercase mb-1 block">Notas</label>
                      <input [(ngModel)]="item.notas" 
                             type="text" 
                             placeholder="..."
                             class="w-full bg-white rounded-lg px-3 py-2 text-sm border border-gray-200 focus:border-[#800020] outline-none">
                    </div>
                    
                    <!-- Eliminar -->
                    <div class="col-span-1 flex items-end">
                      <button (click)="eliminarItem(i)" 
                              class="w-full bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-100 transition">
                        <i class="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Total -->
            <div class="bg-[#800020]/10 p-4 rounded-xl">
              <div class="flex justify-between items-center">
                <span class="text-lg font-bold text-gray-800">Total del Pedido:</span>
                <span class="text-3xl font-black text-[#800020]">{{ totalEditado }} Bs</span>
              </div>
            </div>

          </div>

          <!-- Footer -->
          <div class="p-6 bg-gray-50 flex gap-3">
            <button (click)="cerrarModalEdicion()" 
                    class="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition">
              Cancelar
            </button>
            <button (click)="reimprimirTicket()" 
                    class="flex-1 bg-blue-500 text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition">
              <i class="fa-solid fa-print mr-2"></i> Reimprimir
            </button>
            <button (click)="guardarCambios()" 
                    class="flex-1 bg-[#800020] text-white py-3 rounded-xl font-bold hover:bg-[#600018] transition">
              <i class="fa-solid fa-save mr-2"></i> Guardar Cambios
            </button>
          </div>

        </div>
      </div>

      <!-- Componente de Ticket para Impresión -->
      <app-ticket [ticketData]="ticketData"></app-ticket>

    </div>
  `,
  styles: [`
    select, input {
      transition: all 0.2s;
    }
    select:focus, input:focus {
      transform: scale(1.02);
    }
  `]
})
export class HistorialComponent implements OnInit {
  todosPedidos: any[] = [];
  pedidosFiltrados: any[] = [];
  
  // Filtros
  filtroPeriodo: string = 'todo';
  filtroEstado: string = 'todos';
  filtroMetodoPago: string = 'todos';
  busquedaMesa: string = '';
  
  // Estado de carga
  cargando: boolean = false;
  
  // Estadísticas
  totalVentas: number = 0;
  promedioPorPedido: number = 0;
  totalEfectivo: number = 0;
  totalQR: number = 0;
  
  // Modal de edición
  mostrarModalEdicion = false;
  pedidoEditando: any = null;
  itemsEditados: any[] = [];
  totalEditado: number = 0;
  
  // Datos para el ticket de impresión
  ticketData: any = {
    fecha: '',
    hora: '',
    mesa: '',
    pedidoId: 0,
    usuario: '',
    items: [],
    total: 0,
    metodoPago: 'efectivo',
    tipoOrden: 'mesa'
  };

  constructor(
    private pedidoService: PedidoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  async cargarDatos() {
    this.todosPedidos = await this.pedidoService.obtenerTodosPedidos();
    console.log('📊 Pedidos cargados:', this.todosPedidos);
    console.log('📦 Primer pedido detalles:', this.todosPedidos[0]?.detalle_pedidos);
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    let pedidos = [...this.todosPedidos];
    
    // Filtro por período
    if (this.filtroPeriodo !== 'todo') {
      const ahora = new Date();
      let fechaLimite: Date;
      
      switch (this.filtroPeriodo) {
        case 'hoy':
          fechaLimite = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
          break;
        case 'semana':
          fechaLimite = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'mes':
          fechaLimite = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          fechaLimite = new Date(0);
      }
      
      pedidos = pedidos.filter(p => new Date(p.created_at) >= fechaLimite);
    }
    
    // Filtro por estado
    if (this.filtroEstado !== 'todos') {
      pedidos = pedidos.filter(p => p.estado === this.filtroEstado);
    }
    
    // Filtro por método de pago
    if (this.filtroMetodoPago !== 'todos') {
      pedidos = pedidos.filter(p => p.metodo_pago === this.filtroMetodoPago);
    }
    
    // Búsqueda por mesa
    if (this.busquedaMesa.trim()) {
      pedidos = pedidos.filter(p => 
        p.mesa.toLowerCase().includes(this.busquedaMesa.toLowerCase())
      );
    }
    
    this.pedidosFiltrados = pedidos;
    this.calcularEstadisticas();
  }

  calcularEstadisticas() {
    // Total de ventas (excluyendo rechazados)
    const pedidosValidos = this.pedidosFiltrados.filter(p => p.estado !== 'rechazado');
    this.totalVentas = pedidosValidos.reduce((acc, p) => acc + (p.total || 0), 0);
    
    // Promedio por pedido
    this.promedioPorPedido = pedidosValidos.length > 0 
      ? Math.round(this.totalVentas / pedidosValidos.length) 
      : 0;
    
    // Total por método de pago
    this.totalEfectivo = pedidosValidos
      .filter(p => p.metodo_pago === 'efectivo')
      .reduce((acc, p) => acc + (p.total || 0), 0);
    
    this.totalQR = pedidosValidos
      .filter(p => p.metodo_pago === 'qr')
      .reduce((acc, p) => acc + (p.total || 0), 0);
  }

  actualizarDatos() {
    if (this.cargando) return;
    
    this.cargando = true;
    
    // Llamar al servicio sin esperar
    this.cargarDatos().catch(err => {
      console.error('Error al actualizar datos:', err);
    });
    
    // Resetear después de 300ms
    setTimeout(() => {
      this.cargando = false;
    }, 300);
  }

  volverACaja() {
    this.router.navigate(['/caja']);
  }
  
  // Métodos del modal de edición
  abrirModalEdicion(pedido: any) {
    this.pedidoEditando = { ...pedido };
    this.itemsEditados = pedido.detalle_pedidos.map((d: any) => ({
      id: d.id,
      producto_id: d.producto_id,
      nombre: d.productos?.nombre || 'Producto',
      cantidad: d.cantidad,
      precio_unitario: d.precio_unitario,
      subtotal: d.cantidad * d.precio_unitario,
      notas: d.notas || ''
    }));
    this.calcularTotalEditado();
    this.mostrarModalEdicion = true;
  }
  
  cerrarModalEdicion() {
    this.mostrarModalEdicion = false;
    this.pedidoEditando = null;
    this.itemsEditados = [];
    this.totalEditado = 0;
  }
  
  agregarItem() {
    this.itemsEditados.push({
      id: null,
      producto_id: null,
      nombre: 'Nuevo Item',
      cantidad: 1,
      precio_unitario: 0,
      subtotal: 0,
      notas: ''
    });
  }
  
  eliminarItem(index: number) {
    this.itemsEditados.splice(index, 1);
    this.calcularTotalEditado();
  }
  
  actualizarSubtotal(index: number) {
    const item = this.itemsEditados[index];
    item.subtotal = item.cantidad * item.precio_unitario;
    this.calcularTotalEditado();
  }
  
  calcularTotalEditado() {
    this.totalEditado = this.itemsEditados.reduce((sum, item) => sum + item.subtotal, 0);
  }
  
  async guardarCambios() {
    if (!this.pedidoEditando) return;
    
    try {
      // Actualizar pedido con los nuevos datos
      await this.pedidoService.actualizarPedido(
        this.pedidoEditando.id,
        {
          mesa: this.pedidoEditando.mesa,
          estado: this.pedidoEditando.estado,
          metodo_pago: this.pedidoEditando.metodo_pago,
          total: this.totalEditado,
          items: this.itemsEditados
        }
      );
      
      // Recargar datos desde la base de datos para garantizar consistencia
      await this.cargarDatos();
      
      alert('✅ Pedido actualizado correctamente');
      this.cerrarModalEdicion();
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      alert('❌ Error al actualizar el pedido');
    }
  }

  async realizarCierre() {
    const monto = prompt("Ingresa el monto final en efectivo contado:");
    if (monto) {
      await this.pedidoService.cerrarCaja(parseFloat(monto));
      alert("Caja cerrada correctamente.");
      // Recargar datos
      this.cargarDatos();
    }
  }
  
  reimprimirTicket() {
    if (!this.pedidoEditando) return;
    
    // Preparar datos del ticket desde el pedido actual
    const fechaPedido = new Date(this.pedidoEditando.created_at);
    this.ticketData = {
      fecha: fechaPedido.toLocaleDateString('es-BO'),
      hora: fechaPedido.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }),
      mesa: this.pedidoEditando.mesa,
      pedidoId: this.pedidoEditando.id,
      usuario: 'Sistema', // No tenemos el usuario original guardado
      items: this.itemsEditados.map(item => ({
        cantidad: item.cantidad,
        nombre: item.nombre,
        precioUnitario: item.precio_unitario,
        subtotal: item.subtotal,
        notas: item.notas || ''
      })),
      total: this.totalEditado,
      metodoPago: this.pedidoEditando.metodo_pago || 'efectivo',
      tipoOrden: this.pedidoEditando.opcion || 'mesa'
    };
    
    // Esperar un momento para que Angular actualice el componente de ticket
    setTimeout(() => {
      window.print();
    }, 100);
  }
}