import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Interface para los datos del ticket
export interface TicketData {
  fecha: string;
  hora: string;
  mesa: string;
  pedidoId: number;
  usuario?: string;
  items: TicketItem[];
  total: number;
  metodoPago: 'efectivo' | 'qr';
  tipoOrden?: 'para_llevar' | 'mesa';
}

export interface TicketItem {
  cantidad: number;
  nombre: string;
  precioUnitario: number;
  subtotal: number;
  notas?: string;
}

@Component({
  selector: 'app-ticket',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket.html',
  styleUrls: ['./ticket.css']
})
export class TicketComponent {
  @Input() ticketData: TicketData = {
    fecha: '',
    hora: '',
    mesa: '',
    pedidoId: 0,
    usuario: '',
    items: [],
    total: 0,
    metodoPago: 'efectivo'
  };
}
