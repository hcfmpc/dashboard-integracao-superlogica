import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { StatusApiService } from './status-api.service';
import { StatusCondominio } from '../models/execucao-status.model';

@Injectable({ providedIn: 'root' })
export class PollingService {
  private api = inject(StatusApiService);

  readonly status = signal<StatusCondominio[]>([]);
  readonly apiError = signal<string | null>(null);
  readonly lastUpdate = signal<Date | null>(null);

  readonly condominiosComFalha = computed(() =>
    this.status().filter(s =>
      s.status === 'FALHA_TEMPORARIA' || s.status === 'FALHA_PERMANENTE'
    )
  );

  readonly totalFinalizados = computed(() =>
    this.status().filter(s => s.status === 'FINALIZADO').length
  );

  constructor() {
    effect((onCleanup) => {
      this.fetch();
      const id = setInterval(() => this.fetch(), 15_000);
      onCleanup(() => clearInterval(id));
    });
  }

  fetch(): void {
    this.api.getStatus().subscribe({
      next: data => {
        this.status.set(data);
        this.lastUpdate.set(new Date());
        this.apiError.set(null);
      },
      error: () => this.apiError.set('Não foi possível conectar ao servidor.')
    });
  }
}
