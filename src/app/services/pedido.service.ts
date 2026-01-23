import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Pedido as PedidoBase, ItemPedido } from '../models/types';

// Interface extendida para Producto con campos de BD
export interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  imagen: string;
  activo?: boolean;
}

// Interface para Cierre de Caja
export interface CierreCaja {
  id: number;
  fecha_inicio: string;
  fecha_fin?: string;
  monto_inicial: number;
  monto_final?: number;
  total_ventas?: number;
  usuario: string;
  estado: 'abierta' | 'cerrada';
}

// Interface extendida de Pedido para incluir campos de Supabase
export interface Pedido extends Omit<PedidoBase, 'fecha' | 'creadoPor' | 'items'> {
  created_at?: string;
  metodo_pago?: string;
  cierre_id?: number;
  opcion?: string; // Tipo de orden: para_llevar o mesa
  items: ItemPedido[];
}

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private supabase: SupabaseClient;

  // Stores Reactivos
  private _productos = new BehaviorSubject<Producto[]>([]);
  public productos$ = this._productos.asObservable();

  private _pedidosCocina = new BehaviorSubject<Pedido[]>([]);
  public pedidosCocina$ = this._pedidosCocina.asObservable();

  // Estado Reactivo de la Caja (Para que la UI sepa si bloquearse o no)
  private _cajaAbierta = new BehaviorSubject<boolean>(false);
  public cajaAbierta$ = this._cajaAbierta.asObservable();

  // ID de la caja actual (en memoria para acceso rápido)
  public cajaActualId: number | null = null;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    
    // Iniciar carga de datos
    this.cargarProductos();
    this.cargarPedidosCocina();
    
    // Verificar si hay caja abierta
    this.verificarCajaAbierta();
    
    // ACTIVAR REALTIME (La magia para la cocina)
    this.escucharCambiosPedidos();
  }

  // --- 1. PRODUCTOS (Para Caja y Admin) ---
  async cargarProductos() {
    const { data, error } = await this.supabase
      .from('productos')
      .select('*')
      .eq('activo', true)
      .order('nombre');
    
    if (data) this._productos.next(data);
  }

  async actualizarStock(id: number, nuevoStock: number) {
    await this.supabase.from('productos').update({ stock: nuevoStock }).eq('id', id);
    this.cargarProductos(); // Refrescar localmente
  }

  async actualizarPrecio(id: number, nuevoPrecio: number) {
    await this.supabase.from('productos').update({ precio: nuevoPrecio }).eq('id', id);
    this.cargarProductos();
  }

  async crearProducto(producto: Omit<Producto, 'id'>): Promise<Producto | null> {
    try {
      console.log('🔵 Intentando crear producto:', producto);
      
      const { data, error } = await this.supabase
        .from('productos')
        .insert([{
          nombre: producto.nombre,
          precio: producto.precio,
          categoria: producto.categoria,
          stock: producto.stock,
          imagen: producto.imagen,
          activo: producto.activo ?? true
        }])
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error de Supabase al crear producto:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return null;
      }
      
      if (!data) {
        console.error('❌ No se recibieron datos después de crear el producto');
        return null;
      }
      
      console.log('✅ Producto creado exitosamente:', data);
      
      // Recargar la lista de productos para que aparezca el nuevo
      await this.cargarProductos();
      
      return data;
    } catch (e: any) {
      console.error('❌ Excepción al crear producto:', {
        error: e,
        message: e?.message,
        stack: e?.stack
      });
      return null;
    }
  }

  // --- 2. CREAR PEDIDO (Para Caja) ---
  async crearPedido(mesa: string, total: number, itemsCarrito: any[], metodoPago: string = 'efectivo', tipoOrden: string = 'mesa') {
    // Validar que haya caja abierta
    if (!this.cajaActualId) {
      alert('⚠️ Debes ABRIR CAJA antes de vender.');
      return null;
    }

    try {
      // A. Insertar Cabecera con metodo_pago, cierre_id y opcion (tipo de orden)
      const { data: pedido, error } = await this.supabase
        .from('pedidos')
        .insert({ 
          mesa, 
          total, 
          estado: 'pendiente',
          metodo_pago: metodoPago,
          cierre_id: this.cajaActualId,
          opcion: tipoOrden // Guardar tipo de orden (para_llevar o mesa)
        })
        .select()
        .single();

      if (error || !pedido) throw error;

      // B. Preparar Detalles
      const detalles = itemsCarrito.map(item => ({
        pedido_id: pedido.id,
        producto_id: item.producto.id,
        cantidad: item.cantidad,
        precio_unitario: item.producto.precio,
        notas: item.notas
      }));

      // C. Insertar Detalles
      const { error: errorDetalle } = await this.supabase
        .from('detalle_pedidos')
        .insert(detalles);

      if (errorDetalle) throw errorDetalle;

      return pedido; // Éxito
    } catch (e) {
      console.error('Error al crear pedido:', e);
      return null;
    }
  }

  // --- 3. COCINA (Lectura y Realtime) ---
  async cargarPedidosCocina() {
    // Traemos pedidos con sus items y la info del producto
    const { data } = await this.supabase
      .from('pedidos')
      .select(`
        *,
        detalle_pedidos (
          cantidad, notas, precio_unitario,
          productos ( id, nombre, precio, categoria, imagen )
        )
      `)
      .in('estado', ['pendiente', 'cocinando']) // Solo lo activo
      .order('created_at', { ascending: true });

    if (data) {
      // Formateamos para que el HTML lo entienda fácil
      const pedidosFormateados = data.map((p: any) => ({
        ...p,
        items: (p.detalle_pedidos || []).map((d: any) => ({
          cantidad: d.cantidad,
          notas: d.notas || '',
          subtotal: d.cantidad * d.precio_unitario,
          producto: {
            id: d.productos.id,
            nombre: d.productos.nombre,
            precio: d.productos.precio,
            categoria: d.productos.categoria,
            imagen: d.productos.imagen
          }
        }))
      }));
      
      // FILTRAR: Solo mostrar pedidos que contengan al menos un plato
      const pedidosConPlatos = pedidosFormateados.filter(pedido => {
        return pedido.items.some((item: any) => item.producto.categoria === 'plato');
      });
      
      this._pedidosCocina.next(pedidosConPlatos);
    }
  }

  async cambiarEstadoPedido(id: number, nuevoEstado: string) {
    await this.supabase.from('pedidos').update({ estado: nuevoEstado }).eq('id', id);
    // No hace falta recargar manual, el Realtime lo hará
  }

  // --- GESTIÓN DE CAJA ---

  async verificarCajaAbierta() {
    // Buscamos si hay alguna caja sin fecha de fin
    const { data } = await this.supabase
      .from('cierres_caja')
      .select('*')
      .eq('estado', 'abierta')
      .maybeSingle();
    
    if (data) {
      this.cajaActualId = data.id;
      this._cajaAbierta.next(true);
    } else {
      this.cajaActualId = null;
      this._cajaAbierta.next(false);
    }
  }

  async abrirCaja(montoInicial: number, usuario: string) {
    // Primero verificar si ya hay una caja abierta
    const { data: cajaExistente } = await this.supabase
      .from('cierres_caja')
      .select('*')
      .eq('estado', 'abierta')
      .maybeSingle();
    
    if (cajaExistente) {
      // Ya hay una caja abierta, solo actualizar el estado local
      console.log('📦 Caja existente encontrada:', cajaExistente);
      this.cajaActualId = cajaExistente.id;
      this._cajaAbierta.next(true);
      console.log('✅ Estado actualizado a: true (caja existente)');
      return cajaExistente;
    }
    
    // No hay caja abierta, crear una nueva
    const { data, error } = await this.supabase
      .from('cierres_caja')
      .insert({ 
        monto_inicial: montoInicial, 
        usuario: usuario,
        estado: 'abierta',
        fecha_fin: null
      })
      .select()
      .single();
    
    if (data) {
      console.log('📦 Nueva caja creada:', data);
      this.cajaActualId = data.id;
      this._cajaAbierta.next(true);
      console.log('✅ Estado actualizado a: true (nueva caja)');
      return data;
    }
    
    if (error) {
      console.error('Error al abrir caja:', error);
      throw error;
    }
    
    return null;
  }

  async cerrarCaja(montoFinal: number) {
    if (!this.cajaActualId) return null;

    // Calcular ventas totales de este cierre antes de cerrar
    const ventas = await this.calcularVentasTurno(this.cajaActualId);

    const { data } = await this.supabase
      .from('cierres_caja')
      .update({ 
        fecha_fin: new Date().toISOString(), 
        monto_final: montoFinal,
        total_ventas: ventas,
        estado: 'cerrada'
      })
      .eq('id', this.cajaActualId)
      .select()
      .single();

    if (data) {
      this.cajaActualId = null;
      this._cajaAbierta.next(false);
      return data; // Retornamos datos para mostrar resumen
    }
    return null;
  }

  // --- HISTORIAL ---

  async obtenerHistorialHoy() {
    const hoy = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    const { data } = await this.supabase
      .from('pedidos')
      .select('*, detalle_pedidos(productos(nombre))')
      .gte('created_at', `${hoy}T00:00:00`) // Desde inicio del día
      .order('created_at', { ascending: false });
      
    return data || [];
  }

  async obtenerTodosPedidos() {
    const { data, error } = await this.supabase
      .from('pedidos')
      .select(`
        *,
        detalle_pedidos (
          id,
          producto_id,
          cantidad, 
          precio_unitario,
          subtotal,
          notas,
          productos ( nombre, categoria, imagen )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener todos los pedidos:', error);
      return [];
    }
    
    return data || [];
  }

  async obtenerVentasPorFecha(fecha: Date) {
    // Formato YYYY-MM-DD para comparar en SQL
    const fechaStr = fecha.toISOString().split('T')[0];
    
    // Rango del día: desde 00:00:00 hasta 23:59:59
    const inicio = `${fechaStr}T00:00:00`;
    const fin = `${fechaStr}T23:59:59`;

    const { data, error } = await this.supabase
      .from('pedidos')
      .select(`
        *,
        detalle_pedidos (
          cantidad, 
          precio_unitario,
          subtotal,
          productos ( nombre, categoria )
        )
      `)
      .gte('created_at', inicio)
      .lte('created_at', fin)
      .neq('estado', 'pendiente') // Opcional: si solo quieres ver lo cerrado/pagado
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error historial:', error);
      return [];
    }
    
    return data;
  }

  private async calcularVentasTurno(cierreId: number) {
    const { data } = await this.supabase
      .from('pedidos')
      .select('total')
      .eq('cierre_id', cierreId)
      .neq('estado', 'rechazado'); // No sumar rechazados
    
    return data?.reduce((acc, p) => acc + p.total, 0) || 0;
  }
  
  // --- ACTUALIZAR PEDIDO ---
  async actualizarPedido(pedidoId: number, datos: any) {
    try {
      console.log('🔵 Actualizando pedido:', pedidoId, datos);
      
      // 1. Actualizar datos principales del pedido
      const { error: errorPedido } = await this.supabase
        .from('pedidos')
        .update({
          mesa: datos.mesa,
          estado: datos.estado,
          metodo_pago: datos.metodo_pago,
          total: datos.total
        })
        .eq('id', pedidoId);
      
      if (errorPedido) {
        console.error('❌ Error al actualizar pedido:', errorPedido);
        throw errorPedido;
      }
      
      // 2. Eliminar items antiguos - IMPORTANTE: esperar a que termine
      console.log('🗑️ Eliminando items antiguos del pedido', pedidoId);
      const { data: deletedData, error: errorDelete } = await this.supabase
        .from('detalle_pedidos')
        .delete()
        .eq('pedido_id', pedidoId)
        .select(); // Añadido select para confirmar eliminación
      
      if (errorDelete) {
        console.error('❌ Error al eliminar items antiguos:', errorDelete);
        throw errorDelete;
      }
      
      console.log('✅ Items eliminados:', deletedData?.length || 0);
      
      // 3. Insertar items nuevos/actualizados
      const itemsParaInsertar = datos.items.map((item: any) => ({
        pedido_id: pedidoId,
        producto_id: item.producto_id || 1, // ID por defecto si es nuevo
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        notas: item.notas || ''
      }));
      
      console.log('➕ Insertando', itemsParaInsertar.length, 'items nuevos');
      
      const { data: insertedData, error: errorInsert } = await this.supabase
        .from('detalle_pedidos')
        .insert(itemsParaInsertar)
        .select();
      
      if (errorInsert) {
        console.error('❌ Error al insertar nuevos items:', errorInsert);
        throw errorInsert;
      }
      
      console.log('✅ Items insertados:', insertedData?.length || 0);
      console.log('✅ Pedido actualizado correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error en actualizarPedido:', error);
      throw error;
    }
  }

  // --- REALTIME ---
  private escucharCambiosPedidos() {
    this.supabase.channel('public:pedidos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, (payload) => {
        console.log('⚡ Cambio en BD detectado:', payload);
        this.cargarPedidosCocina(); // Recargar lista automáticamente
      })
      .subscribe();
  }
}