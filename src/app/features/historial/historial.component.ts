import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PedidoService } from '../../services/pedido.service';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
            </tr>
          </tbody>
        </table>
        
        <div *ngIf="pedidosFiltrados.length === 0" class="p-10 text-center text-gray-400">
          <i class="fa-solid fa-inbox text-4xl mb-4"></i>
          <p class="font-bold">No hay pedidos que coincidan con los filtros.</p>
        </div>
      </div>

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

  constructor(
    private pedidoService: PedidoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  async cargarDatos() {
    this.todosPedidos = await this.pedidoService.obtenerTodosPedidos();
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

  async actualizarDatos() {
    this.cargando = true;
    try {
      await this.cargarDatos();
    } finally {
      this.cargando = false;
    }
  }

  volverACaja() {
    this.router.navigate(['/caja']);
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
}