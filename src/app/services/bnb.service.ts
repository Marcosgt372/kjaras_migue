import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BnbService {
  // Endpoint de Supabase Edge Function
  private supabaseUrl = 'https://erhgvxwzixtkronciypw.supabase.co/functions/v1/smooth-processor';

  constructor(private http: HttpClient) {}

  // GENERAR QR - Ahora usa el endpoint de Supabase
  async generarQR(monto: number, glosa: string = "Consumo Kjaras") {
    console.log('🔵 Generando QR para monto:', monto);
    
    try {
      const body = {
        action: 'generarQR',
        monto: monto,
        glosa: glosa
      };

      const response: any = await firstValueFrom(
        this.http.post(this.supabaseUrl, body)
      );

      console.log('✅ Respuesta de Supabase:', response);
      return response;
    } catch (error) {
      console.error('❌ Error al generar QR:', error);
      throw error;
    }
  }

  // CONSULTAR ESTADO - Usa el endpoint de Supabase
  async verificarEstadoQR(qrId: number) {
    console.log('🔍 Verificando estado QR ID:', qrId);
    
    try {
      const body = {
        action: 'verificarEstado',
        qrId: qrId
      };

      const response: any = await firstValueFrom(
        this.http.post(this.supabaseUrl, body)
      );

      console.log('✅ Estado QR:', response);
      return response;
    } catch (error) {
      console.error('❌ Error al verificar estado:', error);
      throw error;
    }
  }
}