export type Rol = 'admin' | 'caja' | 'parrillero';

export type EstadoPedido = 'pendiente' | 'cocinando' | 'listo' | 'servido' | 'rechazado' | 'espera';

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  categoria: 'plato' | 'bebida' | 'guarnicion';
  imagen: string;
}

export interface ItemPedido {
  producto: Producto;
  cantidad: number;
  notas?: string; // Ej: "Bien cocido"
  subtotal: number;
}

export interface Pedido {
  id: number; // ID único del ticket (Supabase usa integers)
  mesa: string;
  items: ItemPedido[];
  total: number;
  estado: EstadoPedido;
  fecha: Date;
  creadoPor: string;
}