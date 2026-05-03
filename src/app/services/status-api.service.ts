import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Condominio, ExecucaoHistorico, StatusCondominio } from '../models/execucao-status.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StatusApiService {
  private http = inject(HttpClient);
  private base = environment.apiBase;

  getStatus(): Observable<StatusCondominio[]> {
    return this.http.get<StatusCondominio[]>(`${this.base}/api/status`);
  }

  getCondominios(): Observable<Condominio[]> {
    return this.http.get<Condominio[]>(`${this.base}/api/condominios`);
  }

  getHistorico(id: number): Observable<ExecucaoHistorico[]> {
    return this.http.get<ExecucaoHistorico[]>(`${this.base}/api/execucoes/${id}`);
  }
}
